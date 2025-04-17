import { chromium as playwright } from "playwright-core";
import chromium from "@sparticuz/chromium";
import express from "express";

const app = express();
const port = 8080;

app.get("/", async (req, res) => {
  const { query, headers } = req;
  const authToken = headers.authorization
    ? headers.authorization.replace("Bearer ", "")
    : null;

  if (process.env.AUTH_TOKEN && authToken !== process.env.AUTH_TOKEN) {
    res.status(403).send("unauthorized");
  }

  const executablePath = await chromium.executablePath();
  console.log(`executablePath: ${executablePath}`);

  const browser = await playwright.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
  const context = await browser.newContext();

  try {
    if (query.url && isValidUrl(query.url)) {
      const page = await context.newPage();
      await page.goto(query.url);
      const screenshot = await page.screenshot({ type: "png" });
      res.setHeader("Content-Type", "image/png");
      res.status(200).send(screenshot);
    } else throw "Please provide a valid url";
  } catch (error) {
    res.status(500).send({
      status: "Failed",
      error,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function isValidUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}
