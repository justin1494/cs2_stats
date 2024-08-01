"use client";

import React from "react";

const ThemeToggle = ({ isDarkMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`px-4 py-2 rounded-full ${
        isDarkMode ? "bg-yellow-400 text-gray-900" : "bg-gray-700 text-white"
      }`}
    >
      {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
};

export default ThemeToggle;
