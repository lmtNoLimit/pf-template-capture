const inquirer = require("inquirer");

const { takeScreenshots, getTemplates } = require("./takeScreenshots");
const { VIEWPORT } = require("../config");

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
