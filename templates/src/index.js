const inquirer = require("inquirer");
const { downloadTemplatesThumbnail } = require("./downloadTemplatesThumbnail");
const { minifyHtml } = require("./minify-html");
const { downloadTemplatesHtml } = require("./downloadTemplatesHtml");
const { downloadTemplatesJson } = require("./downloadTemplatesJson");
const { templateHandles } = require("./constant")
const { tinifyImages } = require("./optimizer")

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
                case "Optimize images":
                    await optimizeImages();
                    await tinifyImages()
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
