const express = require('express');
const usersController = require('./users-controller');
const route = express.Router();
const authMiddleware = require('../../../core/middlewares/auth');

module.exports = (app) => {
    app.use('/users', route);

    // static routes
    route.get('/', usersController.getUsers);

    route.post('/', usersController.createUser);

    route.post('/admin', usersController.createAdmin);

    route.post('/login', usersController.login);

    route.post('/login/admin', usersController.loginAdmin);

    route.post('/check', usersController.check);

    route.post('/send-otp', usersController.sendOTP);

    route.put('/forgot-password', usersController.forgotPassword);

    // specific dynamic routes

    // route.get('/name/:id', usersController.getUserName);

    // route.put('/update/email/:id', usersController.updateUserEmail);

    // route.put('/update/phonenumber/:id', usersController.updateUserPhoneNumber);

    // route.put('/update/password/:id', usersController.changePassword);

    route.get('/id', authMiddleware, usersController.getUserId);

    route.get('/name', authMiddleware, usersController.getUserName);

    route.put('/push-token', authMiddleware, usersController.savePushToken);

    route.put(
        '/update/password',
        authMiddleware,
        usersController.changePassword
    );

    route.put('/update/email/:id', authMiddleware, usersController.updateEmail);

    route.put(
        '/update/phonenumber/:id',
        authMiddleware,
        usersController.updatePhoneNumber
    );

    route.put('/update/name/:id', authMiddleware, usersController.updateName);

    // generic dynamic routes
    route.delete('/:id', authMiddleware, usersController.deleteUser);
};
