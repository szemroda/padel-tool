const dayjs = require('dayjs');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');

dayjs.extend(isSameOrBefore);

const createDateComparator = date => {
    const day = dayjs(date);

    return {
        isSameOrBefore: (otherDate, unit) => day.isSameOrBefore(otherDate, unit),
    };
};

const isValidDate = date => dayjs(date).isValid();

module.exports = { createDateComparator, isValidDate };
