const fs = require("fs");
const puppeteer = require("puppeteer");
const { PREFIX, OPTIMIZE_QUALITY, OPTIMIZE_WIDTH } = require("../config");
const { optimizeImage, tinifyImage } = require("./optimizer");

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

module.exports.getTemplates = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // get templates name
    await page.goto(`https://pagefly.io/pages/templates`);
    const templates = await page.$$eval(".template__item a.pa.wf.hf", (el) => {
        // slice(30) to cut off the prefix
        return el.map((link) => link.getAttribute("href").slice(42));
    });
    return templates;
};

module.exports.takeScreenshots = async (data, viewport, device) => {
    const WIDTH = OPTIMIZE_WIDTH[device];
    const QUALITY = OPTIMIZE_QUALITY[device];

    if (!fs.existsSync("screenshots")) {
        fs.mkdirSync("screenshots");
    }

    // open the browser and prepare a page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    // set the size of the viewport, so our screenshot will have the desired size
    await page.setViewport(viewport);

    for (const name of data) {
        // const imageName = name.includes('demo#') ? name.replace('demo#', '') : name
        await page.goto(`${PREFIX}/${name}`, { waitUntil: "networkidle0" });
        // remove the button in the bottom right corner
        await page.waitForTimeout(2000);
        await page.evaluate(() => {
            const btnInstall = document.querySelector(".pf-btn-install");
            btnInstall && btnInstall.remove();
        });
        // handle some page with lazyload image
        await autoScroll(page);
        await page.waitForTimeout(2000) // need to check about this
        // take screenshot

        await page
            .screenshot({
                path: `screenshots/${name}_${device}.png`,
                fullPage: true,
            })
            .then(() => console.log(`captured ${name}_${device}.png`));

        // optimize image
        await optimizeImage(`${name}_${device}.png`, WIDTH, QUALITY);
        await tinifyImage(`${name}_${device}.png`);
    }
    await browser.close();
};
