const playwright = require("playwright-aws-lambda");
const { chromium: playwright } = require("playwright-core");
const chromium = require("@sparticuz/chromium");

module.exports = async (req, res) => {
  const { query } = req;
  try {
    if (query.url && isValidUrl(query.url)) {
      const browser = await playwright.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(query.url);
      const screenshot = await page.screenshot({ type: "png" });
      res.setHeader("Content-Type", "image/png");
      res.status(200).send(screenshot);
    } else throw "Please provide a valid url";
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "Failed",
      error,
    });
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};

function isValidUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}
