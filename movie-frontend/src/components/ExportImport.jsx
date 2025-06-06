// src/components/ExportImport.jsx
import React, { useRef, useState } from 'react';
import { exportMovies, importMovies } from '../api/movies';

function ExportImport({ onImportComplete }) {
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    exportMovies()
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'movies.json');
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => {
        console.error('Ошибка при экспорте фильмов:', err);
        alert('Не удалось экспортировать фильмы.');
      });
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const arr = JSON.parse(evt.target.result);
        if (!Array.isArray(arr)) {
          alert('Файл должен содержать массив JSON-объектов.');
          return;
        }
        setIsImporting(true);
        await importMovies(arr);
        alert(`Импортировано ${arr.length} фильмов.`);
        onImportComplete && onImportComplete();
      } catch (err) {
        console.error('Ошибка при импорте фильмов:', err);
        alert('Не удалось импортировать. Проверьте формат JSON.');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center justify-center space-x-4 mb-8 max-w-4xl mx-auto">
      <button
        onClick={handleExport}
        className="bg-green-500 text-white font-semibold px-6 py-2 rounded hover:bg-green-400 transition"
      >
        Экспорт JSON
      </button>
      <button
        onClick={handleImportClick}
        disabled={isImporting}
        className={`${
          isImporting
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-400'
        } font-semibold px-6 py-2 rounded transition`}
      >
        {isImporting ? 'Импорт...' : 'Импорт JSON'}
      </button>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

export default ExportImport;
