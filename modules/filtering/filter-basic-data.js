const {
    isTextMatchingPatterns,
    isEventMatchingPlace,
    isEventDateMatchingDayOfWeek,
} = require('./checks');
const { runInErrorContext } = require('../utils');

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

const isEventBasicDataMatchingRule = (event, rule) => {
    return (
        isEventMatchingPlace(event, rule.conditions.place) &&
        isEventDateMatchingDayOfWeek(event.date, rule.conditions.dayOfWeek) &&
        isTextMatchingPatterns(event.title, rule.conditions.titlePatterns)
    );
};

module.exports = { filterEventByBasicData };
