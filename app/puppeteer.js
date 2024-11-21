"use server";

import puppeteer from "puppeteer";

async function waitForMatchesToLoad(page) {
  await page.waitForFunction(
    () => {
      const items = document.querySelectorAll("app-matches-list-item");
      return items.length > 0;
    },
    { timeout: 30000 }
  );
}

export async function loginToLeetify() {
  try {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: true }); // Set to true for headless mode
    const page = await browser.newPage();

    // Navigate to the Leetify login page
    await page.goto("https://leetify.com/login");

    // Wait for the email input field to be visible
    await page.waitForSelector('input[type="email"]');

    // Type in the email and password
    await page.type('input[type="email"]', "m.jaskolowski1994@gmail.com");
    await page.type('input[type="password"]', "Creative12345!");

    // Click the login button
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForNavigation();

    await page.goto("https://leetify.com/app/matches/list");

    // Wait for matches to load
    await waitForMatchesToLoad(page);

    // Extract match IDs
    const matchIds = await page.evaluate(() => {
      const matchElements = document.querySelectorAll(
        "app-matches-list-item a"
      );
      return Array.from(matchElements).map((element) => {
        const href = element.getAttribute("href");
        return href.split("/").pop();
      });
    });

    // console.log("Extracted Match IDs:");
    // console.log(matchIds);
    // Close the browser
    await browser.close();

    return matchIds;
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

export const getStats = async (gameID) => {
  const match = await fetch(`https://api.leetify.com/api/games/${gameID}`);
  const data = await match.json();
  const map = data.mapName;
  const score = data.teamScores;
  const dataSource = data.dataSource;
  const finishedAt = data.finishedAt;
  if (!data.playerStats) {
    return [];
  }
  const players = data.playerStats.filter(
    (item) =>
      item.steam64Id === "76561198002392306" ||
      item.steam64Id === "76561198040886804"
  );
  let matchWon = null;
  const refactoredPlayer = players.map(
    ({
      name,
      accuracy,
      totalDamage,
      totalKills,
      totalDeaths,
      totalAssists,
      kdRatio,
      tRoundsWon = Number(tRoundsWon),
      ctRoundsWon = Number(ctRoundsWon),
      tRoundsLost = Number(tRoundsLost),
      ctRoundsLost = Number(ctRoundsLost),
    }) => {
      if (tRoundsWon + ctRoundsWon > tRoundsLost + ctRoundsLost) {
        matchWon = true;
      } else if (tRoundsWon + ctRoundsWon < tRoundsLost + ctRoundsLost) {
        matchWon = false;
      }

      return {
        name,
        accuracy,
        totalKills,
        totalAssists,
        totalDeaths,
        totalDamage,
        kdRatio,
        finishedAt,
      };
    }
  );

  return [
    ...refactoredPlayer,
    { map, score, matchWon, finishedAt, dataSource },
  ];
};

export const fetchAllStats = async () => {
  try {
    const response = await fetch(
      "https://puppeteer-render-hbjn.onrender.com/scrape"
    );
    const gamesArray = await response.json();

    const allStats = await Promise.all(gamesArray.map(getStats));
    console.log("allstats");

    // Filter to include only records with dataSource === 'matchmaking'
    const filteredStats = allStats.filter((game) =>
      game.some((item) => item.dataSource === "matchmaking")
    );

    const sortedStats = filteredStats.sort(
      (a, b) => new Date(b[0].finishedAt) - new Date(a[0].finishedAt)
    );

    return sortedStats;
  } catch (error) {
    console.error("Error fetching all stats:", error);
  }
};
