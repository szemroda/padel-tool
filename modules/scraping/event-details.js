const { Env, runInErrorContextAsync } = require('../utils');

const getEventDetails = async (page, event) => {
    return await runInErrorContextAsync(
        async () => {
            await page.goto(event.link);

            return {
                ...event,
                assigned: await isUserAssignedToEvent(page),
                isSlotAvailable: await isSlotAvailable(page),
            };
        },
        { event },
    );
};

const isUserAssignedToEvent = async page => {
    const userName = Env.get('KLUBY_USER_NAME');
    const assignedHandles = await page.$$('.list-group a');
    for (const handle of assignedHandles) {
        const text = await page.evaluate(element => element.innerText, handle);
        if (text.includes(userName)) {
            return true;
        }
    }

    return false;
};

const isSlotAvailable = async page => {
    const elementHandles = await page.$$('a.btn');
    for (const handle of elementHandles) {
        const text = await page.evaluate(element => element.innerText, handle);

        if (text.toLowerCase().trim() === 'rezerwuj') {
            const classes = await page.evaluate(element => Array.from(element.classList), handle);
            const hasDisabledStatus = classes.some(x => x.includes('disabled'));
            return !hasDisabledStatus;
        }
    }

    Logger.error('No register button found!');
    return false;
};

module.exports = {
    getEventDetails,
};
