import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';

dayjs.extend(isSameOrBefore);

type DateLike = Date | string | number;

export const createDateComparator = (date: DateLike) => {
    const day = dayjs(date);

    return {
        isSameOrBefore: (otherDate: DateLike, unit: dayjs.UnitType) =>
            day.isSameOrBefore(otherDate, unit),
    };
};

export const isValidDate = (date: DateLike) => dayjs(date).isValid();
export const addDays = (date: DateLike, days: number) => dayjs(date).add(days, 'day').toDate();
export const toIsoDateString = (date: DateLike) => dayjs(date).format('YYYY-MM-DD');
export const toIsoDateTimeString = (date: DateLike) => dayjs(date).toDate().toISOString();
