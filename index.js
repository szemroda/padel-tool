const puppeteer = require('puppeteer');
const { authenticate } = require('./modules/auth');
const {
    bookEvents,
    getEventsInGdynia,
    getEventsInGdansk,
    getEventsDetails,
} = require('./modules/events');
const { getEnabledRules } = require('./modules/firebase');
const { filterEventsMatchingRules, filterEventByBasicData } = require('./modules/events-filtering');
const Logger = require('./modules/logger');
const Env = require('./modules/env');

main();

async function main() {
    const { browser, page } = await initializeBrowser();

    await authenticate(page);
    Logger.debug('Authenticated');

    await runAssignmentProcess(page);

    await browser.close();
    Logger.debug('Browser closed');
}

async function initializeBrowser() {
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();
    Logger.debug('Browser started');

    return { browser, page };
}

async function runAssignmentProcess(page) {
    try {
        await evaluateEvents(page);
    } catch (error) {
        Logger.error(`Error occurred: ${error}.\n\t\t${error.stack}`);
    } finally {
        nextTick();
    }
}

async function evaluateEvents(page) {
    Logger.debug('Starting evaluation');
    const rules = await getEnabledRules();

    if (rules.length === 0) {
        Logger.debug('Skipping evaluation due to no active rules');
        nextTick();
        return;
    } else {
        Logger.debug(`Found rules: ${rules.length}`);
    }

    const eventsGdyniaMatchingBasicRules = filterEventByBasicData(
        await getEventsInGdynia(page),
        rules,
    );
    const eventsToBookGdynia = filterEventsMatchingRules(
        await getEventsDetails(page, eventsGdyniaMatchingBasicRules),
        rules,
    );
    Logger.debug(`Found events in Gdynia: ${eventsToBookGdynia.length}`);

    const eventsGdanskMatchingBasicRules = filterEventByBasicData(
        await getEventsInGdansk(page),
        rules,
    );
    const eventsToBookGdansk = filterEventsMatchingRules(
        await getEventsDetails(page, eventsGdanskMatchingBasicRules),
        rules,
    );
    Logger.debug(`Found events in Gdansk: ${eventsToBookGdansk.length}`);

    await bookEvents([...eventsToBookGdansk, ...eventsToBookGdynia], page);
    Logger.debug('Events booked. Evaluation finished');
}

function nextTick() {
    setTimeout(main, 60000 * +Env.get('INTERVAL_MINUTES', 5));
}
