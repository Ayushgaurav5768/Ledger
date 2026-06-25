const tiers = require("./tiers");

function calculateBill(usageCount, tierName) {
  const tier = tiers[tierName];
  if (!tier) return 0;
  if (usageCount <= tier.freeRequests) return 0;
  const amount = (usageCount - tier.freeRequests) * tier.ratePerRequest;
  return Math.round(amount * 100) / 100;
}

module.exports = calculateBill;
