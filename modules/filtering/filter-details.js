import { filterEventByBasicData } from './filter-basic-data.js';

const filterEventsMatchingRules = (events, rules) => {
    return filterEventByBasicData(events, rules);
};

export { filterEventsMatchingRules };
