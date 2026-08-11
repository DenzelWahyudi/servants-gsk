const dotenv = require('dotenv');

// Set the NODE_ENV to 'development' by default.
process.env.NODE_ENV = (process.env.NODE_ENV || 'development').toLowerCase();

// In production (e.g. Render), environment variables are injected.
if (process.env.NODE_ENV !== 'production') {
    const envFound = dotenv.config({ path: '.env' });
    if (envFound.error) {
        throw new Error("Couldn't find .env file");
    }
}

module.exports = {
    env: process.env.NODE_ENV,
    api: {
        prefix: '/api',
    },
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET,
    corsOrigin: process.env.CORS_ORIGIN || '*',
};
