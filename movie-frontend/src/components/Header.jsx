// src/components/Header.jsx

import React from 'react';

function Header() {
  return (
    <header className="mb-12 text-center">
      <h1 className="text-5xl font-bold text-yellow-400 mb-2 tracking-wide">🎬 Каталог фильмов</h1>
      <p className="text-gray-400 text-sm">На основе Go API</p>
    </header>
  );
}

export default Header;
