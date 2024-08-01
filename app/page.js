"use client";

import React, { useState, useEffect } from "react";
import GameStatsTables from "./components/GameStatsTables";
import ThemeToggle from "./components/ThemeToggle";
import { fetchAllStats } from "./puppeteer";

export default function Page() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [gameData, setGameData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllStats();
        console.log("Fetched data:", data); // Debug log
        const togetherData = data.filter(
          (matchArray) => matchArray.length === 3
        );
        setGameData(togetherData);
      } catch (err) {
        console.error("Error fetching data:", err); // Debug log
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}
    >
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1
            className={`text-3xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            CS2 Game Statistics
          </h1>
          <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
        </div>
        {isLoading ? (
          <div className={isDarkMode ? "text-white" : "text-gray-900"}>
            Loading...
          </div>
        ) : error ? (
          <div className="text-red-500">Error: {error.message}</div>
        ) : (
          <GameStatsTables data={gameData} isDarkMode={isDarkMode} />
        )}
      </div>
    </div>
  );
}
