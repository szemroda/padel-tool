const puppeteer = require('puppeteer');
const { Logger } = require('../utils');

const initializeBrowser = async () => {
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();
    Logger.debug('Browser started');

    return { browser, page };
};

const closeBrowser = async browser => {
    await browser.close();
    Logger.debug('Browser closed');
};

module.exports = { initializeBrowser, closeBrowser };
