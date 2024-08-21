const isTextMatchingPatterns = (text, patterns) =>
    !patterns ||
    patterns.length === 0 ||
    patterns.every(pattern => isTextMatchingPattern(text, pattern));

const isTextMatchingPattern = (text, pattern) => {
    if (typeof pattern === 'string') return new RegExp(pattern, 'gmi').test(text);

    const isMatchingPattern = new RegExp(pattern.pattern, 'gmi').test(text);
    return pattern.negated ? !isMatchingPattern : isMatchingPattern;
};

const isEventDateMatchingDayOfWeek = (date, dayOfWeek) => {
    if (Array.isArray(dayOfWeek)) return dayOfWeek.some(day => isDateMatchingDayOfWeek(date, day));

    return isDateMatchingDayOfWeek(date, dayOfWeek);
};

const isDateMatchingDayOfWeek = (date, dayOfWeek) => new Date(date).getDay() === dayOfWeek;

const isEventMatchingPlace = (event, place) => event.place === place;

module.exports = {
    isTextMatchingPatterns,
    isEventDateMatchingDayOfWeek,
    isEventMatchingPlace,
};
