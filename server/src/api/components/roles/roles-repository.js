const pool = require('../../../postgre/db');
const { toCamelCase, toCamelCaseRows } = require('../../../utils/caseConvert');

async function createRoles(roles) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const insertedRoles = [];
        for (const role of roles) {
            const res = await client.query(
                'INSERT INTO roles (service_id, name, spots_total, spots_filled) VALUES ($1, $2, $3, $4) RETURNING *',
                [
                    role.serviceId,
                    role.name,
                    role.spotsTotal,
                    role.spotsFilled || 0,
                ]
            );
            insertedRoles.push(toCamelCase(res.rows[0]));
        }
        await client.query('COMMIT');
        return insertedRoles;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

async function getRoles(serviceId) {
    const result = await pool.query(
        'SELECT * FROM roles WHERE service_id = $1',
        [serviceId]
    );
    return toCamelCaseRows(result.rows);
}

async function getRole(id) {
    const result = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
    return toCamelCase(result.rows[0]);
}

async function getAllRoles() {
    const result = await pool.query('SELECT * FROM roles');
    return toCamelCaseRows(result.rows);
}

async function deleteRoles(serviceId) {
    return pool.query('DELETE FROM roles WHERE service_id = $1', [serviceId]);
}

async function increaseRoleSpotsFilled(id) {
    const result = await pool.query(
        'UPDATE roles SET spots_filled = spots_filled + 1 WHERE id = $1 RETURNING *',
        [id]
    );
    return toCamelCase(result.rows[0]);
}

async function decreaseRoleSpotsFilled(id) {
    const result = await pool.query(
        'UPDATE roles SET spots_filled = spots_filled - 1 WHERE id = $1 RETURNING *',
        [id]
    );
    return toCamelCase(result.rows[0]);
}

async function getAssignedUsersForRoles(serviceId) {
    const result = await pool.query(
        `
        SELECT 
            r.id,
            r.name, 
            r.spots_total, 
            r.spots_filled, 
            COALESCE(
                (
                    SELECT array_agg(u.name) 
                    FROM assignments a 
                    JOIN users u ON a.user_id = u.id 
                    WHERE a.role_id = r.id AND a.status = 'confirmed'
                ), 
                ARRAY[]::VARCHAR[]
            ) AS user_names
        FROM roles r
        WHERE r.service_id = $1
    `,
        [serviceId]
    );

    return toCamelCaseRows(result.rows);
}

module.exports = {
    createRoles,
    getRoles,
    getRole,
    getAllRoles,
    deleteRoles,
    increaseRoleSpotsFilled,
    decreaseRoleSpotsFilled,
    getAssignedUsersForRoles,
};
