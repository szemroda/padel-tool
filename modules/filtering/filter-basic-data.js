const {
    isTextMatchingPatterns,
    isEventMatchingPlace,
    isEventDateMatchingDayOfWeek,
    isMatchingTimeSlot,
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
        isEventDateMatchingDayOfWeek(event.start, rule.conditions.dayOfWeek) &&
        isTextMatchingPatterns(event.title, rule.conditions.titlePatterns) &&
        isMatchingTimeSlot(
            { start: new Date(event.start), end: new Date(event.end) },
            rule.conditions.timeSlot
                ? {
                      start: rule.conditions.timeSlot.start,
                      end: rule.conditions.timeSlot.end,
                  }
                : null,
        )
    );
};

module.exports = { filterEventByBasicData };
