#!/usr/bin/env node
/**
 * Lightweight terminal coding agent for Termux.
 * Talks to NVIDIA NIM (OpenAI-compatible) API.
 * Automatically falls back to the next model if one is degraded/overloaded.
 * Usage: node agent.js
 */

const readline = require("readline");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

// PROJECT_ROOT is always the parent of the folder this script lives in
// (i.e. if this file is at ~/vyqour-app/.agent/agent.js, PROJECT_ROOT is ~/vyqour-app).
// This is fixed regardless of what directory you run `node agent.js` from,
// so the agent can never accidentally create files inside .agent/ itself.
const SCRIPT_DIR = __dirname;
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");
const PROGRESS_FILE = path.join(SCRIPT_DIR, ".agent-progress.json");

console.log(`[config] Agent script dir: ${SCRIPT_DIR}`);
console.log(`[config] Project root (all file paths are relative to this): ${PROJECT_ROOT}`);

if (!NVIDIA_API_KEY) {
  console.error("ERROR: NVIDIA_API_KEY not set. Add it to ~/.bashrc and run `source ~/.bashrc`.");
  process.exit(1);
}

// ---- progress tracking (so work resumes after a quota/rate-limit failure) ----
function loadProgress() {
  if (!fs.existsSync(PROGRESS_FILE)) {
    return { tasks: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
  } catch {
    return { tasks: [] };
  }
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), "utf8");
}

function startTask(progress, description) {
  const task = {
    id: progress.tasks.length + 1,
    description,
    status: "in_progress",
    startedAt: new Date().toISOString(),
    completedAt: null,
    modelUsed: null,
  };
  progress.tasks.push(task);
  saveProgress(progress);
  return task;
}

function completeTask(progress, task, modelUsed) {
  task.status = "completed";
  task.completedAt = new Date().toISOString();
  task.modelUsed = modelUsed;
  saveProgress(progress);
}

function failTask(progress, task, reason) {
  task.status = "failed";
  task.failReason = reason;
  saveProgress(progress);
}

// Models tried in this order. First one that responds successfully wins.
// Edit this list any time based on what's live in your account.
const MODEL_PRIORITY = [
  "meta/llama-3.1-8b-instruct", // final fallback, always usually available
];

const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: NVIDIA_API_KEY,
});

// ---- simple file tools the model can request ----
function readFile(relPath) {
  const full = path.join(PROJECT_ROOT, relPath);
  if (!fs.existsSync(full)) return `ERROR: file not found: ${relPath}`;
  return fs.readFileSync(full, "utf8");
}

