import { TimeoutError } from 'puppeteer';
import { closeBrowser, initializeBrowser } from './browser/index.js';
import { filterEventByBasicData, filterEventsMatchingRules } from './filtering/index.js';
import { getEnabledRules } from './rules/index.js';
import { authenticate, bookEvent, getEventDetails, getEventsBasicData } from './scraping/index.js';
import { BookedEventsStorage } from './storage/index.js';
import { Env, groupBy, Logger } from './utils/index.js';

const main = async () => {
    await safeExecute(executeWorkflow, scheduleNextEvaluation);
};

const safeExecute = async (fn, finallyFn = () => {}) => {
    try {
        await fn();
    } catch (error) {
        if (error instanceof TimeoutError) {
            Logger.warning(`Timeout error occurred. Skipping...`);
            return;
        }

        Logger.error(`${error}\n${error.stack}`);
    } finally {
        await finallyFn();
    }
};

const executeWorkflow = async () => {
    const { browser, page } = await initializeBrowser();
    await safeExecute(
        () => runAssignmentProcess(page),
        () => closeBrowser(browser),
    );
};

const runAssignmentProcess = async page => {
    const rules = getEnabledRules();
    if (rules.length === 0) {
        return;
    }

    const eventsBasicData = await getEventsBasicData(page);
    const filteredEvents = filterEventByBasicData(eventsBasicData, rules);

    if (filteredEvents.length === 0) return;

    // To check event details and book events we need to authenticate first.
    await authenticate(page);
    const eventsDetails = attachStoredDataToEvents(await getEventsDetails(page, filteredEvents));
    Logger.debug(
        `Event details: \n\t${eventsDetails.map(e => `[${e.start}] ${e.link} - assigned ${e.assigned}, slot available: ${e.isSlotAvailable}`).join('\n\t')}`,
    );
    const filteredEventDetails = filterEventsBySingleRulePrinciple(eventsDetails, rules);

    await bookEventsUsingLocationRestriction(filteredEventDetails, page);
};

const getEventsDetails = async (page, events) => {
    const eventsWithDetails = [];

    for (const event of events) {
        // When an error occurs during event details retrieval, we don't want to stop the whole process, just omit the event.
        await safeExecute(async () => {
            const details = await getEventDetails(page, event);
            eventsWithDetails.push(details);
        });
    }

    Logger.debug(`Found events with details: ${eventsWithDetails.length}`);

    return eventsWithDetails;
};

const attachStoredDataToEvents = events => {
    BookedEventsStorage.addMany(events.filter(event => event.assigned));
    const eventsToUpdate = events.map(event => ({ ...event }));
    const bookedEvents = new Set(BookedEventsStorage.get());
    for (const event of eventsToUpdate) {
        event.assigned = event.assigned || bookedEvents.has(event.link.trim());
    }
    return eventsToUpdate;
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
            await executeEventBooking(event, page);
        }
    }
};

const executeEventBooking = async (event, page) => {
    await safeExecute(
        () => bookEvent(event, page),
        () => {
            // Even if booking fails, mark the event as assigned to prevent further attempts.
            // It's important to avoid booking the same event multiple times!
            BookedEventsStorage.add(event);
            event.assigned = true;
        },
    );
};

const scheduleNextEvaluation = () => {
    const minutesToNextEvaluation = +Env.get('INTERVAL_MINUTES', 5);
    const timeToNextEvaluation = 60_000 * minutesToNextEvaluation;

    Logger.debug(`Next evaluation in ${minutesToNextEvaluation} minutes.`);

    setTimeout(main, timeToNextEvaluation);
};

export { main };
