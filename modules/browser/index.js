import puppeteer from 'puppeteer';
import * as Env from '../utils/env.js';
import * as Logger from '../utils/logger.js';

const initializeBrowser = async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: Env.get('PUPPETEER_BROWSER_ARGS', '')
            .split(';')
            .map(arg => arg.trim())
            .filter(arg => arg),
    });
    const page = await browser.newPage();
    Logger.debug('Browser started');

    return { browser, page };
};

const closeBrowser = async browser => {
    await browser.close();
    Logger.debug('Browser closed');
};

export { closeBrowser, initializeBrowser };
