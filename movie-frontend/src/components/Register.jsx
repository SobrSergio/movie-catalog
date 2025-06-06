// src/components/Register.jsx
import React, { useState } from 'react';
import { registerUser, loginUser } from '../api/auth';

function Register({ onRegisterSuccess }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await registerUser({ username: form.username, password: form.password });
      // После успешной регистрации сразу логиним
      const loginRes = await loginUser({ username: form.username, password: form.password });
      const token = loginRes.data.token;
      localStorage.setItem('movie_app_token', token);
      onRegisterSuccess();
    } catch (err) {
      console.error('Ошибка при регистрации:', err);
      setError(
        err.response && err.response.data && err.response.data.error
          ? err.response.data.error
          : 'Не удалось зарегистрироваться'
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#161b22] p-6 rounded-lg mb-4 space-y-4"
    >
      <h2 className="text-2xl font-semibold text-yellow-400 text-center mb-2">
        Регистрация
      </h2>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <input
        name="username"
        value={form.username}
        onChange={handleChange}
        required
        placeholder="Имя пользователя"
        className="w-full bg-[#0d1117] border border-gray-600 text-gray-200 placeholder:text-gray-400 px-4 py-3 rounded"
      />
      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        required
        placeholder="Пароль"
        className="w-full bg-[#0d1117] border border-gray-600 text-gray-200 placeholder:text-gray-400 px-4 py-3 rounded"
      />
      <button
        type="submit"
        className="w-full bg-green-500 text-white font-semibold px-6 py-3 rounded hover:bg-green-400 transition"
      >
        Зарегистрироваться
      </button>
    </form>
  );
}

export default Register;
