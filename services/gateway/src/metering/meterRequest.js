const crypto = require("crypto");
const { redis } = require("../config/redis");
const { createPendingLog, markLogStatus } = require("./writeAheadLog");
const forwardRequest = require("../proxy/forwardRequest");

function getBillingPeriod() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return y + "-" + m;
}

module.exports = async function meterRequest(req, res, next) {
  const requestId = crypto.randomUUID();
  const apiKey = req.apiKeyDoc.key;
  const billingPeriod = getBillingPeriod();

  try {
    await createPendingLog(apiKey, requestId);

    const result = await forwardRequest(req);

    if (result.status >= 200 && result.status < 500) {
      const counterKey = "usage:" + apiKey + ":" + billingPeriod;
      await redis.incr(counterKey);
      await markLogStatus(requestId, "complete");
      res.status(result.status).json(result.data);
    } else {
      await markLogStatus(requestId, "failed");
      res.status(result.status).json(result.data);
    }
  } catch (err) {
    await markLogStatus(requestId, "failed").catch(() => {});
    res.status(502).json({ error: "Bad Gateway" });
  }
};
