const axios = require("axios");
const { PREFIX } = require("../config");
const { templateHandles } = require("./constant");
const fs = require("fs");
const jsdom = require("jsdom");

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
        if (!fs.existsSync("html")) {
            fs.mkdirSync("html");
        }
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
