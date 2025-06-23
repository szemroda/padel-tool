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

/**
 *
 * @param {{start: Date, end: Date}} eventTimeSlot
 * @param {{start: string, end: string} | null | undefined} timeSlot
 * @returns {boolean}
 */
const isMatchingTimeSlot = (eventTimeSlot, timeSlot) => {
    if (!timeSlot) return true;

    return (
        isDateWithinTimeSlot(eventTimeSlot.start, timeSlot) &&
        isDateWithinTimeSlot(eventTimeSlot.end, timeSlot)
    );
};

const isDateWithinTimeSlot = (date, timeSlot) => {
    const dateHours = date.getHours();
    const dateMinutes = date.getMinutes();
    const dateSeconds = date.getSeconds();

    const startTime = parseTime(timeSlot.start);
    const endTime = parseTime(timeSlot.end);

    const dateTotalSeconds = dateHours * 3600 + dateMinutes * 60 + dateSeconds;
    const startTotalSeconds = startTime.hours * 3600 + startTime.minutes * 60 + startTime.seconds;
    const endTotalSeconds = endTime.hours * 3600 + endTime.minutes * 60 + endTime.seconds;

    return dateTotalSeconds >= startTotalSeconds && dateTotalSeconds <= endTotalSeconds;
};

const parseTime = timeString => {
    const parts = timeString.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parts[2] ? parseInt(parts[2], 10) : 0;
    return { hours, minutes, seconds };
};

export {
    isEventDateMatchingDayOfWeek,
    isEventMatchingPlace,
    isMatchingTimeSlot,
    isTextMatchingPatterns,
};
