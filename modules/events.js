const { convertToEventDate } = require('./date-extraction');
const Env = require('./env');

const getEventsFromAddress = async (page, address) => {
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

    for (const event of events) {
        await assignEventDetails(page, event);
    }

    return events;
};

const assignEventDetails = async (page, event) => {
    await page.goto(event.link);
    event.assigned = await isUserAssignedToEvent(page);
    event.isSlotAvailable = await isSlotAvailable(page);
    event.details = await getEventDetails(page);
};

const getEventDetails = async page => {
    const fullDetailsHandle = await page.$('body > div:nth-child(7) > div > div.col-md-8');
    const fullDetails = await page.evaluate(element => element.innerText, fullDetailsHandle);
    return fullDetails;
};

const isUserAssignedToEvent = async page => {
    const userName = Env.get('USER_NAME');
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

const bookEvents = async (events, page) => {
    for (const event of events) {
        await page.goto(event.link);
        await page.locator('form button[type=submit]').click();
    }
};

const getEventsInGdynia = async page => {
    const events = await getEventsFromAddress(
        page,
        'https://kluby.org/gdynia-padel-club/wydarzenia?typ_wydarzenia=3',
    );

    return events.map(event => ({ ...event, place: 'Gdynia' }));
};

const getEventsInGdansk = async page => {
    const events = await getEventsFromAddress(
        page,
        'https://kluby.org/padbox/wydarzenia?typ_wydarzenia=3',
    );

    return events.map(event => ({ ...event, place: 'Gdansk' }));
};

module.exports = {
    getEventsFromAddress,
    bookEvents,
    getEventsInGdynia,
    getEventsInGdansk,
};
