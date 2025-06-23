import { get } from '../utils/env.js';
import { Logger, runInErrorContextAsync } from '../utils/index.js';

const bookEvent = async (event, page) => {
    await runInErrorContextAsync(
        async () => {
            const discountOption = get('USE_DISCOUNT_CARD', 'false') === 'true' ? '329' : '';

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
        },
        { event },
    );
};

export { bookEvent };
