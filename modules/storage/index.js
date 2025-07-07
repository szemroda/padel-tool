import fs from 'node:fs';
import path from 'path';
import * as Env from '../utils/env.js';

const filePath = Env.get('BOOKED_EVENTS_STORAGE_PATH');

const getBookedEventLinks = () => {
    if (!fs.existsSync(filePath)) return [];

    const bookedEvents = fs.readFileSync(filePath);

    try {
        // Prevent parsing empty file or invalid JSON.
        return JSON.parse(bookedEvents);
    } catch (error) {
        return [];
    }
};

const addBookedEvent = event => {
    addBookedEvents([event]);
};

const addBookedEvents = events => {
    const links = new Set(getBookedEventLinks());
    events.forEach(event => links.add(event.link.trim()));
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(Array.from(links)));
};

const BookedEventsStorage = {
    get: getBookedEventLinks,
    add: addBookedEvent,
    addMany: addBookedEvents,
};

export { BookedEventsStorage };
