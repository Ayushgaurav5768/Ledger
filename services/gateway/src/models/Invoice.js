const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
  {
    apiKeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiKey",
      required: true,
      index: true,
    },
    billingPeriod: {
      type: String,
      required: true,
      index: true,
    },
    totalRequests: {
      type: Number,
      required: true,
    },
    tier: {
      type: String,
      required: true,
    },
    amountDue: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
  }
);

InvoiceSchema.index({ apiKeyId: 1, billingPeriod: 1 }, { unique: true });

module.exports = mongoose.model("Invoice", InvoiceSchema);
