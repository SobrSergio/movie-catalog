// src/App.jsx
import React, { useEffect, useState, useCallback } from 'react';
import Header from './components/Header';
import Filters from './components/Filters';
import MovieForm from './components/MovieForm';
import MovieTable from './components/MovieTable';
import Pagination from './components/Pagination';
import MovieDetail from './components/MovieDetail';
import ExportImport from './components/ExportImport';

import Login from './components/Login';
import Register from './components/Register';

import {
  fetchMovies,
  fetchFavorites,
  addFavorite,
  removeFavorite
} from './api/movies';

function App() {
  // 1. Аутентификация
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('movie_app_token')
  );

  // 2. Если пользователь залогинен, храним имя/ID (опционально).
  //    Можно получить из токена (JWT), но для простоты мы его распарсим разово, если нужно.
  //    Пока просто флаг.

  // 3. Состояния для фильтров/сортировки
  const [filters, setFilters] = useState({
    title: '',
    director: '',
    year: '',
    min_rating: '',
    sort_by: 'id',
    order: 'asc',
  });

  // 4. Состояния пагинации
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // 5. Данные (фильмы) и флаг загрузки
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  // 6. Детали фильма (модальное окно)
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  // 7. Список избранного (для того, чтобы отметить “звёздочкой”)
  //    Оно также позволяет проверять «нажат ли уже» конкретный фильм?
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Загрузка списка любимых фильмов (ID) – чтобы подсветить «звёздочку»
  const loadFavorites = useCallback(async () => {
    try {
      const res = await fetchFavorites();
      const favMovies = res.data;
      const ids = favMovies.map((m) => Number(m.id)); // массив ID-шников
      setFavoriteIds(ids);
    } catch (err) {
      console.error('Ошибка при загрузке избранного:', err);
      setFavoriteIds([]);
    }
  }, []);

  // 8. Загрузка списка фильмов (с учётом фильтров/пагинации) – почти как раньше
  const loadMovies = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filters.title) params.title = filters.title;
      if (filters.director) params.director = filters.director;
      if (filters.year) params.year = filters.year;
      if (filters.min_rating) params.min_rating = filters.min_rating;
      params.sort_by = filters.sort_by;
      params.order = filters.order;
      params.page = page;
      params.limit = limit;

      const response = await fetchMovies(params);
      // API отдаёт обёртку: { page, limit, total, data: [...] }
      const { data: payload } = response.data
        ? { data: response.data.data } // если бэкенд отдал { data: [...], ... }
        : { data: [] };

      // Если ваш бэкенд по-прежнему отдаёт просто массив (как раньше),
      // то вместо `response.data.data` делаем `response.data`.

      // Дабы учесть новую структуру (мы указали: c.JSON({ page, limit, total, data: movies }))
      // вытаскиваем:
      let moviesArray = [];
      if (Array.isArray(response.data)) {
        // если бэкенд всё ещё отдал просто [ { … }, { … } ]
        moviesArray = response.data;
      } else {
        // бэкенд отдал { page, limit, total, data }
        moviesArray = response.data.data;
      }

      setMovies(moviesArray);
      setHasNextPage(moviesArray.length === limit);
    } catch (err) {
      console.error('Ошибка при получении фильмов:', err);
      setMovies([]);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, limit]);

  // 9. При монтировании и при изменении фильтров/пагинации – перезагружаем список
  useEffect(() => {
    if (isAuthenticated) {
      loadMovies();
      loadFavorites();
    }
  }, [isAuthenticated, loadMovies, loadFavorites]);

  // 10. Обработчики фильтров/сортировки:
  const handleFilterChange = ({ name, value }) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    setPage(1);
    loadMovies();
  };

  const handleResetFilters = () => {
    setFilters({
      title: '',
      director: '',
      year: '',
      min_rating: '',
      sort_by: 'id',
      order: 'asc',
    });
    setPage(1);
    setLimit(10);
    loadMovies();
  };

  // 11. Пагинация:
  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    if (!hasNextPage && newPage > page) return;
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  // 12. Детализация фильма:
  const handleSelectMovie = (id) => {
    setSelectedMovieId(id);
  };
  const handleCloseDetail = () => {
    setSelectedMovieId(null);
  };

  // 13. Добавить / удалить “в избранное”:
  const handleToggleFavorite = async (movieId) => {
    try {
      if (favoriteIds.includes(movieId)) {
        await removeFavorite(movieId);
      } else {
        await addFavorite(movieId);
      }
      // После любого изменения – перезагружаем любимые
      await loadFavorites();
    } catch (err) {
      console.error('Ошибка при переключении избранного:', err);
      alert('Не удалось обновить избранное. Проверьте консоль.');
    }
  };

  // 14. Пример «выхода» (logout):
  const handleLogout = () => {
    localStorage.removeItem('movie_app_token');
    setIsAuthenticated(false);
    // Также можно сбрасывать стейты
    setMovies([]);
    setFavoriteIds([]);
  };

  // ───────────────────────────────────────────────────────────────────────────────
  // Если не аутентифицирован, показываем Login / Register
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1117]">
        <div className="max-w-md w-full space-y-4">
          <Login onLoginSuccess={() => setIsAuthenticated(true)} />
          <Register onRegisterSuccess={() => setIsAuthenticated(true)} />
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // Основной «Dashboard», когда пользователь залогинен
  return (
    <div className="bg-[#0d1117] min-h-screen px-6 py-8">
      <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
        <Header />
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400 transition"
        >
          Выйти
        </button>
      </div>

      <Filters
        filters={filters}
        onChange={handleFilterChange}
        onSubmit={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <ExportImport onImportComplete={loadMovies} />

      <MovieForm onMovieCreated={loadMovies} />

      <MovieTable
        movies={movies}
        isLoading={isLoading}
        onRowClick={handleSelectMovie}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
        loadFavorites={loadFavorites}
        onMovieDeleted={loadMovies}
        onMovieUpdated={loadMovies}
      />

      <Pagination
        page={page}
        limit={limit}
        hasNext={hasNextPage}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      {selectedMovieId && (
        <MovieDetail movieId={selectedMovieId} onClose={handleCloseDetail} />
      )}
    </div>
  );
}

export default App;
