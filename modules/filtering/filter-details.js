const { filterEventByBasicData } = require('./filter-basic-data');

const filterEventsMatchingRules = (events, rules) => {
    return filterEventByBasicData(events, rules);
};

module.exports = {
    filterEventsMatchingRules,
};
