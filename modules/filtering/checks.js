const isTextMatchingPatterns = (text, patterns) =>
    !patterns ||
    patterns.length === 0 ||
    patterns.every(pattern => new RegExp(pattern, 'gmi').test(text));

const isEventDateMatchingDayOfWeek = (date, dayOfWeek) => new Date(date).getDay() === dayOfWeek;

const isEventMatchingPlace = (event, place) => event.place === place;

module.exports = {
    isTextMatchingPatterns,
    isEventDateMatchingDayOfWeek,
    isEventMatchingPlace,
};
