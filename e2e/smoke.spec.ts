import { Browser, chromium, Page } from "playwright";

const home = "http://localhost:3000";
let browser: Browser;
let one: Page;
let two: Page;

const begin = async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(home);
  return page;
};

const addName = async (name: string, page: Page) => {
  await one.fill("'Enter a famous name'", name);
  await one.click('button:has-text("Submit")');
};

const options = {
  // headless: false,
  // slowMo: 500,
};

describe("smoke tests", () => {
  beforeAll(async () => {
    browser = await chromium.launch(options);
    [one, two] = await Promise.all([begin(), begin()]);
  });

  afterAll(async () => {
    await browser.close();
  });

  it("can run a simple game", async () => {
    await one.fill("'Please enter your name'", "Alice");
    await one.click('button:has-text("Continue")');
    await one.click('button:has-text("Start")');
    const groupID = (await one.textContent("code")) as string;
    expect(groupID).toHaveLength(6);

    await two.fill("'Please enter your name'", "Bob");
    await two.click('button:has-text("Continue")');
    await two.fill("text=Group ID", groupID);
    await two.click('button:has-text("Join")');

    await addName("Simon Pegg", one);
    await addName("Nick Frost", one);
    await one.click('button:has-text("Start")');

    expect(await one.textContent("section h2")).toBe("Round 1");
    expect(await two.textContent("section h2")).toBe("Round 1");
    expect(await one.textContent("section")).toMatch(/It's your turn/);
    expect(await two.textContent("section")).not.toMatch(/It's your turn/);
    expect(await two.textContent("section")).toMatch(/Alice is describing/);

    await one.click('button:has-text("Start")');
    await one.click('button:has-text("Got It")');
    await one.click('button:has-text("Got It")');

    await two.click('button:has-text("Start")');
    await two.click('button:has-text("Got It")');
    await two.click('button:has-text("Got It")');

    await one.click('button:has-text("Start")');
    await one.click('button:has-text("Got It")');
    await one.click('button:has-text("Got It")');

    await one.textContent("section h2:has-text('Congrats to Team 1')");
    await two.textContent("section h2:has-text('Congrats to Team 1')");
  });
});
