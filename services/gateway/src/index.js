require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const { redis, loadTokenBucketScript } = require("./config/redis");
const proxyRoutes = require("./routes/proxy.routes");
const registerRoutes = require("./routes/register.routes");
const billingRoutes = require("./routes/billing.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "gateway", timestamp: new Date().toISOString() });
});

app.use(registerRoutes);
app.use(proxyRoutes);
app.use(billingRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  await loadTokenBucketScript();
  app.listen(PORT, () => {
    console.log("Gateway running on port", PORT);
  });
}

start();
