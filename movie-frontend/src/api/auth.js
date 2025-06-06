// src/api/auth.js
import axios from 'axios';

const AUTH_URL = 'http://localhost:8080/api/auth';

export function registerUser({ username, password }) {
  return axios.post(`${AUTH_URL}/register`, { username, password });
}

export function loginUser({ username, password }) {
  return axios.post(`${AUTH_URL}/login`, { username, password });
}
