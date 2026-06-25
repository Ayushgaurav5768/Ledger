module.exports = function registerUsageRoutes(app) {
  app.get('/usage/health', (req, res) => res.json({ status: 'ok' }));
};
