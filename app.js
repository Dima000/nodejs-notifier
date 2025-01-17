// Import necessary libraries
const { chromium } = require("playwright");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config(); // Load environment variables from .env file

// Define constants
const WEBSITE_URL = process.env.WEBSITE_URL || "https://example.com";
const LOGIN_URL = process.env.LOGIN_URL || `${WEBSITE_URL}/login`;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const USERNAME = process.env.USERNAME1;
const PASSWORD = process.env.PASSWORD1;

// Helper to send a message via Telegram
async function sendTelegramMessage(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error(
      "Telegram bot token or chat ID is missing in environment variables."
    );
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    });
    console.log("Telegram message sent:", message);
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
  }
}

// Function to scrape and search information on the website
async function scrapeAndSearch() {
  const browser = await playwright.chromium.connect(
    process.env.BROWSER_PLAYWRIGHT_ENDPOINT
  );
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(LOGIN_URL);
    await page.type("#USER", USERNAME || "");
    await page.fill("#PASS", PASSWORD || "");
    await page.waitForTimeout(1000);
    await page.click('input[type="submit"][name="submit"]');
    await page.waitForTimeout(4000);

    // Dismiss alert if present
    const alert = await page.on("dialog", async (dialog) => {
      await dialog.dismiss();
    });

    await page.goto(WEBSITE_URL);
    await page.waitForTimeout(2000);

    // Perform search
    const targetRowSelector = "tr.admintable_light";
    const targetCellSelector = `${targetRowSelector} td:last-child`;

    await page.waitForSelector(targetRowSelector);

    const isLastCellBlank = await page.$eval(targetCellSelector, (cell) => {
      return cell.textContent?.trim() === "";
    });

    let message = isLastCellBlank
      ? "No updates were found in the last 10 minutes."
      : "❗❗❗@dima_m43 Exista actualizari pe site❗❗❗";
    await sendTelegramMessage(message);
  } catch (error) {
    console.error("Error during scraping:", error);
  } finally {
    await browser.close();
  }
}

console.log("app started");
scrapeAndSearch();
