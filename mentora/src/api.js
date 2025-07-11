// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v2",  // or whatever your backend URL is
});

export default api;
