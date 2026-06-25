const express = require("express");
const ApiKey = require("../models/ApiKey");
const { redis } = require("../config/redis");
const calculateBill = require("../pricing/calculateBill");

const router = express.Router();

function getBillingPeriod() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return y + "-" + m;
}

function tierName(tier) {
  if (tier === "free") return "free";
  return "paid";
}

router.get("/billing/:apiKey", async (req, res, next) => {
  try {
    const doc = await ApiKey.findOne({ key: req.params.apiKey }).lean();
    if (!doc) return res.status(404).json({ error: "API key not found" });

    const usageCount = parseInt(
      await redis.get("usage:" + doc.key + ":" + getBillingPeriod()),
      10
    ) || 0;

    const amountDue = calculateBill(usageCount, tierName(doc.tier));

    res.json({ apiKey: doc.key, tier: doc.tier, usageCount, amountDue });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
