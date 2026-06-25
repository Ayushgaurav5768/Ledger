module.exports = function registerBillingRoutes(app) {
  app.get('/billing/health', (req, res) => res.json({ status: 'ok' }));
};
