const express = require("express");
const auth = require("../middleware/auth");
const rateLimiter = require("../middleware/rateLimiter");
const meterRequest = require("../metering/meterRequest");

const router = express.Router();

router.all("/api/*", auth, rateLimiter, meterRequest);

module.exports = router;
