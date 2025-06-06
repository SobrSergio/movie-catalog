// src/App.jsx

import React, { useEffect, useState, useCallback } from 'react';
import Header from './components/Header';
import Filters from './components/Filters';
import MovieForm from './components/MovieForm';
import MovieTable from './components/MovieTable';
import Pagination from './components/Pagination';
import MovieDetail from './components/MovieDetail';
import ExportImport from './components/ExportImport';
import { fetchMovies } from './api/movies';

function App() {
  // Состояния для фильтров и сортировки:
  const [filters, setFilters] = useState({
    title: '',
    director: '',
    year: '',
    min_rating: '',
    sort_by: 'id',
    order: 'asc',
  });

  // Пагинация:
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Состояния для данных:
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Флаг, указывающий, есть ли следующая страница:
  const [hasNextPage, setHasNextPage] = useState(false);

  // Для просмотра деталей:
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  // Функция загрузки фильмов с бэка, учитывая фильтры/сортировку/пагинацию.
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
      const data = response.data;
      setMovies(data);
      setHasNextPage(data.length === limit);
    } catch (err) {
      console.error('Ошибка при получении фильмов:', err);
      setMovies([]);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, limit]);

  // Загружаем фильмы при монтировании и при изменении filters/page/limit:
  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  // Обработчики фильтров и сортировки:
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
  };

  // Пагинация:
  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    if (!hasNextPage && newPage > page) return;
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Выбор фильма для просмотра деталей:
  const handleSelectMovie = (id) => {
    setSelectedMovieId(id);
  };

  // Закрытие детализации:
  const handleCloseDetail = () => {
    setSelectedMovieId(null);
  };

  return (
    <div className="bg-[#0d1117] min-h-screen px-6 py-8">
      <Header />

      {/* Фильтры и сортировка */}
      <Filters
        filters={filters}
        onChange={handleFilterChange}
        onSubmit={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Export/Import JSON */}
      <ExportImport onImportComplete={loadMovies} />

      {/* Форма добавления фильма */}
      <MovieForm />

      {/* Таблица с фильмами */}
      <MovieTable
        movies={movies}
        isLoading={isLoading}
        onRowClick={handleSelectMovie}
      />

      {/* Пагинация */}
      <Pagination
        page={page}
        limit={limit}
        hasNext={hasNextPage}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      {/* Модальное окно с деталями фильма */}
      {selectedMovieId && (
        <MovieDetail movieId={selectedMovieId} onClose={handleCloseDetail} />
      )}
    </div>
  );
}

export default App;
