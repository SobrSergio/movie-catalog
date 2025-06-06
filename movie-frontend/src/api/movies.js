// src/api/movies.js
import axios from 'axios';

// Общий инстанс для /api/movies
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api/movies',
  timeout: 5000
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('movie_app_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('movie_app_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Общий инстанс для /api/favorites
const axiosInstanceFavorites = axios.create({
  baseURL: 'http://localhost:8080/api/favorites',
  timeout: 5000
});

axiosInstanceFavorites.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('movie_app_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstanceFavorites.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('movie_app_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ───── Основные фильмы ─────

export async function fetchMovies(params = {}) {
  return axiosInstance.get('/', { params });
}

export async function fetchMovieById(id) {
  return axiosInstance.get(`/${id}`);
}

export async function createMovie(data) {
  return axiosInstance.post('/', data);
}

export async function updateMovie(id, data) {
  return axiosInstance.put(`/${id}`, data);
}

export async function deleteMovie(id) {
  return axiosInstance.delete(`/${id}`);
}

export async function exportMovies() {
  return axiosInstance.get('/export', { responseType: 'blob' });
}

export async function importMovies(array) {
  return axiosInstance.post('/import', array);
}

// ───── Избранное (Favorites) ─────

export async function fetchFavorites() {
  return axiosInstanceFavorites.get('/');
}

export async function addFavorite(id) {
  return axiosInstanceFavorites.post(`/${id}`);
}

export async function removeFavorite(id) {
  return axiosInstanceFavorites.delete(`/${id}`);
}
