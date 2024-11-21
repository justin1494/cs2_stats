"use client";

import React, { useState, useEffect } from "react";
import GameStatsTables from "./components/GameStatsTables";
import ThemeToggle from "./components/ThemeToggle";
import { fetchAllStats } from "./puppeteer";
import { BeatLoader } from "react-spinners";

const MapStats = ({ data, isDarkMode }) => {
  const themeClasses = {
    container: isDarkMode ? "text-white" : "text-gray-900",
    table: isDarkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-300",
    tableHeader: isDarkMode ? "bg-gray-700" : "bg-gray-100",
    tableHeaderCell: isDarkMode ? "border-gray-600" : "border-gray-300",
    tableCell: isDarkMode ? "border-gray-700" : "border-gray-300",
  };

  const mapStats = data.reduce((acc, game) => {
    const mapInfo = game.find((item) => item.map);
    if (mapInfo) {
      if (!acc[mapInfo.map]) {
        acc[mapInfo.map] = { gamesPlayed: 0, wins: 0 };
      }
      acc[mapInfo.map].gamesPlayed++;
      if (mapInfo.matchWon) {
        acc[mapInfo.map].wins++;
      }
    }
    return acc;
  }, {});

  return (
    <div className={`${themeClasses.container}`}>
      <h3 className="text-xl font-bold mb-4">Map Statistics</h3>
      <table className={`min-w-full border ${themeClasses.table}`}>
        <thead>
          <tr className={themeClasses.tableHeader}>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell}`}
            >
              Map
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell}`}
            >
              Games Played
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell}`}
            >
              Win Percentage
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(mapStats).map(([map, stats]) => {
            const winPercentage = (
              (stats.wins / stats.gamesPlayed) *
              100
            ).toFixed(2);
            return (
              <tr key={map}>
                <td className={`px-4 py-2 border-b ${themeClasses.tableCell}`}>
                  {map}
                </td>
                <td className={`px-4 py-2 border-b ${themeClasses.tableCell}`}>
                  {stats.gamesPlayed}
                </td>
                <td className={`px-4 py-2 border-b ${themeClasses.tableCell}`}>
                  {winPercentage}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default function Page() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [gameData, setGameData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingTime, setLoadingTime] = useState(0);
  const [activeTab, setActiveTab] = useState("GameStats");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllStats();
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

  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setInterval(() => {
        setLoadingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timer);
      setLoadingTime(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Filter data based on date range
  const filteredData = gameData.filter((game) => {
    const gameDate = new Date(game[0].finishedAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) {
      end.setHours(23, 59, 59, 999); // Include the entire end date
    }
    return (!start || gameDate >= start) && (!end || gameDate <= end);
  });

  // Calculate win rate
  const totalGames = filteredData.length;
  const totalWins = filteredData.filter((game) =>
    game.some((item) => item.matchWon === true)
  ).length;
  const winRate =
    totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(2) : "loading...";

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
        <div className="mb-4 flex items-center">
          <div>
            <label htmlFor="startDate" className="mr-2">
              Start Date:
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`px-2 py-1 border rounded ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            <label htmlFor="endDate" className="ml-4 mr-2">
              End Date:
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`px-2 py-1 border rounded ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>
          <div className="ml-4">
            <span
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Win Rate: {winRate}%
            </span>
          </div>
        </div>
        <nav className="mb-4">
          <ul className="flex space-x-4">
            <li>
              <button
                onClick={() => setActiveTab("GameStats")}
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } ${activeTab === "GameStats" ? "underline" : ""}`}
              >
                Game Stats
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("MapStats")}
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } ${activeTab === "MapStats" ? "underline" : ""}`}
              >
                Map Stats
              </button>
            </li>
          </ul>
        </nav>
        {isLoading ? (
          <div
            className={`flex flex-col items-center justify-center h-screen ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <BeatLoader color={isDarkMode ? "white" : "gray"} size={30} />
            <p className="text-2xl">Loading for {loadingTime} seconds...</p>
          </div>
        ) : error ? (
          <div className="text-red-500">Error: {error.message}</div>
        ) : activeTab === "GameStats" ? (
          <GameStatsTables data={filteredData} isDarkMode={isDarkMode} />
        ) : (
          <MapStats data={filteredData} isDarkMode={isDarkMode} />
        )}
      </div>
    </div>
  );
}
