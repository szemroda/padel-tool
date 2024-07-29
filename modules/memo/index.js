const memo = new Map();

const addBookedEvent = event => {
    memo.set(getEventMemoKey(event), event);
};

const isBooked = event => {
    return memo.has(getEventMemoKey(event));
};

const getEventMemoKey = event => {
    return event.link;
};

module.exports = { addBookedEvent, isBooked };
