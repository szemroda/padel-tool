const { authenticate } = require('./auth');
const { bookEvents } = require('./book');
const { getEventsDetails } = require('./event-details');
const { getEventsBasicData } = require('./event-basics');

module.exports = {
    authenticate,
    bookEvents,
    getEventsDetails,
    getEventsBasicData,
};
