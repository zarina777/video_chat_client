import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});
export default api;
