const puppeteer = require("puppeteer");
const { wsChromeEndpointUrl } = require("../../config");
const { templateHandles } = require("../constant");

module.exports.getActiveTemplates = async (handles = templateHandles) => {
    const browser = await puppeteer.connect({
        browserWSEndpoint: wsChromeEndpointUrl,
        defaultViewport: null,
    });

    const page = await browser.newPage();
    await page.goto(
        `https://apps.pagefly.io/pages/regular?sort=newest&page=1`,
        {
            waitUntil: "networkidle0",
        }
    );

    const templates = await page.evaluate(async (handles) => {
        const data = await fetch("/api/pages?limit=200").then((res) =>
            res.json()
        );
        const list = data.filter((item) => {
            return handles.some(
                (handle) =>
                    handle === item.shopifyPage.handle && item.configs.published
            );
        });
        return list.map((item) => {
            return {
                id: item._id,
                name: item.title,
                handle: item.shopifyPage.handle,
            };
        });
    }, handles);

    await page.close();
    return templates;
};
