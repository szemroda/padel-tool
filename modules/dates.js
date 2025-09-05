import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';

dayjs.extend(isSameOrBefore);

const createDateComparator = date => {
    const day = dayjs(date);

    return {
        isSameOrBefore: (otherDate, unit) => day.isSameOrBefore(otherDate, unit),
    };
};

const isValidDate = date => dayjs(date).isValid();

const addDays = (date, days) => dayjs(date).add(days, 'day').toDate();

export { addDays, createDateComparator, isValidDate };
