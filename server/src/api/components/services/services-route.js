const express = require('express');
const servicesController = require('./services-controller');
const authMiddleware = require('../../../core/middlewares/auth');
const route = express.Router();

module.exports = (app) => {
    app.use('/services', route);

    route.get('/', servicesController.getServices);

    route.get('/with-roles', servicesController.getServicesWithRoles);

    route.post('/create', authMiddleware, servicesController.createService);

    route.put(
        '/update/:serviceId',
        authMiddleware,
        servicesController.updateService
    );

    route.put(
        '/updatestatus/:serviceId',
        authMiddleware,
        servicesController.updateStatus
    );

    route.post(
        '/delete/:serviceId',
        authMiddleware,
        servicesController.deleteService
    );

    route.get('/:id', servicesController.getService);

    route.get(
        '/:id/with-roles',
        authMiddleware,
        servicesController.getServiceWithRoles
    );
};
