import * as Env from '../env.js';

const getEventDetails = async (page, event) => {
    const url = new URL(event.link);
    const userName = Env.get('KLUBY_USER_NAME');
    await page.goto(`${url.origin}${url.pathname}/uczestnicy`);
    const badge = await page.$(`h4 span.badge`);
    const isSlotAvailable = await page.evaluate(participantsCountBadge => {
        // Badge may not exist e.g. if there are no participants yet.
        if (!participantsCountBadge) {
            return undefined;
        }

        const [assigned, maxParticipants] = participantsCountBadge.innerText
            .split('/')
            .map(x => parseInt(x.trim()));
        return assigned < maxParticipants;
    }, badge);
    const participants = await extractParticipantsNames(page, await page.$$(`.list-group a`));
    const isUserAssigned = participants.some(x => x.includes(userName));

    return {
        ...event,
        assigned: isUserAssigned,
        isSlotAvailable: isSlotAvailable ?? event.isSlotAvailable ?? false,
    };
};

const extractParticipantsNames = async (page, elements) => {
    const names = [];

    for (const element of elements) {
        const innerText = await page.evaluate(element => element.innerText, element);
        const text = innerText?.trim() ?? '';

        // Consider only participant elements (starts with number).
        if (/^[1-9]/.test(text)) {
            names.push(text);
        }
    }

    return names;
};

export { getEventDetails };
