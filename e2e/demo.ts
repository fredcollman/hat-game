import { chromium } from "playwright";

const home = "http://localhost:3000";

const main = async () => {
  const browser = await chromium.launch({ headless: false });
  const playerOne = await browser.newContext();
  const playerTwo = await browser.newContext();

  const pageOne = await playerOne.newPage();
  await pageOne.goto(home);

  const pageTwo = await playerTwo.newPage();
  await pageTwo.goto(home);

  await browser.close();
};

main();
