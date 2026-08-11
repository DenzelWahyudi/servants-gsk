const express = require('express');

const users = require('./components/users/users-route');
const services = require('./components/services/services-route');
const roles = require('./components/roles/roles-route');
const assignment = require('./components/assignments/assignments-route');
const chats = require('./components/chats/chats-route');
const file = require('./components/file/file-route');

module.exports = () => {
    const app = express.Router();

    users(app);
    services(app);
    roles(app);
    assignment(app);
    chats(app);
    file(app);

    return app;
};
