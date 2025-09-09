import puppeteer from 'puppeteer';
import { env } from './env.ts';
import * as Logger from './logger.ts';

export const initializeBrowser = async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: env.PUPPETEER_BROWSER_ARGS.split(';')
            .map(arg => arg.trim())
            .filter(arg => arg),
    });
    const page = await browser.newPage();
    Logger.debug('Browser started');

    return { browser, page };
};

export const closeBrowser = async (browser: puppeteer.Browser) => {
    await browser.close();
    Logger.debug('Browser closed');
};
