const UsageLog = require("../models/UsageLog");

function getBillingPeriod() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return y + "-" + m;
}

async function createPendingLog(apiKey, requestId) {
  try {
    return await UsageLog.create({
      requestId,
      apiKey,
      status: "pending",
      billingPeriod: getBillingPeriod(),
    });
  } catch (err) {
    if (err.code === 11000) {
      return await UsageLog.findOne({ requestId }).lean();
    }
    throw err;
  }
}

async function markLogStatus(requestId, status) {
  await UsageLog.updateOne({ requestId }, { $set: { status } });
}

module.exports = { createPendingLog, markLogStatus };
