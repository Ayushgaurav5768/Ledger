const { redis, getTokenBucketSha } = require("../config/redis");

const tiers = {
  free: { capacity: 10, refillRate: 1 },
  pro: { capacity: 100, refillRate: 20 },
  enterprise: { capacity: 100, refillRate: 20 },
};

module.exports = async function rateLimiter(req, res, next) {
  try {
    const tier = tiers[req.apiKeyDoc.tier] || tiers.free;
    const key = "rate_limit:" + req.apiKeyDoc.key;
    const now = Date.now() / 1000;

    const result = await redis.evalsha(
      getTokenBucketSha(),
      1,
      key,
      String(tier.capacity),
      String(tier.refillRate),
      String(now),
      "1"
    );

    const allowed = result[0] === 1;

    if (!allowed) {
      res.set("Retry-After", "1");
      return res.status(429).json({ error: "rate limit exceeded" });
    }

    next();
  } catch (err) {
    console.error("Rate limiter error:", err.message);
    next();
  }
};
