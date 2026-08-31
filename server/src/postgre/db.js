const Pool = require('pg').Pool;

const sslEnabled =
    process.env.PG_SSL !== undefined
        ? process.env.PG_SSL.toLowerCase() === 'true'
        : process.env.NODE_ENV === 'production';

const pool = new Pool({
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT, 10),
    database: process.env.PG_DATABASE,

    ssl: sslEnabled
        ? {
              rejectUnauthorized: false, // Prevents "unable to verify the first certificate" errors
          }
        : false,
});

module.exports = pool;
