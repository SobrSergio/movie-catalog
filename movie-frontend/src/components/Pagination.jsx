// src/components/Pagination.jsx
import React from 'react';

/**
 * Компонент пагинации.
 *
 * Props:
 *   page: number — текущая страница (1-based)
 *   limit: number — сколько записей на странице
 *   hasNext: boolean — есть ли следующая страница
 *   onPageChange: function(newPage) — вызывается при клике Prev/Next
 *   onLimitChange: function(newLimit) — вызывается при смене limit
 */
function Pagination({ page, limit, hasNext, onPageChange, onLimitChange }) {
  return (
    <div className="flex flex-wrap items-center justify-center space-x-4 py-4 max-w-6xl mx-auto">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={`px-4 py-2 rounded font-medium ${
          page <= 1
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-yellow-400 text-black hover:bg-yellow-300'
        }`}
      >
        ‹ Пред.
      </button>
      <span className="text-gray-300">
        Страница <span className="text-yellow-400">{page}</span>
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        className={`px-4 py-2 rounded font-medium ${
          !hasNext
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-yellow-400 text-black hover:bg-yellow-300'
        }`}
      >
        След. ›
      </button>

      <div className="ml-6 flex items-center space-x-2">
        <label className="text-gray-300">На странице:</label>
        <select
          value={limit}
          onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
          className="bg-[#0d1117] border border-gray-600 text-gray-200 px-3 py-2 rounded"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}

export default Pagination;
