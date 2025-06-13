const { Logger, runInErrorContextAsync, addDays } = require('../utils');

function extractEventsData(text) {
    const eventsMarker = 'events: [';
    const eventsStartIndex = text.indexOf(eventsMarker);

    if (eventsStartIndex === -1) {
        // Marker 'events: [' not found
        return [];
    }

    // The array literal itself starts at the '[' character
    const arrayStartIndex = eventsStartIndex + eventsMarker.length - 1;

    let balance = 0; // To track nesting of brackets []
    let inString = false; // True if currently inside a string literal
    let stringChar = null; // Stores ' or " when inString is true
    let escapeNext = false; // True if the next character is escaped (e.g., \")
    let arrayEndIndex = -1;

    // Iterate through the string to find the matching closing bracket ']'
    // for the events array, correctly handling brackets within string literals.
    for (let i = arrayStartIndex; i < text.length; i++) {
        const char = text[i];

        if (escapeNext) {
            escapeNext = false; // Current character was escaped, ignore its special meaning
            continue;
        }

        if (char === '\\') {
            escapeNext = true; // Next character is escaped
            continue;
        }

        if (inString) {
            // If inside a string, only the matching quote character ends the string
            if (char === stringChar) {
                inString = false;
            }
        } else {
            // Not inside a string
            if (char === '"' || char === "'") {
                inString = true;
                stringChar = char;
            } else if (char === '[') {
                balance++;
            } else if (char === ']') {
                balance--;
                if (balance === 0) {
                    // This ']' is the one that closes the events array
                    arrayEndIndex = i;
                    break;
                }
            }
        }
    }

    if (arrayEndIndex === -1) {
        // Matching closing bracket ']' not found
        return [];
    }

    // Extract the string representation of the array (e.g., "[{...}, {...}]")
    let eventsArrayString = text.substring(arrayStartIndex, arrayEndIndex + 1);

    // Remove JavaScript block comments (/* ... */)
    eventsArrayString = eventsArrayString.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove JavaScript line comments (// ...)
    eventsArrayString = eventsArrayString.replace(/\/\/.*$/gm, '');

    try {
        // Use `new Function` to parse the string as a JavaScript array literal.
        // This approach can handle non-JSON-strict JavaScript object literals,
        // such as unquoted keys (if valid identifiers) and trailing commas,
        // as long as the JavaScript syntax is valid.
        const F = new Function('return ' + eventsArrayString);
        return F();
    } catch (e) {
        // If parsing fails (e.g., malformed JavaScript in the extracted string)
        Logger.error('Events data parsing failed');
        return [];
    }
}

const getEventsBasicDataFromAddress = async (page, address) => {
    await page.goto(address);

    const scripts = await page.$$('script');
    for (const script of scripts) {
        const text = await page.evaluate(el => el.innerText || '', script);

        // Script performs calendar operations
        if (text && text.toLowerCase().includes('fullcalendar')) {
            const events = extractEventsData(text);
            return events.map(x => ({
                ...x,
                date: new Date(x.start).toLocaleDateString(),
                link: `https://kluby.org${x.url}`.split('?')[0],
            }));
        }
    }

    Logger.debug(`No script with events found on address: ${address}`);
    return [];
};

const adjustMonthFormat = jsMonth => (jsMonth < 9 ? `0${jsMonth + 1}` : `${jsMonth + 1}`);

const getDateQueryParam = date =>
    `data_grafiku=${date.getFullYear()}-${adjustMonthFormat(date.getMonth())}-${date.getDate()}`;

const getEventsFromLocation = async (page, location) => {
    const urls = {
        Gdansk: 'https://kluby.org/padbox/wydarzenia',
        Gdynia: 'https://kluby.org/gdynia-padel-club/wydarzenia',
    };

    const thisWeekEventsUrl = `${urls[location]}?widok_grafiku=plan_tygodnia&${getDateQueryParam(new Date())}`;
    const nextWeekEventsUrl = `${urls[location]}?widok_grafiku=plan_tygodnia&${getDateQueryParam(addDays(new Date(), 7))}`;

    const thisWeekEvents = await runInErrorContextAsync(
        async () => {
            return await getEventsBasicDataFromAddress(page, thisWeekEventsUrl);
        },
        { thisWeekEventsUrl },
    );

    const nextWeekEvents = await runInErrorContextAsync(
        async () => {
            return await getEventsBasicDataFromAddress(page, nextWeekEventsUrl);
        },
        { nextWeekEventsUrl },
    );

    return [...thisWeekEvents, ...nextWeekEvents].map(event => ({
        ...event,
        place: location,
    }));
};

const getEventsBasicData = async page => {
    const eventsGdynia = await getEventsFromLocation(page, 'Gdynia');
    const eventsGdansk = await getEventsFromLocation(page, 'Gdansk');

    Logger.debug(
        `Found events in Gdynia: ${eventsGdynia.length}, in Gdansk: ${eventsGdansk.length}.`,
    );

    return [...eventsGdynia, ...eventsGdansk];
};

module.exports = {
    getEventsBasicData,
};
