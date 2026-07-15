const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello from Vyqour App!');
});

app.listen(port, () => {
  console.log(`Vyqour app listening at http://localhost:${port}`);
});