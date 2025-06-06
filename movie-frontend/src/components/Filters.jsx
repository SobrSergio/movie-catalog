// src/components/Filters.jsx
import React from 'react';

/**
 * Компонент фильтров и сортировки.
 *
 * Props:
 *   filters: { title, director, year, min_rating, sort_by, order }
 *   onChange: функция({ name, value }) — при изменении любого поля
 *   onSubmit: функция() — при клике "Применить"
 *   onReset: функция() — при клике "Сбросить"
 */
function Filters({ filters, onChange, onSubmit, onReset }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ name, value });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="bg-[#161b22] p-6 rounded-lg mb-8 max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-gray-400 mb-1">Название</label>
          <input
            type="text"
            name="title"
            value={filters.title}
            onChange={handleInputChange}
            placeholder="Часть названия"
            className="w-full bg-[#0d1117] border border-gray-600 text-gray-200 placeholder:text-gray-400 px-4 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-1">Режиссёр</label>
          <input
            type="text"
            name="director"
            value={filters.director}
            onChange={handleInputChange}
            placeholder="Имя режиссёра"
            className="w-full bg-[#0d1117] border border-gray-600 text-gray-200 placeholder:text-gray-400 px-4 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-1">Год</label>
          <input
            type="number"
            name="year"
            value={filters.year}
            onChange={handleInputChange}
            placeholder="YYYY"
            min="1888"
            max={new Date().getFullYear()}
            className="w-full bg-[#0d1117] border border-gray-600 text-gray-200 placeholder:text-gray-400 px-4 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-1">Мин. рейтинг</label>
          <input
            type="number"
            name="min_rating"
            value={filters.min_rating}
            onChange={handleInputChange}
            placeholder="0–10"
            step="0.1"
            min="0"
            max="10"
            className="w-full bg-[#0d1117] border border-gray-600 text-gray-200 placeholder:text-gray-400 px-4 py-2 rounded"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-400 mb-1">Сортировать по</label>
          <select
            name="sort_by"
            value={filters.sort_by}
            onChange={handleInputChange}
            className="w-full bg-[#0d1117] border border-gray-600 text-gray-200 px-4 py-2 rounded"
          >
            <option value="id">ID</option>
            <option value="title">Название</option>
            <option value="year">Год</option>
            <option value="rating">Рейтинг</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-400 mb-1">Порядок</label>
          <select
            name="order"
            value={filters.order}
            onChange={handleInputChange}
            className="w-full bg-[#0d1117] border border-gray-600 text-gray-200 px-4 py-2 rounded"
          >
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
          </select>
        </div>
        <div className="flex items-end space-x-4">
          <button
            type="submit"
            className="bg-yellow-400 text-black font-semibold px-6 py-2 rounded hover:bg-yellow-300 transition"
          >
            Применить
          </button>
          <button
            type="button"
            onClick={onReset}
            className="bg-gray-600 text-gray-200 font-semibold px-6 py-2 rounded hover:bg-gray-500 transition"
          >
            Сбросить
          </button>
        </div>
      </div>
    </form>
  );
}

export default Filters;
