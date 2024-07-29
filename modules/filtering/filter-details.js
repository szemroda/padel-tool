const { isTextMatchingPatterns } = require('./checks');
const { filterEventByBasicData } = require('./filter-basic-data');
const { runInErrorContext } = require('../utils');

const filterEventsMatchingRules = (events, rules) => {
    const eventsMatchingBasicFilters = filterEventByBasicData(events, rules);
    if (rules.length === 0 || eventsMatchingBasicFilters.length === 0) return [];

    const eventsMatchingRules = new Set();

    for (const rule of rules) {
        for (const event of eventsMatchingBasicFilters) {
            runInErrorContext(
                () => {
                    if (isEventMatchingRule(event, rule)) {
                        eventsMatchingRules.add(event);
                    }
                },
                { event, rule },
            );
        }
    }

    return Array.from(eventsMatchingRules);
};

const isEventMatchingRule = (event, rule) => {
    return isTextMatchingPatterns(event.details, rule.conditions.descriptionPatterns);
};

module.exports = {
    filterEventsMatchingRules,
};
