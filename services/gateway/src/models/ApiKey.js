const mongoose = require("mongoose");

const ApiKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  backendUrl: {
    type: String,
    required: true,
  },
  tier: {
    type: String,
    default: "free",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("ApiKey", ApiKeySchema);