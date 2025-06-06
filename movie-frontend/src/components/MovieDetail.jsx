// src/components/MovieDetail.jsx

import React, { useEffect, useState } from 'react';
import { fetchMovieById } from '../api/movies';

function MovieDetail({ movieId, onClose }) {
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!movieId) return;
    setIsLoading(true);
    fetchMovieById(movieId)
      .then((res) => {
        setMovie(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error('Ошибка при получении деталей фильма:', err);
        setError('Не удалось загрузить детали фильма');
        setMovie(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [movieId]);

  if (!movieId) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#161b22] rounded-lg p-6 max-w-md w-full mx-4">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white float-right"
        >
          ✕
        </button>
        {isLoading && (
          <p className="text-gray-400 text-center py-4">Загрузка...</p>
        )}
        {error && <p className="text-red-500 text-center py-4">{error}</p>}
        {movie && (
          <div className="text-gray-200 space-y-2">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-4">
              {movie.title}
            </h2>
            <p>
              <span className="font-medium">ID:</span> {movie.id}
            </p>
            <p>
              <span className="font-medium">Год:</span> {movie.year}
            </p>
            <p>
              <span className="font-medium">Режиссёр:</span> {movie.director}
            </p>
            <p>
              <span className="font-medium">Рейтинг:</span> {movie.rating}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieDetail;
