import { addDays, createDateComparator } from '../utils/dates.js';
import {
    isEventDateMatchingDayOfWeek,
    isEventMatchingPlace,
    isMatchingTimeSlot,
    isTextMatchingPatterns,
} from './checks.js';

const filterEventByBasicData = (events, rules) => {
    if (rules.length === 0 || events.length === 0) return [];

    const eventsMatchingRules = new Set();

    for (const rule of rules) {
        for (const event of events) {
            if (isEventBasicDataMatchingRule(event, rule)) {
                eventsMatchingRules.add(event);
            }
        }
    }

    return Array.from(eventsMatchingRules);
};

const isEventBasicDataMatchingRule = (event, rule) => {
    return (
        createDateComparator(addDays(new Date(), 1)).isSameOrBefore(event.start, 'day') && // Only events from tomorrow on
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

export { filterEventByBasicData };
