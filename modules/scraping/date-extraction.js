const convertMonthNameToNumber = monthName => {
    const monthNames = [
        'stycznia',
        'lutego',
        'marca',
        'kwietnia',
        'maja',
        'czerwca',
        'lipca',
        'sierpnia',
        'września',
        'października',
        'listopada',
        'grudnia',
    ];
    return monthNames.indexOf(monthName) + 1;
};

const convertDateStringToDate = dateString => {
    const [day, monthName, year] = dateString.split(' ');

    return `${year}-${convertMonthNameToNumber(monthName)}-${day}`;
};

const getEventDateString = text => {
    return text.match(/(Termin:) (\d+ .* \d{4})/)[2]?.trim() ?? '';
};

const convertToEventDate = str => {
    return convertDateStringToDate(getEventDateString(str));
};

module.exports = {
    convertToEventDate,
};
