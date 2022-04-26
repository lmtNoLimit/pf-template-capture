module.exports.goToUrl = async function (page, url) {
    await page.goto(url, { waitUntil: "networkidle0" });
}