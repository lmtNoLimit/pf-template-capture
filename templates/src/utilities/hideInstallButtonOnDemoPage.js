module.exports.hideInstallButtonOnDemoPage = async function (page) {
    await page.evaluate(() => {
        const btnInstall = document.querySelector(".pf-btn-install");
        btnInstall && btnInstall.remove();
    });
}