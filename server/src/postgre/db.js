const Pool = require('pg').Pool;

const pool = new Pool({
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT, 10),
    database: process.env.PG_DATABASE,

    ssl: {
        rejectUnauthorized: false, // Prevents "unable to verify the first certificate" errors
    },
});

module.exports = pool;
