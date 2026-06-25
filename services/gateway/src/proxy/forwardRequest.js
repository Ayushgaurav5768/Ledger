const axios = require("axios");

async function forwardRequest(req) {
  const response = await axios({
    url: req.apiKeyDoc.backendUrl + req.originalUrl,
    method: req.method,
    headers: { ...req.headers },
    data: req.body,
    timeout: 10000,
    validateStatus: () => true,
  });

  return { status: response.status, data: response.data };
}

module.exports = forwardRequest;