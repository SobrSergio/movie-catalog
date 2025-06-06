// src/api/movies.js

import axios from 'axios';

const API_URL = 'http://localhost:8080/api/movies/';

/**
 * Получить список фильмов. Параметры:
 *   title: string — поиск по названию (LIKE)
 *   director: string — поиск по режиссёру (LIKE)
 *   year: number — точное совпадение года выпуска
 *   min_rating: number — фильмы с рейтингом >= min_rating
 *   sort_by: string — поле сортировки (id, title, year, rating)
 *   order: string — asc или desc
 *   page: number — номер страницы (1-based)
 *   limit: number — количество записей на странице
 *
 * @param {Object} params — необязательные параметры фильтрации/сортировки/пагинации.
 * @example
 *   fetchMovies({ director: 'Nolan', min_rating: 8, page: 2, limit: 5 });
 * @returns {Promise<AxiosResponse>} — промис с ответом сервера.
 */
export function fetchMovies(params = {}) {
  return axios.get(API_URL, { params });
}

/**
 * Получить детали фильма по ID.
 * @param {number|string} id
 */
export function fetchMovieById(id) {
  return axios.get(`${API_URL}${id}`);
}

/**
 * Добавить новый фильм.
 * @param {Object} data — объект с полями:
 * @returns {Promise<AxiosResponse>} — промис с добавлённым объектом фильма.
 */
export function createMovie(data) {
  return axios.post(API_URL, data);
}


/**
 * Экспорт всех фильмов в JSON.
 * Возвращает файл для скачивания.
 */
export function exportMovies() {
  return axios.get(`${API_URL}export`, { responseType: 'blob' });
}


/**
 * Импорт списка фильмов из массива объектов.
 * @param {Array} array — массив фильмов
 */
export function importMovies(array) {
  return axios.post(`${API_URL}import`, array);
}