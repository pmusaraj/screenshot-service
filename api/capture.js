const { chromium: playwright } = require("playwright-core");
const chromium = require("@sparticuz/chromium");

module.exports = async (req, res) => {
  const { query, headers } = req;
  const authToken = headers.authorization.replace("Bearer ", "");
  console.log(authToken);
  console.log(process.env.AUTH_TOKEN);
  if (process.env.AUTH_TOKEN && authToken !== process.env.AUTH_TOKEN) {
    res.status(403).send("unauthorized");
  }

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
};

function isValidUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}
