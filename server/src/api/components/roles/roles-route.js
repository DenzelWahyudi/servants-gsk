const express = require('express');
const rolesController = require('./roles-controller');
const route = express.Router();

module.exports = (app) => {
    app.use('/roles', route);

    route.get('/', rolesController.getAllRoles);

    route.get(
        '/assignedusersforroles/:serviceId',
        rolesController.getAssignedUsersForRoles
    );

    route.get('/:serviceId', rolesController.getRoles);
};
