import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    concurrent_load: {
      executor: "constant-vus",
      vus: 20,
      duration: "10s",
    },
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || "http://localhost:8080";
  const apiKey = __ENV.API_KEY;

  const res = http.get(baseUrl + "/api/test", {
    headers: { "x-api-key": apiKey },
  });

  check(res, {
    "status is 200 or 429": (r) => r.status === 200 || r.status === 429,
  });
}
