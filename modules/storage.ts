import fs from 'node:fs';
import path from 'path';
import { env } from './env.ts';
import { z } from 'zod';
import type { Event } from './schemas.ts';

type StoredData = string[];

const filePath = env.BOOKED_EVENTS_STORAGE_PATH;

const getBookedEventLinks = (): StoredData => {
    if (!fs.existsSync(filePath)) return [];

    const bookedEvents = fs.readFileSync(filePath, 'utf-8');

    try {
        // Prevent parsing empty file or invalid JSON.
        return JSON.parse(bookedEvents);
    } catch (error) {
        return [];
    }
};

const addBookedEvent = (event: Event) => {
    addBookedEvents([event]);
};

const addBookedEvents = (events: Event[]) => {
    const links = new Set(getBookedEventLinks());
    events.forEach(event => links.add(event.link.trim()));
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(Array.from(links)));
};

export const BookedEventsStorage = {
    get: getBookedEventLinks,
    add: addBookedEvent,
    addMany: addBookedEvents,
};
