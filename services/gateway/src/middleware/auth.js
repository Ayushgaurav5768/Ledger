const ApiKey = require("../models/ApiKey");

module.exports = async function (req, res, next) {
  try {
    const key = req.header("x-api-key");

    if (!key) {
      return res.status(401).json({ error: "Missing API Key" });
    }

    const apiKeyDoc = await ApiKey.findOne({ key }).lean();

    if (!apiKeyDoc) {
      return res.status(401).json({ error: "Invalid API Key" });
    }

    if (apiKeyDoc.disabled) {
      return res.status(403).json({ error: "API key disabled" });
    }

    req.apiKeyDoc = apiKeyDoc;
    next();
  } catch (err) {
    next(err);
  }
};