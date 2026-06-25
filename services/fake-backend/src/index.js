const express = require("express");

const app = express();

app.get("/api/test", async (req, res) => {
  const delay = parseInt(req.query.delay, 10) || 0;

  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  res.json({ message: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log("Fake Backend running on port", PORT);
});
