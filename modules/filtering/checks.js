const BookedEventsMemo = require('../memo');

const isTextMatchingPatterns = (text, patterns) =>
    !patterns ||
    patterns.length === 0 ||
    patterns.every(pattern => new RegExp(pattern, 'gmi').test(text));

const isEventAvailable = event => {
    return event.isSlotAvailable && !event.assigned;
};

const isEventDateMatchingDayOfWeek = (event, dayOfWeek) =>
    new Date(event.date).getDay() === dayOfWeek;

const isEventBooked = event => BookedEventsMemo.isBooked(event);

const isEventMatchingPlace = (event, place) => event.place === place;

module.exports = {
    isTextMatchingPatterns,
    isEventAvailable,
    isEventDateMatchingDayOfWeek,
    isEventBooked,
    isEventMatchingPlace,
};
