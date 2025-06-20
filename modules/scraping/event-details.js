const { Env, runInErrorContextAsync, Logger } = require('../utils');

const getEventDetails = async (page, event) => {
    return await runInErrorContextAsync(
        async () => {
            await page.goto(event.link);
            const assigned = await isUserAssignedToEvent(page);

            return {
                ...event,
                assigned,
                isSlotAvailable: !assigned && (await isSlotAvailable(page)), // If user is assigned to event, we don't need to check if slot is available
            };
        },
        { event },
    );
};

const isUserAssignedToEvent = async page => {
    const userName = Env.get('KLUBY_USER_NAME');
    const assignedHandles = await page.$$('table.table a');
    for (const handle of assignedHandles) {
        const text = await page.evaluate(element => element.innerText, handle);

        if (textIncludesUserFirstNameOrLastName(text, userName)) {
            // Check the full name on the profile page to avoid false positives
            const eventUrl = await page.url();
            await handle.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
            const headingHandle = await page.$('h1');
            const headingText = await page.evaluate(element => element.innerText, headingHandle);
            await page.goto(eventUrl);

            if (headingText.trim() === userName) {
                return true;
            }
        }
    }

    return false;
};

const textIncludesUserFirstNameOrLastName = (text, userName) => {
    return userName.split(' ').some(namePart => text.trim().includes(namePart));
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
