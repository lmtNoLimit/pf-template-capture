const { BASE_URL, wsChromeEndpointUrl, PREFIX } = require("../config");
const puppeteer = require("puppeteer");
const fs = require("fs");
const { getActiveTemplates } = require("./utilities/getActiveTemplates");
const { checkAndCreateFolder } = require("./utilities/createFolder");
const { goToUrl } = require("./utilities/goToUrl")
const { hideInstallButtonOnDemoPage } = require("./utilities/hideInstallButtonOnDemoPage")

module.exports.downloadSectionsData = async () => {
    try {
        const activeTemplates = await getActiveTemplates();
        const templates = [
            ...activeTemplates,
            {
                id: "bcd80238-545a-41db-acdf-dbf11a05026d",
                name: "Old Sections",
                handle: "section-page-introduction",
            },
        ];
        const browser = await puppeteer.connect({
            browserWSEndpoint: wsChromeEndpointUrl,
            defaultViewport: null,
        });

        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(0);

        for (let template of templates) {
            if (fs.existsSync(`section-data/${template.id}.json`)) {
                console.log("skip " + template.id);
                continue;
            }
            await page.goto(`${BASE_URL}/editor?type=page&id=${template.id}`, { waitUntil: "networkidle0" });
            await page.waitForTimeout(2700);

            const sectionIds = await page.evaluate(() => {
                let ids = []
                window.pagefly.generateDataForSectionTemplates();
                for (let [k, v] of window.__pf_elementStore) {
                    elementStore = window.pagefly.getElementStore(k)
                    if(elementStore.state.type === 'Section' && elementStore.state?.data?.data?.hasOwnProperty('data-category')) {
                        ids.push(k)
                    }
                }
                return ids
            });
            if(!sectionIds.length) {
                continue;
            }
            await page.waitForTimeout(1500);

            if (fs.existsSync(`section-data/${template.id}.json`)) {
                const sectionData = fs.readFileSync(`section-data/${template.id}.json`, "utf8");
                const sectionDataJson = JSON.parse(sectionData);
                const sections = sectionDataJson.map((s, i) => {
                    return {
                        _id: sectionIds[i],
                        ...s
                    }
                });
                fs.writeFileSync(`section-data/${template.id}.json`, JSON.stringify(sections, null, 2));
            }
            console.log(`Downloaded ${template.id}`)
        }
        await page.close();
        process.exit();
    } catch (e) {
        console.log(e);
    }
};


module.exports.downloadSectionThumbnails = async () => {
    try {
        checkAndCreateFolder("sections");
        const activeTemplates = await getActiveTemplates();
        const templates = [
            ...activeTemplates,
            {
                id: "bcd80238-545a-41db-acdf-dbf11a05026d",
                name: "Old Sections",
                handle: "section-page-introduction",
            },
        ];
        const browser = await puppeteer.connect({
            browserWSEndpoint: wsChromeEndpointUrl,
            defaultViewport: null
        });

        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(0);

        const defaultViewport = {
            height: 1200,
            width: 900,
        };

        for (let template of templates) {
            await goToUrl(page, `${PREFIX}/${template.handle}`)
            await hideInstallButtonOnDemoPage(page);
            await page.waitForTimeout(3000);

            const elements = await page.$$('[data-pf-type="Section"]');
            for (let i = 0; i < elements.length; i++) {
                const bodyHandle = await page.$("body");
                const boundingBox = await bodyHandle.boundingBox();
                const newViewport = {
                    width: Math.max(defaultViewport.width, Math.ceil(boundingBox.width)),
                    height: Math.max(defaultViewport.height, Math.ceil(boundingBox.height)),
                };
                await page.setViewport(Object.assign({}, defaultViewport, newViewport));

                const elementData = await page.evaluate((element) => {
                    const { x, y, width, height } = element.getBoundingClientRect();
                    const originalName = element.getAttribute("data-name");
                    const originalCategory = element.getAttribute("data-category");
                    const name = originalName ? originalName.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-") : "";
                    const category = originalCategory ? originalCategory.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-") : "";
                    return {
                        clip: { x, y, width, height },
                        originalName,
                        originalCategory,
                        name,
                        category,
                        pageId: window.__pagefly_setting__.pageId,
                    };
                }, elements[i]);
                const { clip, originalName, originalCategory, name, category, pageId } = elementData;

                // download image
                if (name && category) {
                    if (fs.existsSync(`sections/${name}.png`)) {
                        continue;
                    }
                    await page.screenshot({
                        clip,
                        path: `sections/${name}.png`,
                    });

                    // update width and height of image to section data
                    // read json file and update
                    if (fs.existsSync(`section-data/${pageId}.json`)) {
                        const sectionData = fs.readFileSync(`section-data/${pageId}.json`, "utf8");
                        const sectionDataJson = JSON.parse(sectionData);
                        const section = sectionDataJson.find(
                            (section) => section.name === originalName && section.category === originalCategory
                        );
                        if (section) {
                            section.width = Math.ceil(clip?.width);
                            section.height = Math.ceil(clip?.height);
                            fs.writeFileSync(`section-data/${pageId}.json`, JSON.stringify(sectionDataJson, null, 2));
                        }
                    }
                } else {
                    continue;
                }
            }
        }
        await page.close();
        process.exit();
    } catch (e) {
        console.log(e);
    }
};

module.exports.checkTemplatesData = async () => {
    const data = fs.readFileSync(`section-data/data.json`, "utf8");
    const dataJson = JSON.parse(data);
    const badDataTemplate = dataJson.filter((template) => {
        return !template.width || !template.height || !template.category || !template.name || !template._id;
    });
    console.log(badDataTemplate);
};
