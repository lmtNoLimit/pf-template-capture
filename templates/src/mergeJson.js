const fs = require("fs");

module.exports.mergeAllJsonIntoOne = function (directory) {
    const files = fs.readdirSync(directory);
    const json = [];
    for (let file of files) {
        if (file.endsWith(".json") && !file.startsWith('data')) {
            const data = JSON.parse(fs.readFileSync(`${directory}/${file}`, "utf8"));
            json.push(...data)
        }
    }
    fs.writeFileSync(`${directory}/data.min.json`, JSON.stringify(json));
    fs.writeFileSync(`${directory}/data.json`, JSON.stringify(json, null, 2));
}