// src/components/MovieForm.jsx

import React, { useState } from 'react';
import { createMovie } from '../api/movies';

function MovieForm() {
  const [form, setForm] = useState({
    title: '',
    year: '',
    director: '',
    rating: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMovie({
        title: form.title,
        year: parseInt(form.year, 10),
        director: form.director,
        rating: parseFloat(form.rating)
      });
      // После успешного добавления сбрасываем форму и обновляем список
      setForm({ title: '', year: '', director: '', rating: '' });
      window.location.reload();
    } catch (err) {
      console.error('Ошибка при добавлении фильма:', err);
      alert('Не удалось добавить фильм. Проверьте консоль для деталей.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#161b22] p-6 rounded-lg flex flex-wrap gap-4 justify-center mb-8 max-w-4xl mx-auto"
    >
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        required
        placeholder="Название"
        className="bg-[#0d1117] border border-gray-600 text-white placeholder:text-gray-400 px-4 py-3 rounded w-48"
      />
      <input
        name="year"
        value={form.year}
        onChange={handleChange}
        required
        placeholder="Год"
        type="number"
        min="1888"
        max={new Date().getFullYear()}
        className="bg-[#0d1117] border border-gray-600 text-white placeholder:text-gray-400 px-4 py-3 rounded w-28"
      />
      <input
        name="director"
        value={form.director}
        onChange={handleChange}
        required
        placeholder="Режиссёр"
        className="bg-[#0d1117] border border-gray-600 text-white placeholder:text-gray-400 px-4 py-3 rounded w-48"
      />
      <input
        name="rating"
        value={form.rating}
        onChange={handleChange}
        required
        placeholder="Рейтинг"
        type="number"
        step="0.1"
        min="0"
        max="10"
        className="bg-[#0d1117] border border-gray-600 text-white placeholder:text-gray-400 px-4 py-3 rounded w-32"
      />
      <button
        type="submit"
        className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded hover:bg-yellow-300 focus:ring-2 focus:ring-yellow-500 transition"
      >
        Добавить
      </button>
    </form>
  );
}

export default MovieForm;
