"use server";

import { chromium } from "playwright";

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
  let browser;
  try {
    // Launch the browser
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the Leetify login page
    await page.goto("https://leetify.com/login");

    // Wait for the email input field to be visible
    await page.waitForSelector('input[type="email"]');

    // Type in the email and password
    await page.fill('input[type="email"]', "m.jaskolowski1994@gmail.com");
    await page.fill('input[type="password"]', "Creative12345!");

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

    return matchIds;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export const getStats = async (gameID) => {
  const response = await fetch(`https://api.leetify.com/api/games/${gameID}`);
  const data = await response.json();
  const map = data.mapName;
  const score = data.teamScores;
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
      };
    }
  );

  return [...refactoredPlayer, { map, score, matchWon }];
};

export const fetchAllStats = async () => {
  try {
    const gamesArray = await loginToLeetify();
    const allStats = await Promise.all(gamesArray.map(getStats));
    return allStats;
  } catch (error) {
    console.error("Error fetching all stats:", error);
    throw error;
  }
};
