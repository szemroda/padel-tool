const { convertToEventDate } = require('./date-extraction');
const { Logger, runInErrorContextAsync } = require('../utils');

const getEventsBasicDataFromAddress = async (page, address) => {
    await page.goto(address);

    const eventElementHandles = await page.$$('#dataTables-wyzwania > tbody > tr');

    const events = [];

    for (const handle of eventElementHandles) {
        const titleElement = await handle.$('h3');
        const linkElement = await handle.$('td.vert-align.text-center > a');
        const dateElement = await handle.$('td:nth-child(2) > p.list-group-item-text');
        const title = await page.evaluate(element => element.innerText, titleElement);
        const link = await page.evaluate(element => element.href, linkElement);
        const dateText = await page.evaluate(element => element.innerText, dateElement);
        const date = convertToEventDate(dateText);

        events.push({ title, link, date });
    }

    return events;
};

const getEventsInGdynia = async page => {
    return runInErrorContextAsync(async () => {
        const events = await getEventsBasicDataFromAddress(
            page,
            'https://kluby.org/gdynia-padel-club/wydarzenia?typ_wydarzenia=3',
        );

        return events.map(event => ({ ...event, place: 'Gdynia' }));
    });
};

const getEventsInGdansk = async page => {
    return runInErrorContextAsync(async () => {
        const events = await getEventsBasicDataFromAddress(
            page,
            'https://kluby.org/padbox/wydarzenia?typ_wydarzenia=3',
        );

        return events.map(event => ({ ...event, place: 'Gdansk' }));
    });
};

const getEventsBasicData = async page => {
    const eventsGdynia = await getEventsInGdynia(page);
    const eventsGdansk = await getEventsInGdansk(page);

    Logger.debug(
        `Found events in Gdynia: ${eventsGdynia.length}, in Gdansk: ${eventsGdansk.length}.`,
    );

    return [...eventsGdynia, ...eventsGdansk];
};

module.exports = {
    getEventsBasicData,
};
