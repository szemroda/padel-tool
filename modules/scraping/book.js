const { Logger, runInErrorContextAsync } = require('../utils');

const bookEvent = async (event, page) => {
    await runInErrorContextAsync(
        async () => {
            Logger.debug(`Booking event: ${event.link}`);
            await page.goto(event.link);
            Logger.debug(`Opened event page: ${event.link}`);
            await page.locator('form button[type=submit]').click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
            Logger.debug(`Event booked: ${event.link}`);
        },
        { event },
    );
};

module.exports = {
    bookEvent,
};
