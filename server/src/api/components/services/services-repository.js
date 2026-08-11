const pool = require('../../../postgre/db');
const { toCamelCase, toCamelCaseRows } = require('../../../utils/caseConvert');
const cron = require('node-cron');

cron.schedule('0 0  * * *', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await pool.query('DELETE FROM services WHERE date < $1', [
        today,
    ]);
    console.log(`Expired services deleted: ${result.rowCount}`);
});

async function createService(name, date, time, status) {
    if (!status) status = 'Roles Closed';
    const result = await pool.query(
        'INSERT INTO services (name, date, time, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, date, time, status]
    );
    return toCamelCase(result.rows[0]);
}

async function getServices() {
    const result = await pool.query('SELECT * FROM services');
    return toCamelCaseRows(result.rows);
}

async function getService(id) {
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [
        id,
    ]);
    return toCamelCase(result.rows[0]);
}

async function deleteService(id) {
    return pool.query('DELETE FROM services WHERE id = $1', [id]);
}

async function updateService(id, name, date, time, status) {
    return pool.query(
        'UPDATE services SET name = $1, date = $2, time = $3, status = $4 WHERE id = $5',
        [name, date, time, status, id]
    );
}

async function updateStatus(id, status) {
    return pool.query('UPDATE services SET status = $1 WHERE id = $2', [
        status,
        id,
    ]);
}

async function getServicesWithRoles() {
    const result = await pool.query(`
        SELECT s.id, s.name, s.date, s.time, s.status,
               COALESCE(
                   (SELECT json_agg(
                       json_build_object(
                           'id', r.id,
                           'serviceId', r.service_id,
                           'name', r.name,
                           'spotsTotal', r.spots_total,
                           'spotsFilled', r.spots_filled
                       )
                   ) 
                   FROM roles r 
                   WHERE r.service_id = s.id), 
                   '[]'::json
               ) as roles
        FROM services s
        ORDER BY s.date ASC
    `);
    return toCamelCaseRows(result.rows);
}

async function getServiceWithRoles(id) {
    const result = await pool.query(
        `
        SELECT s.id, s.name, s.date, s.time, s.status,
               COALESCE(
                   (SELECT json_agg(
                       json_build_object(
                           'id', r.id,
                           'serviceId', r.service_id,
                           'name', r.name,
                           'spotsTotal', r.spots_total,
                           'spotsFilled', r.spots_filled
                       )
                   ) 
                   FROM roles r 
                   WHERE r.service_id = s.id), 
                   '[]'::json
               ) as roles
        FROM services s
        WHERE s.id = $1
    `,
        [id]
    );
    return toCamelCase(result.rows[0]);
}

module.exports = {
    createService,
    getServices,
    getService,
    deleteService,
    updateService,
    updateStatus,
    getServicesWithRoles,
    getServiceWithRoles,
};
