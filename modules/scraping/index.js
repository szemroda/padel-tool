const { authenticate } = require('./auth');
const { bookEvent } = require('./book');
const { getEventDetails } = require('./event-details');
const { getEventsBasicData } = require('./event-basics');

module.exports = {
    authenticate,
    bookEvent,
    getEventDetails,
    getEventsBasicData,
};
