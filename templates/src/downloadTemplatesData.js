const { wsChromeEndpointUrl } = require("../config");
const puppeteer = require("puppeteer");
const { getActiveTemplates } = require("./getActiveTemplates");

/**
* @deprecated this function is not useful anymore
*/
module.exports.downloadTemplatesData = async (all = true) => {
    try {
        let templates = await getActiveTemplates();

        const browser = await puppeteer.connect({
            browserWSEndpoint: wsChromeEndpointUrl,
            defaultViewport: null,
        });

        const page = await browser.newPage();

        for (template of templates) {
            await page.goto(
                `https://apps.pagefly.io/editor?type=page&id=${template.id}&shop=pagefly.myshopify.com`,
                { waitUntil: "networkidle0" }
            );
            await page.waitForTimeout(20000);
            await page.evaluate(() => {
                try {
                    window.pagefly.generateDataForTemplate();
                    console.log(`Downloaded ${template.name}`);
                } catch (e) {
                    setTimeout(() => {
                        window.pagefly.generateDataForTemplate();
                    }, 2000);
                }
            });
        }
        await page.close();
        process.exit();
    } catch (e) {
        console.log(e);
    }
};
