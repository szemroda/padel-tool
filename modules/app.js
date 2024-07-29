const { getEnabledRules } = require('./db');
const { authenticate, getEventsBasicData, getEventsDetails, bookEvents } = require('./scraping');
const { initializeBrowser, closeBrowser } = require('./browser');
const { filterEventByBasicData, filterEventsMatchingRules } = require('./filtering');
const { Logger, Env } = require('./utils');

const main = async () => {
    try {
        await executeWorkflow();
    } catch (error) {
        Logger.error(`${error}\n${error.stack}`);
    } finally {
        scheduleNextEvaluation();
    }
};

const executeWorkflow = async () => {
    const { browser, page } = await initializeBrowser();
    await authenticate(page);
    await runAssignmentProcess(page);
    await closeBrowser(browser);
};

const runAssignmentProcess = async page => {
    const rules = await getEnabledRules();
    if (rules.length === 0) {
        return;
    }

    const eventsBasicData = await getEventsBasicData(page);
    const filteredEvents = filterEventByBasicData(eventsBasicData, rules);
    const eventsDetails = await getEventsDetails(page, filteredEvents);
    const eventsToBook = filterEventsMatchingRules(eventsDetails, rules);

    bookEvents(eventsToBook, page);
};

const scheduleNextEvaluation = () => {
    const minutesToNextEvaluation = +Env.get('INTERVAL_MINUTES', 5);
    const timeToNextEvaluation = 60_000 * minutesToNextEvaluation;

    Logger.debug(`Next evaluation in ${minutesToNextEvaluation} minutes.`);

    setTimeout(main, timeToNextEvaluation);
};

module.exports = { main };
