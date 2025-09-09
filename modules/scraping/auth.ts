import { env } from '../env.ts';
import * as Logger from '../logger.ts';
import type puppeteer from 'puppeteer';

export const authenticate = async (page: puppeteer.Page) => {
    await page.goto('https://kluby.org/logowanie?page=/padel');
    await page.locator('#konto').fill(env.KLUBY_EMAIL);
    await page.locator('#haslo').fill(env.KLUBY_PASSWORD);
    await page.locator('#remember').click();
    await page
        .locator(
            'body > div:nth-child(1) > div > div > div.panel.panel-default > div > div.row > div > form > button',
        )
        .click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    Logger.debug('Authenticated');
};

