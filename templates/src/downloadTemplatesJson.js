const puppeteer = require("puppeteer");
const { wsChromeEndpointUrl } = require("../config");
const { templateHandles } = require("./constant");

module.exports.downloadTemplatesJson = async (handles = templateHandles) => {
    try {
        const browser = await puppeteer.connect({
            browserWSEndpoint: wsChromeEndpointUrl,
            defaultViewport: null,
        });

        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(0);

        await page.goto(`https://apps.pagefly.io/pages/regular?sort=newest&page=1`, {
            waitUntil: "networkidle0",
        });
        await page.evaluate(async (handles) => {
            const data = await fetch("/api/pages?limit=200").then((res) => res.json());
            const list = data.filter((item) => {
                return handles.some((handle) => handle === item.shopifyPage.handle && item.configs.published);
            });
            const pageList = list.map((item) => {
                return {
                    id: item._id,
                    name: item.title,
                    handle: item.shopifyPage.handle,
                };
            });
            function delay(t) {
                return new Promise(resolve => setTimeout(resolve, t));
            }
            for(let page of pageList) {
                await delay(500)
                const res = await fetch(`/api/export-pages?pages=${page.id}`)
                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = `${page.handle}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                console.log(`Downloaded ${page.handle}`);
            }
        }, handles);
        await page.close();
        process.exit();
    } catch (e) {
        console.log(e);
    }
};