const ALLOWED_PREFIXES = ["apps/", "packages/", "prisma/"];
// Top-level files (not inside a folder) are also allowed, e.g. README.md, .gitignore
function isPathAllowed(relPath) {
  const normalized = relPath.replace(/^\.\//, "");
  if (!normalized.includes("/")) return true; // top-level file, fine
  return ALLOWED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function writeFile(relPath, content) {
  if (!isPathAllowed(relPath)) {
    return `BLOCKED: "${relPath}" does not start with apps/, packages/, or prisma/. This looks like a monorepo path mistake. Re-check the correct path (e.g. apps/web/... or apps/server/...) and try again with WRITE_FILE using the corrected path.`;
  }
  const full = path.join(PROJECT_ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  return `OK: wrote ${relPath} (${content.length} chars)`;
}

function listDir(relPath = ".") {
  const full = path.join(PROJECT_ROOT, relPath);
  if (!fs.existsSync(full)) return `ERROR: dir not found: ${relPath}`;
  return fs.readdirSync(full).join("\n");
}

// ---- conversation state ----
const history = [
  {
    role: "system",
    content: `You are a coding agent working inside the project at ${PROJECT_ROOT}.

CRITICAL PATH RULE: This is a monorepo. ALL paths you write to MUST start with one of these exact prefixes:
- apps/web/        (Next.js storefront)
- apps/admin/       (Next.js admin panel)
- apps/server/       (Fastify backend)
- packages/shared/   (shared code)
- prisma/            (database schema)

NEVER write to a bare path like "app/page.tsx" or "components/Hero.tsx" or "src/routes/cart.ts" —
these are WRONG. The correct equivalents are "apps/web/app/page.tsx", "apps/web/components/Hero.tsx",
"apps/server/src/routes/cart.ts". Always double check your WRITE_FILE path starts with apps/ or
packages/ or prisma/ before writing. If you are unsure which app a file belongs to, use LIST_DIR on
"apps" first to check the existing structure.

When you need to read a file, respond ONLY with: READ_FILE: <relative_path>
When you need to list a directory, respond ONLY with: LIST_DIR: <relative_path>
When you want to write/edit a file, respond ONLY with:
WRITE_FILE: <relative_path>
<<<CONTENT_START>>>
<full file content here>
<<<CONTENT_END>>>
Otherwise, just respond normally in plain text with explanations or plans.
Only do ONE action per response. Wait for the result before the next action.`,
  },
];

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(promptText) {
  return new Promise((resolve) => rl.question(promptText, resolve));
}

// Tries each model in MODEL_PRIORITY until one succeeds.
// Returns { content, modelUsed }.
async function callModelWithFallback() {
  const errors = [];
  for (const model of MODEL_PRIORITY) {
    try {
      const resp = await client.chat.completions.create({
        model,
        messages: history,
        max_tokens: 2048,
        temperature: 0.3,
      });
      return { content: resp.choices[0].message.content, modelUsed: model };
    } catch (err) {
      const msg = err?.error?.message || err?.message || String(err);
      errors.push(`${model} -> ${msg}`);
      // try next model
      continue;
    }
  }
  throw new Error("All models failed:\n" + errors.join("\n"));
}

async function handleModelOutput(text) {
  const readMatch = text.match(/^READ_FILE:\s*(.+)$/m);
  const listMatch = text.match(/^LIST_DIR:\s*(.+)$/m);
  const writeMatch = text.match(/^WRITE_FILE:\s*(.+)\n<<<CONTENT_START>>>\n([\s\S]*?)\n<<<CONTENT_END>>>/m);

  if (writeMatch) {
    const [, relPath, content] = writeMatch;
    const confirm = await ask(`\nAgent wants to WRITE to "${relPath.trim()}". Allow? (y/n): `);
    if (confirm.trim().toLowerCase() === "y") {
      const result = writeFile(relPath.trim(), content);
      console.log(result);
      history.push({ role: "user", content: `TOOL_RESULT: ${result}` });
    } else {
      history.push({ role: "user", content: "TOOL_RESULT: user denied write permission." });
    }
    return true;
  }

  if (readMatch) {
    const relPath = readMatch[1].trim();
    const content = readFile(relPath);
    console.log(`\n[read ${relPath}]`);
    history.push({ role: "user", content: `TOOL_RESULT (${relPath}):\n${content}` });
    return true;
  }

  if (listMatch) {
    const relPath = listMatch[1].trim();
    const content = listDir(relPath);
    console.log(`\n[listed ${relPath}]`);
    history.push({ role: "user", content: `TOOL_RESULT (${relPath}):\n${content}` });
    return true;
  }

  return false;
}

async function main() {
  console.log(`Agent ready. Project: ${PROJECT_ROOT}`);
  console.log(`Model priority: ${MODEL_PRIORITY.join(" -> ")}`);

  const progress = loadProgress();
  const incomplete = progress.tasks.filter((t) => t.status === "in_progress" || t.status === "failed");

  if (incomplete.length > 0) {
    console.log(`\n⚠ Found ${incomplete.length} unfinished task(s) from a previous session:`);
    incomplete.forEach((t) => console.log(`  #${t.id} [${t.status}] ${t.description}`));
    const resume = await ask(`\nResume the last unfinished task? (y/n): `);
    if (resume.trim().toLowerCase() === "y") {
      const lastTask = incomplete[incomplete.length - 1];
      history.push({
        role: "user",
        content: `RESUME CONTEXT: A previous task was interrupted (likely due to a model quota/rate limit). The task was: "${lastTask.description}". Continue this task from where it likely left off. If unsure what was already done, first use LIST_DIR and READ_FILE to check current project state before proceeding.`,
      });
      console.log(`\nResuming task #${lastTask.id}...\n`);
    }
  }

  console.log(`Type your request, or "exit" to quit.\n`);

  while (true) {
    const userInput = await ask("you> ");
    if (userInput.trim().toLowerCase() === "exit") break;

    history.push({ role: "user", content: userInput });
    const currentTask = startTask(progress, userInput);

    // allow up to 5 chained tool actions per user turn
    let taskFailed = false;
    for (let i = 0; i < 5; i++) {
      let reply, modelUsed;
      try {
        const result = await callModelWithFallback();
        reply = result.content;
        modelUsed = result.modelUsed;
      } catch (err) {
        console.error(`\n[ERROR] All models exhausted/failed: ${err.message}`);
        console.error(`[SAVED] This task is marked incomplete. Restart the agent and choose "resume" to continue it.\n`);
        failTask(progress, currentTask, err.message);
        taskFailed = true;
        break;
      }

      history.push({ role: "assistant", content: reply });
      console.log(`\n[model: ${modelUsed}]`);
      console.log(`agent> ${reply}\n`);

      const didTool = await handleModelOutput(reply);
      if (!didTool) break; // plain text response, wait for next user input
    }

    if (!taskFailed) {
      completeTask(progress, currentTask, currentTask.modelUsed || "unknown");
    }
  }

  rl.close();
}

main();

