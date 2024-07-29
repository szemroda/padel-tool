const { authenticate } = require('./auth');
const { bookEvent } = require('./book');
const { getEventsDetails } = require('./event-details');
const { getEventsBasicData } = require('./event-basics');

module.exports = {
    authenticate,
    bookEvent,
    getEventsDetails,
    getEventsBasicData,
};
