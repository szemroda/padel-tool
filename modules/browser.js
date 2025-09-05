import puppeteer from 'puppeteer';
import * as Env from './env.js';
import * as Logger from './logger.js';

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
