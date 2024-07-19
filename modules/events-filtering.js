const { runInErrorContext } = require('./errors');
const BookedEventsMemo = require('./booked-events-memo');

const isEventAvailable = event => {
    return event.isSlotAvailable && !event.assigned;
};

const isTextMatchingPatterns = (text, patterns) =>
    !patterns ||
    patterns.length === 0 ||
    patterns.every(pattern => new RegExp(pattern, 'gmi').test(text));

const isEventBasicDataMatchingRule = (event, rule) => {
    return (
        !BookedEventsMemo.isBooked(event) &&
        event.place === rule.conditions.place &&
        new Date(event.date).getDay() === rule.conditions.dayOfWeek &&
        isTextMatchingPatterns(event.title, rule.conditions.titlePatterns)
    );
};

const isEventMatchingRule = (event, rule) => {
    return (
        isEventBasicDataMatchingRule(event, rule) &&
        isTextMatchingPatterns(event.details, rule.conditions.descriptionPatterns)
    );
};

const filterEventByBasicData = (events, rules) => {
    if (rules.length === 0 || events.length === 0) return [];

    const eventsMatchingRules = new Set();

    for (const rule of rules) {
        for (const event of events) {
            runInErrorContext(
                () => {
                    if (isEventBasicDataMatchingRule(event, rule)) {
                        eventsMatchingRules.add(event);
                    }
                },
                { event, rule },
            );
        }
    }

    return Array.from(eventsMatchingRules);
};

const filterEventsMatchingRules = (events, rules) => {
    if (rules.length === 0 || events.length === 0) return [];

    const eventsMatchingRules = new Set();

    for (const rule of rules) {
        for (const event of events) {
            runInErrorContext(
                () => {
                    if (isEventAvailable(event) && isEventMatchingRule(event, rule)) {
                        eventsMatchingRules.add(event);
                    }
                },
                { event, rule },
            );
        }
    }

    return Array.from(eventsMatchingRules);
};

module.exports = {
    isEventAvailable,
    isEventMatchingRule,
    filterEventsMatchingRules,
    filterEventByBasicData,
};
