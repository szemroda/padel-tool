const { getEnabledRules } = require('./db');
const { authenticate, getEventsBasicData, getEventsDetails, bookEvent } = require('./scraping');
const { initializeBrowser, closeBrowser } = require('./browser');
const { filterEventByBasicData, filterEventsMatchingRules } = require('./filtering');
const { Logger, Env, groupBy } = require('./utils');

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
    const filteredEventDetails = filterEventsBySingleRulePrinciple(
        filterEventsMatchingRules(eventsDetails, rules),
        rules,
    );

    await bookEventsUsingLocationRestriction(filteredEventDetails, page);
};

/**
 * Prevent booking multiple events for the same rule unless it's allowed by the 'multi' flag.
 */
const filterEventsBySingleRulePrinciple = (events, rules) => {
    const filteredEvents = new Set();

    for (const rule of rules) {
        const eventsForRule = filterEventsMatchingRules(events, [rule]);

        if (rule.multi) {
            for (const event of eventsForRule) {
                filteredEvents.add(event);
            }
        } else {
            const isAnyEventForRuleBooked = eventsForRule.some(event => event.assigned);
            if (!isAnyEventForRuleBooked) {
                const availableEvent = eventsForRule.find(
                    event => !event.assigned && event.isSlotAvailable,
                );
                if (availableEvent) filteredEvents.add(availableEvent);
            }
        }
    }

    return Array.from(filteredEvents);
};

/**
 * Book events only in one location per day.
 */
const bookEventsUsingLocationRestriction = async (events, page) => {
    const eventsByDate = groupBy(events, event => event.date);

    for (const event of events) {
        const eventsFromTheSameDate = eventsByDate[event.date];
        const isAnyEventFromTheSameDateBookedInDifferentLocation =
            eventsFromTheSameDate.length > 0 &&
            eventsFromTheSameDate.some(e => e.assigned && e.place !== event.place);
        const canBookEvent =
            !isAnyEventFromTheSameDateBookedInDifferentLocation &&
            event.isSlotAvailable &&
            !event.assigned;

        if (canBookEvent) {
            await bookEvent(event, page);
            event.assigned = true;
        }
    }
};

const scheduleNextEvaluation = () => {
    const minutesToNextEvaluation = +Env.get('INTERVAL_MINUTES', 5);
    const timeToNextEvaluation = 60_000 * minutesToNextEvaluation;

    Logger.debug(`Next evaluation in ${minutesToNextEvaluation} minutes.`);

    setTimeout(main, timeToNextEvaluation);
};

module.exports = { main };
