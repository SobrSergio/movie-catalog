// src/components/MovieTable.jsx
import React from 'react';
import {
  updateMovie,
  deleteMovie,
  addFavorite,
  removeFavorite
} from '../api/movies';

import {
  PencilSquareIcon,
  TrashIcon,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

/**
 * MovieTable отображает табличку фильмов с колонками:
 *   • ID, Название, Год, Режиссёр, Рейтинг
 *   • “Избр.” – для добавления/удаления из избранного
 *   • “Действия” – редактировать/удалить запись о фильме
 *
 * Props:
 *   movies: Array — массив { id, title, year, director, rating }
 *   isLoading: boolean — флаг загрузки
 *   onRowClick: function(id) — открыть детали фильма
 *   favoriteIds: Set<number> — набор ID фильмов, уже в избранном
 *   onToggleFavorite: function() — (старый пропс, не используется здесь)
 *   onMovieDeleted: function() — колбэк, который вызывается после удаления фильма
 *   onMovieUpdated: function() — колбэк, который вызывается после редактирования
 *   loadFavorites: function() — функция для перезагрузки избранного (см. App.jsx)
 */
function MovieTable({
  movies,
  isLoading,
  onRowClick,
  favoriteIds = new Set(),
  onMovieDeleted,
  onMovieUpdated,
  loadFavorites
}) {
  if (isLoading) {
    return <p className="text-gray-400 text-center py-8">Загрузка...</p>;
  }

  if (!movies || movies.length === 0) {
    return (
      <p className="text-gray-400 text-center py-8">
        По данным параметрам ничего не найдено.
      </p>
    );
  }

  // Удалить фильм
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Точно удалить этот фильм?')) return;
    try {
      await deleteMovie(id);
      if (onMovieDeleted) {
        onMovieDeleted();
      }
    } catch (err) {
      console.error('Ошибка при удалении фильма:', err);
      alert('Не удалось удалить фильм');
    }
  };

  // Редактировать только название (пример с prompt)
  const handleEdit = async (movie, e) => {
    e.stopPropagation();
    const newTitle = window.prompt('Новое название:', movie.title);
    if (newTitle === null) return; // Отмена
    const trimmed = newTitle.trim();
    if (trimmed === '') return;
    try {
      await updateMovie(movie.id, {
        title: trimmed,
        year: movie.year,
        director: movie.director,
        rating: movie.rating
      });
      if (onMovieUpdated) {
        onMovieUpdated();
      }
    } catch (err) {
      console.error('Ошибка при обновлении фильма:', err);
      alert('Не удалось обновить фильм');
    }
  };

  // Тоггл “избранное”
  const handleToggleFavorite = async (movieId, e) => {
    e.stopPropagation();
    try {
      if (favoriteIds.includes(movieId)) {
        // если уже есть — удалить
        await removeFavorite(movieId);
      } else {
        // нет в избранном — добавить
        await addFavorite(movieId);
      }
      // сразу перезагружаем актуальный список favoriteIds
      if (loadFavorites) {
        await loadFavorites();
      }
    } catch (err) {
      console.error('Ошибка при переключении избранного:', err);
      alert('Не удалось обновить избранное');
    }
  };

  return (
    <div className="overflow-x-auto max-w-6xl mx-auto">
      <table className="w-full table-auto text-left border-collapse">
        <thead>
          <tr className="text-yellow-400 border-b border-gray-600 uppercase text-sm">
            <th className="p-2">ID</th>
            <th className="p-2">Название</th>
            <th className="p-2">Год</th>
            <th className="p-2">Режиссёр</th>
            <th className="p-2">Рейтинг</th>
            <th className="p-2 text-center">Избр.</th>
            <th className="p-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr
              key={movie.id}
              className="cursor-pointer border-b border-gray-700 hover:bg-[#1e2228] hover:text-white"
              onClick={() => onRowClick && onRowClick(movie.id)}
            >
              <td className="p-2 py-3 text-gray-400">{movie.id}</td>
              <td className="p-2 py-3 text-gray-200">{movie.title}</td>
              <td className="p-2 py-3 text-gray-200">{movie.year}</td>
              <td className="p-2 py-3 text-gray-200">{movie.director}</td>
              <td className="p-2 py-3 text-gray-200">{movie.rating}</td>

              {/* ─── Избранное ─── */}
              <td
                className="p-2 py-3 text-center"
                onClick={(e) => handleToggleFavorite(movie.id, e)}
              >
              {favoriteIds.includes(movie.id) ? (
                <StarSolid className="h-6 w-6 text-yellow-400" />
              ) : (
                <StarOutline className="h-6 w-6 text-gray-500 hover:text-yellow-400" />
              )}
              </td>

              {/* ─── Действия: Edit / Delete ─── */}
              <td className="p-2 py-3 flex space-x-2">
                <button
                  onClick={(e) => handleEdit(movie, e)}
                  className="p-1 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => handleDelete(movie.id, e)}
                  className="p-1 bg-red-600 text-white rounded hover:bg-red-500 transition"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MovieTable;
