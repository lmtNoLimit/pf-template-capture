const fs = require("fs");
const jsdom = require("jsdom");
const puppeteer = require("puppeteer");
const axios = require("axios");
const inquirer = require("inquirer");

const { takeScreenshots, getTemplates } = require("./takeScreenshots");
const { wsChromeEndpointUrl, PREFIX, VIEWPORT } = require("../config");
const { templateHandles } = require("./constant");
const { checkAndCreateFolder } = require("./utilities/createFolder")

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

const excludeScripts = [
    "__pagefly_analytics_settings__",
    "loox.io",
    "https://demo.pagefly.io",
    "judge.me",
];

const excludeLinks = ["judge.me"];

const excludeTags = ["head"];

module.exports.downloadTemplatesHtml = async () => {
    try {
        if (fs.existsSync("script")) {
            fs.rmdirSync("script", { recursive: true });
        }
        fs.mkdirSync("script");
        checkAndCreateFolder('html')
        for (let i = 0; i < templateHandles.length; i++) {
            const template = templateHandles[i];
            const res = await axios.get(`${PREFIX}/${template}`)
            const dataRemovedComment = res.data.replace(/<!--[\s\S]*?-->/g, "");
            const dom = new jsdom.JSDOM(dataRemovedComment);
            dom.window.document.querySelector(".pf-btn-install").remove();
            // remove scripts
            const allScripts = dom.window.document.querySelectorAll("script");
            allScripts.forEach((script) => {
                if (
                    (script.src && !script.src?.includes("pagefly")) ||
                    (!script.src && !script.innerHTML?.includes("pagefly")) ||
                    excludeScripts.some((str) => script?.src?.includes(str)) ||
                    excludeScripts.some((str) => script?.innerHTML?.includes(str))
                ) {
                    script.remove();
                }
            });

            // remove all unwanted link tags
            let allLinkTags = dom.window.document.querySelectorAll("link");
            allLinkTags.forEach((link) => {
                if (excludeLinks.some((str) => link?.href?.includes(str))) {
                    link.remove();
                }
            });

            // update some link href
            allLinkTags = dom.window.document.querySelectorAll("link");
            allLinkTags.forEach((link) => {
                if(link.href.startsWith('//cdn')) {
                    link.href = "https:" + link.href;
                }
            });
            let imgTags = dom.window.document.querySelectorAll('img');
            imgTags.forEach((img) => {
                if(img.src.startsWith('//cdn')) {
                    img.src = "https:" + img.src;
                }
            })

            // remove all unwanted tags
            excludeTags.forEach((tag) => {
                const allTags = dom.window.document.querySelectorAll(tag);
                allTags.forEach((tag) => {
                    tag.remove();
                });
            });

            const cssLinks = dom.window.document.querySelectorAll('link')
            const styleData = await Promise.all(Array.from(cssLinks).map(async link => {
                return await axios.get(link.href).then(res => res.data)
            }))
            const css = `<style>${styleData.join('')}</style>`
            dom.window.document.querySelector('html').innerHTML = css + dom.window.document.querySelector('html').innerHTML

            fs.writeFileSync(`html/${template}.html`, dom.serialize());
            console.log(`Downloaded ${template}`);
        }
    } catch (e) {
        console.log(e);
    }
};


module.exports.downloadTemplatesThumbnail = async (selectedDevices) => {
    console.log('Fetching template\'s handle...')
    let templates = await getTemplates();
    console.log(templates)
    inquirer
        .prompt([
            {
                type: "input",
                name: "templates",
                message: "Enter templates slug (seperate each with comma): ",
            },
        ])
        .then(async (answer) => {
            if (!answer.templates) {
                inquirer
                    .prompt([
                        {
                            type: "list",
                            name: "getAll",
                            message:
                                "Are you sure want to take screenshot all images and optimize them?",
                            choices: ["Yes", "No"],
                        }, 
                    ])
                    .then(async (answer) => {
                        if (answer.getAll === "Yes") {
                            await Promise.all(
                                selectedDevices.map(async (device) => {
                                    await takeScreenshots(
                                        templates,
                                        VIEWPORT[device],
                                        device
                                    );
                                })
                            );
                            console.log("capture all templates");
                            process.exit();
                        } else {
                            console.log('Aborted')
                            process.exit();
                        }
                    });
            } else {
                let list = answer.templates.split(",").map((str) => str.trim());
                console.log(`Capturing ${list}`);
                await Promise.all(
                    selectedDevices.map(async (device) => {
                        await takeScreenshots(list, VIEWPORT[device], device);
                    })
                );
                process.exit();
            }
        });
};
