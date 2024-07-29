const BookedEventsMemo = require('../memo');
const { Logger, runInErrorContextAsync } = require('../utils');

const bookEvents = async (events, page) => {
    for (const event of events) {
        await runInErrorContextAsync(
            async () => {
                await page.goto(event.link);
                await page.locator('form button[type=submit]').click();
                BookedEventsMemo.addBookedEvent(event);
            },
            { event },
        );
    }

    Logger.debug(`Booked ${events.length} events.`);
};

module.exports = {
    bookEvents,
};
