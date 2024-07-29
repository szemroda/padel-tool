const { Logger, Env, runInErrorContextAsync } = require('../utils');

const getEventsDetails = async (page, events) => {
    const eventsWithDetails = [];

    for (const event of events) {
        const details = await runInErrorContextAsync(
            async () => await getEventDetails(page, event),
            {
                event,
            },
        );
        eventsWithDetails.push(details);
    }

    Logger.debug(`Found events with details: ${eventsWithDetails.length}`);

    return eventsWithDetails;
};

const getEventDetails = async (page, event) => {
    await page.goto(event.link);

    return {
        ...event,
        assigned: await isUserAssignedToEvent(page),
        isSlotAvailable: await isSlotAvailable(page),
        details: await getEventDescription(page),
    };
};

const getEventDescription = async page => {
    const fullDetailsHandle = await page.$('body > div:nth-child(7) > div > div.col-md-8');
    const fullDetails = await page.evaluate(element => element.innerText, fullDetailsHandle);
    return fullDetails;
};

const isUserAssignedToEvent = async page => {
    const userName = Env.get('KLUBY_USER_NAME');
    const assignedHandles = await page.$$(
        'body > div:nth-child(7) > div > div.col-md-8 > div.list-group > div.list-group-item',
    );
    for (const handle of assignedHandles) {
        const text = await page.evaluate(element => element.innerText, handle);
        if (text.includes(userName)) {
            return true;
        }
    }

    return false;
};

const isSlotAvailable = async page => {
    const handles = await page.$$('.alert.alert-warning');
    for (const handle of handles) {
        const text = await page.evaluate(element => element.innerText, handle);
        if (text.includes('Limit zgłoszeń został wyczerpany')) {
            return false;
        }
    }

    return true;
};

module.exports = {
    getEventsDetails,
};
