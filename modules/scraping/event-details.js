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
    const assignedHandles = await page.$$(
        'body > div:nth-child(7) > div > div > div:nth-child(4) > a',
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
    const element = await page.$(
        'body > div:nth-child(7) > div > div > div:nth-child(2) > div:nth-child(2) > a',
    );
    const text = await page.evaluate(element => element.innerText, element);
    const classes = await page.evaluate(element => Array.from(element.classList), element);

    const isRegisterButton = text.toLowerCase().includes('rezerwuj');
    const hasDisabledStatus = classes.some(x => x.includes('disabled'));

    return isRegisterButton && !hasDisabledStatus;
};

module.exports = {
    getEventDetails,
};
