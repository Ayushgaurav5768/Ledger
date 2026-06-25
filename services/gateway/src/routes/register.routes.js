const express = require("express");
const crypto = require("crypto");
const ApiKey = require("../models/ApiKey");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { backendUrl } = req.body;

    if (!backendUrl) {
      return res.status(400).json({ error: "backendUrl is required" });
    }

    const key = crypto.randomBytes(32).toString("hex");

    const doc = await ApiKey.create({ key, backendUrl });

    res.status(201).json({ key: doc.key });
  } catch (err) {
    next(err);
  }
});

module.exports = router;