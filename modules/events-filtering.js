const isEventAvailable = event => {
    return event.isSlotAvailable && !event.assigned;
};

const isTextMatchingPatterns = (text, patterns) =>
    !patterns ||
    patterns.length === 0 ||
    patterns.every(pattern => new RegExp(pattern, 'gmi').test(text));

const isEventMatchingRule = (event, rule) => {
    return (
        event.place === rule.conditions.place &&
        new Date(event.date).getDay() === rule.conditions.dayOfWeek &&
        isTextMatchingPatterns(event.title, rule.conditions.titlePatterns) &&
        isTextMatchingPatterns(event.details, rule.conditions.descriptionPatterns)
    );
};

const filterEventsMatchingRules = (events, rules) => {
    if (rules.length === 0 || events.length === 0) return [];

    const eventsMatchingRules = new Set();

    for (const rule of rules) {
        for (const event of events) {
            if (isEventAvailable(event) && isEventMatchingRule(event, rule)) {
                eventsMatchingRules.add(event);
            }
        }
    }

    return Array.from(eventsMatchingRules);
};

module.exports = {
    isEventAvailable,
    isEventMatchingRule,
    filterEventsMatchingRules,
};
