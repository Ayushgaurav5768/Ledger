require("dotenv").config();

const mongoose = require("mongoose");
const Redis = require("ioredis");
const UsageLog = require("../models/UsageLog");

const apiKey = process.argv[2];

if (!apiKey) {
  console.error("Usage: node src/scripts/verifyCount.js <api-key>");
  process.exit(1);
}

const now = new Date();
const y = now.getUTCFullYear();
const m = String(now.getUTCMonth() + 1).padStart(2, "0");
const billingPeriod = y + "-" + m;

async function main() {
  await mongoose.connect(process.env.MONGO_URL);

  const redis = new Redis(process.env.REDIS_URL);

  const mongoCount = await UsageLog.countDocuments({
    apiKey,
    status: "complete",
  });

  const redisKey = "usage:" + apiKey + ":" + billingPeriod;
  const redisCount = parseInt(await redis.get(redisKey), 10) || 0;

  console.log("MongoDB 'complete' count:", mongoCount);
  console.log("Redis counter (" + redisKey + "):", redisCount);
  console.log("Match:", mongoCount === redisCount);

  await mongoose.disconnect();
  redis.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
