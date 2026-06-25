const mongoose = require("mongoose");

const UsageLogSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  apiKey: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["pending", "complete", "failed"],
    default: "pending",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  billingPeriod: {
    type: String,
    required: true,
  },
}, { versionKey: false });

module.exports = mongoose.model("UsageLog", UsageLogSchema);
