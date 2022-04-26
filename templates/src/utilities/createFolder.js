const fs = require('fs')

module.exports.checkAndCreateFolder = function (name) {
    if (!fs.existsSync(name)) {
        fs.mkdirSync(name);
    }
}