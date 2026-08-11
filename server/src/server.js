const { env, port } = require('./core/config');
const logger = require('./core/logger')('app');
const app = require('./core/app');
const { initWebSocket } = require('./core/webSocket');

const httpServer = app.listen(port, (err) => {
    if (err) {
        logger.fatal(err, 'Failed to start the server.');
        process.exit(1);
    } else {
        logger.info(`Server runs at port ${port} in ${env} environment`);
    }
});

initWebSocket(httpServer);

process.on('uncaughtException', (err) => {
    logger.fatal(err, 'Uncaught exception.');

    // Shutdown the server gracefully
    httpServer.close(() => process.exit(1));

    // If a graceful shutdown is not achieved after 1 second,
    // shut down the process completely
    setTimeout(() => process.abort(), 1000).unref();
    process.exit(1);
});
