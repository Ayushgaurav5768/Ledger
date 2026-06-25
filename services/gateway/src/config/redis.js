const Redis = require("ioredis");
const fs = require("fs");
const path = require("path");

const redis = new Redis(process.env.REDIS_URL);

let tokenBucketSha = null;

async function loadTokenBucketScript() {
  const script = fs.readFileSync(
    path.join(__dirname, "..", "lua", "tokenBucket.lua"),
    "utf8"
  );
  tokenBucketSha = await redis.script("LOAD", script);
}

function getTokenBucketSha() {
  return tokenBucketSha;
}

module.exports = { redis, loadTokenBucketScript, getTokenBucketSha };
