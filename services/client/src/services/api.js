import axios from "axios";

const http = axios.create();

export async function registerApiKey(backendUrl) {
  const res = await http.post("/register", { backendUrl });
  return res.data.key;
}

export async function getBilling(apiKey) {
  const res = await http.get("/billing/" + apiKey);
  return res.data;
}

