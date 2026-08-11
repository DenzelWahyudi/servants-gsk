const express = require('express');
const route = express.Router();
const upload = require('../../../core/middlewares/upload');
const { uploadFile } = require('./fileController');

module.exports = (app) => {
    app.use('/file', route);

    route.post('/upload', upload.single('file'), uploadFile);
};
