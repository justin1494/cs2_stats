"use client";

import React, { useState } from "react";

const GameStatsTables = ({ data, isDarkMode }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(15);

  if (!data || data.length === 0) {
    return (
      <div className={isDarkMode ? "text-white" : "text-gray-900"}>
        No data available.
      </div>
    );
  }
  // Function to format date as DD.MM.YYYY HH:mm or return "N/A" for invalid dates
  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return "N/A";
    }
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const themeClasses = {
    container: isDarkMode ? "text-white" : "text-gray-900",
    table: isDarkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-300",
    tableHeader: isDarkMode ? "bg-gray-700" : "bg-gray-100",
    tableHeaderCell: isDarkMode ? "border-gray-600" : "border-gray-300",
    tableCell: isDarkMode ? "border-gray-700" : "border-gray-300",
    botqRow: isDarkMode ? "bg-purple-900" : "bg-purple-100",
    qrosRow: isDarkMode ? "bg-green-900" : "bg-green-100",
    mapCell: isDarkMode ? "bg-yellow-800" : "bg-yellow-100",
    gameNumberCell: isDarkMode ? "bg-gray-800" : "bg-white",
    input: isDarkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-900",
  };

  const getMapBackgroundColor = (matchWon) => {
    if (matchWon === null) return "bg-yellow-600";
    return matchWon ? "bg-green-600" : "bg-red-600";
  };

  const reorderScore = (score, matchWon) => {
    const [score1, score2] = score;
    return matchWon
      ? `${Math.max(score1, score2)} - ${Math.min(score1, score2)}`
      : `${Math.min(score1, score2)} - ${Math.max(score1, score2)}`;
  };

  // Calculate summary statistics for each player based on filtered data
  const summary = data.reduce((acc, game) => {
    game.forEach((player) => {
      if (player.name) {
        if (!acc[player.name]) {
          acc[player.name] = {
            totalKills: 0,
            totalAssists: 0,
            totalDeaths: 0,
            totalDamage: 0,
            kdRatioSum: 0,
            accuracySum: 0,
            gameCount: 0,
            finishedAt: null,
          };
        }
        acc[player.name].totalKills += player.totalKills;
        acc[player.name].totalAssists += player.totalAssists;
        acc[player.name].totalDeaths += player.totalDeaths;
        acc[player.name].totalDamage += player.totalDamage;
        acc[player.name].kdRatioSum += player.kdRatio;
        acc[player.name].accuracySum += player.accuracy;
        acc[player.name].gameCount++;
        // Update finishedAt if it's more recent
        if (
          !acc[player.name].finishedAt ||
          player.finishedAt > acc[player.name].finishedAt
        ) {
          acc[player.name].finishedAt = player.finishedAt;
        }
      }
    });
    return acc;
  }, {});

  // Calculate pagination values
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = data.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(data.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRecordsPerPageChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setRecordsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className={`${themeClasses.container}`}>
      <h3 className="text-xl font-bold mb-4">Game-by-Game Statistics</h3>
      <div className="mb-4">
        <label htmlFor="recordsPerPage" className="mr-2">
          Records per page:
        </label>
        <input
          type="number"
          id="recordsPerPage"
          min="1"
          max="100"
          value={recordsPerPage}
          onChange={handleRecordsPerPageChange}
          className={`px-2 py-1 border rounded ${themeClasses.input}`}
        />
      </div>
      <table className={`min-w-full border ${themeClasses.table} mb-8`}>
        <thead>
          <tr className={themeClasses.tableHeader}>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell}`}
            >
              Game
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell}`}
            >
              Map
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell}`}
            >
              Score
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell}`}
            >
              Player
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell} text-center`}
            >
              Kills
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell} text-center`}
            >
              Assists
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell} text-center`}
            >
              Deaths
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell}`}
            >
              K/D Ratio
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell}`}
            >
              Accuracy
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell} font-bold`}
            >
              Damage
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell}`}
            >
              Finished At
            </th>
          </tr>
        </thead>
        <tbody>
          {currentRecords.map((game, gameIndex) => {
            const mapInfo = game.find((item) => item.map);
            const botq = game.find((player) => player.name === "botq");
            const qros = game.find((player) => player.name === "qros");

            return [botq, qros].map((player, playerIndex) => (
              <tr
                key={`${gameIndex}-${playerIndex}`}
                className={
                  player.name === "botq"
                    ? themeClasses.botqRow
                    : themeClasses.qrosRow
                }
              >
                {playerIndex === 0 && (
                  <td
                    rowSpan={2}
                    className={`px-4 py-2 border-b ${themeClasses.tableCell} text-center ${themeClasses.gameNumberCell}`}
                  >
                    {indexOfFirstRecord + gameIndex + 1}
                  </td>
                )}
                {playerIndex === 0 && (
                  <>
                    <td
                      rowSpan={2}
                      className={`px-4 py-2 border-b ${
                        themeClasses.tableCell
                      } text-center ${getMapBackgroundColor(mapInfo.matchWon)}`}
                    >
                      {mapInfo.map}
                    </td>
                    <td
                      rowSpan={2}
                      className={`px-4 py-2 border-b ${
                        themeClasses.tableCell
                      } text-center ${getMapBackgroundColor(mapInfo.matchWon)}`}
                    >
                      {reorderScore(mapInfo.score, mapInfo.matchWon)}
                    </td>
                  </>
                )}
                <td className={`px-4 py-2 border-b ${themeClasses.tableCell}`}>
                  {player.name}
                </td>
                <td
                  className={`px-4 py-2 border-b ${themeClasses.tableCell} text-center`}
                >
                  {player.totalKills}
                </td>
                <td
                  className={`px-4 py-2 border-b ${themeClasses.tableCell} text-center`}
                >
                  {player.totalAssists}
                </td>
                <td
                  className={`px-4 py-2 border-b ${themeClasses.tableCell} text-center`}
                >
                  {player.totalDeaths}
                </td>
                <td className={`px-4 py-2 border-b ${themeClasses.tableCell}`}>
                  {player.kdRatio.toFixed(2)}
                </td>
                <td className={`px-4 py-2 border-b ${themeClasses.tableCell}`}>
                  {(player.accuracy * 100).toFixed(2)}%
                </td>
                <td
                  className={`px-4 py-2 border-b ${themeClasses.tableCell} font-bold`}
                >
                  {player.totalDamage}
                </td>
                {playerIndex === 0 && (
                  <td
                    rowSpan={2}
                    className={`px-4 py-2 border-b ${
                      themeClasses.tableCell
                    } text-center ${getMapBackgroundColor(mapInfo.matchWon)}`}
                  >
                    {formatDate(mapInfo.finishedAt)}
                  </td>
                )}
              </tr>
            ));
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => paginate(i + 1)}
            className={`px-3 py-1 mx-1 rounded ${
              currentPage === i + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <h3 className="text-xl font-bold mb-4">Player Summary Statistics</h3>
      <table className={`min-w-full border ${themeClasses.table}`}>
        <thead>
          <tr className={themeClasses.tableHeader}>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell}`}
            >
              Player
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell} text-center`}
            >
              Total Kills
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell} text-center`}
            >
              Total Assists
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell} text-center`}
            >
              Total Deaths
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell}`}
            >
              Avg K/D Ratio
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell}`}
            >
              Avg Accuracy
            </th>
            <th
              className={`px-4 py-2 border-b ${themeClasses.tableHeaderCell} font-bold`}
            >
              Total Damage
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(summary).map(([playerName, playerSummary]) => {
            const avgKDRatio =
              playerSummary.kdRatioSum / playerSummary.gameCount;
            const avgAccuracy =
              playerSummary.accuracySum / playerSummary.gameCount;

            return (
              <tr
                key={playerName}
                className={
                  playerName === "botq"
                    ? themeClasses.botqRow
                    : themeClasses.qrosRow
                }
              >
                <td
                  className={`px-4 py-2 border-b ${themeClasses.tableCell} font-bold`}
                >
                  {playerName}
                </td>
                <td
                  className={`px-4 py-2 border-b ${themeClasses.tableCell} text-center`}
                >
                  {playerSummary.totalKills}
                </td>
                <td
                  className={`px-4 py-2 border-b ${themeClasses.tableCell} text-center`}
                >
                  {playerSummary.totalAssists}
                </td>
                <td
                  className={`px-4 py-2 border-b ${themeClasses.tableCell} text-center`}
                >
                  {playerSummary.totalDeaths}
                </td>
                <td className={`px-4 py-2 border-b ${themeClasses.tableCell}`}>
                  {avgKDRatio.toFixed(2)}
                </td>
                <td className={`px-4 py-2 border-b ${themeClasses.tableCell}`}>
                  {(avgAccuracy * 100).toFixed(2)}%
                </td>
                <td
                  className={`px-4 py-2 border-b ${themeClasses.tableCell} font-bold`}
                >
                  {playerSummary.totalDamage}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GameStatsTables;
