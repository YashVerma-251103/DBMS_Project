import axios from 'axios';

// Set at build time. Docker builds pass '/api' so nginx can reverse-proxy to the
// backend on the same origin; a bare `npm start` falls back to the dev server.
const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE,
});

export default API_BASE;
