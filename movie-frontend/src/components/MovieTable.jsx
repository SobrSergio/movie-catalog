// src/components/MovieTable.jsx

import React from 'react';

/**
 * Компонент отображает таблицу фильмов.
 *
 * Props:
 *   movies: Array — массив фильмов из API
 *   isLoading: boolean — флаг загрузки данных
 *   onRowClick: function(id) — вызывается при клике на строку
 *
 * Формат элементов массива movies: {
 *   id, title, year, director, rating
 * }
 */
function MovieTable({ movies, isLoading, onRowClick }) {
  if (isLoading) {
    return <p className="text-gray-400 text-center py-8">Загрузка...</p>;
  }

  if (movies.length === 0) {
    return (
      <p className="text-gray-400 text-center py-8">
        По данным параметрам ничего не найдено.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto text-left border-collapse">
        <thead>
          <tr className="text-yellow-400 border-b border-gray-600 uppercase text-sm">
            <th className="p-2">ID</th>
            <th className="p-2">Название</th>
            <th className="p-2">Год</th>
            <th className="p-2">Режиссёр</th>
            <th className="p-2">Рейтинг</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr
              key={movie.id}
              onClick={() => onRowClick(movie.id)}
              className="cursor-pointer border-b border-gray-700 hover:bg-[#1e2228] hover:text-white"
            >
              <td className="p-2 py-3 text-gray-400">{movie.id}</td>
              <td className="p-2 py-3 text-gray-200">{movie.title}</td>
              <td className="p-2 py-3 text-gray-200">{movie.year}</td>
              <td className="p-2 py-3 text-gray-200">{movie.director}</td>
              <td className="p-2 py-3 text-gray-200">{movie.rating}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MovieTable;
