import * as Env from '../env.js';
import * as Logger from '../logger.js';

const bookEvent = async (event, page) => {
    const discountOption = Env.get('USE_DISCOUNT_CARD', 'false') === 'true' ? '329' : '';

    Logger.debug(`Booking event: ${event.link}`);
    await page.goto(`${event.link}/rezerwuj`);
    Logger.debug(`Opened event page: ${event.link}`);
    await page.select('#id_opcji_ceny', discountOption);
    await page.locator('#regulamin_klubu').click();
    await page.locator('form button[type=submit]').click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.locator('form button[type=submit]').click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    Logger.debug(`Starting payment: ${event.link}`);
    // TODO Check how it works with non immediately payable events

    // Selecting events - all events selected by default
    await page.locator('#czy_saldo').click(); // Use the club wallet
    await page.locator('form button[type=submit]').click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    // Confirming the order
    await page.locator('form button[type=submit]').click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    Logger.debug(`Event booked: ${event.link}`);
};

export { bookEvent };
