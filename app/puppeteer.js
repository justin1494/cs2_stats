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
    // const gamesArray = await response.json();
    const gamesArray = [
      "00a2176f-94c9-4948-a3fb-e83f1176b091",
      "06d05e06-0a4a-47f1-bf33-d3404dfb0cfc",
      "0d31abf0-c57b-45c8-b81c-64c3cd57f98b",
      "14df2c3c-601e-4536-ab22-62dc6bf20ae3",
      "1ae528a8-f3de-4f7e-bba4-5c267857939a",
      "1cb7176a-5114-4cc7-aa98-83373a7b5342",
      "1f4b75b5-b0e9-4b9e-a898-34ac5e02b1ec",
      "20cb7065-cb4e-4492-a8f4-3d6da1fcdce4",
      "20cb7065-cb4e-4332-a8f4-3d6da1fcdce4",
      "29d13401-f903-46ef-b7ac-001fe93a061f",
      "2a256906-3656-412e-bb63-0bd8cb1e8865",
      "2afaed0b-a89b-4b1a-83aa-58d4c77fc001",
      "2c7bfd81-f102-4f45-8ba6-f5181f5a2056",
      "315a5153-6081-41b1-aea6-95711e0887da",
      "33fb031b-b444-4812-8456-e2e55c5ada66",
      "36c78310-1b96-4471-a033-f389f1fd22eb",
      "3b4cd3eb-5bdc-442d-8cdc-15b9db0c9f13",
      "3b5b0c7d-e8fd-41cf-ba26-26bd9a840c74",
      "3bc00148-8cbb-4244-85de-ff592c5b6c8d",
      "42269003-daf8-49c9-a91b-788f8dc49286",
      "426003ef-0569-4c5a-b51f-0905c12cc2c8",
      "550eb449-ae44-47b5-b00b-f0a631211e31",
      "557b32a8-c7a3-4ff3-9ed5-71994a5d138c",
      "5658b2de-9cac-462b-85e0-125a45c9e079",
      "5acaa825-4459-4418-823d-351431f11786",
      "5c2a6593-0971-4f4f-bebd-8c48422b312c",
      "5f784d08-d2be-4d75-9cd8-64ed0b1fdb02",
      "623e7868-39f3-4665-bd27-5ec0e19a961d",
      "6391e3c8-66a3-49e3-8f92-283035d4997d",
      "6c2320a3-869e-42cf-b1d6-c748b792a239",
    ];
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
