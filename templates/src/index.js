const inquirer = require("inquirer");
const { minifyHtml } = require("./utilities/minifyHtml");
const { templateHandles } = require("./constant")

const { tinifyImages, optimizeImages } = require("./optimizer")
const { downloadTemplatesJson, downloadTemplatesHtml, downloadTemplatesThumbnail } = require("./downloadPageTemplatesData");
const { downloadSectionsData, downloadSectionThumbnails, checkTemplatesData } = require("./downloadSectionsData")
const { mergeAllJsonIntoOne } = require("./mergeJson")


function main() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "action",
                message: "What do you want to do?",
                choices: [
                    "Download Templates Thumbnail",
                    "Download Templates Data",
                    "Download Templates HTML",
                    "Download Templates JSON",
                    "Minify Templates HTML",
                    "Download Sections Data",
                    "Download Sections Thumbnails",
                    "Optimize images page templates",
                    "Optimize images section templates",
                    "Merge Data JSON",
                    "Check templates data"
                ],
            },
        ])
        .then(async (answers) => {
            console.log(answers);
            switch (answers.action) {
                case "Download Templates Thumbnail":
                    downloadTemplatesThumbnail(["mobile", "desktop"]);
                    break;
                case "Download Templates Data":
                    downloadTemplatesHtml();
                    downloadTemplatesJson(templateHandles);
                    break;
                case "Download Templates HTML":
                    downloadTemplatesHtml();
                    break;
                case "Download Templates JSON":
                    downloadTemplatesJson(templateHandles);
                    break;
                case "Minify Templates HTML":
                    minifyHtml("html");
                    break;
                case 'Download Sections Data':
                    downloadSectionsData()
                    break;
                case 'Download Sections Thumbnails':
                    downloadSectionThumbnails()
                    break;
                case "Optimize images page templates":
                    await optimizeImages('screenshots');
                    await tinifyImages('screenshots', 'optimized')
                    break;
                case "Optimize images section templates":
                    await optimizeImages('sections', 'sections-optimized');
                    await tinifyImages('sections', 'sections-optimized');
                    break;
                case "Merge Data JSON":
                    mergeAllJsonIntoOne('section-data');
                    break;
                case "Check templates data":
                    checkTemplatesData();
                    break;
                default:
                    break;
            }
        })
        .catch((error) => {
            console.log(error);
        });
}

main();
