import "dotenv/config";
import app from "./app.js";

const port = parseInt(process.env.PORT || "4000", 10);

const start = async () => {
  try {
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info(`Server listening on http://0.0.0.0:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();