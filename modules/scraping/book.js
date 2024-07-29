const { Logger, runInErrorContextAsync } = require('../utils');

const bookEvent = async (event, page) => {
    await runInErrorContextAsync(
        async () => {
            await page.goto(event.link);
            await page.locator('form button[type=submit]').click();
        },
        { event },
    );

    Logger.debug(`Booked event: ${event.title} - ${event.date}`);
};

module.exports = {
    bookEvent,
};
