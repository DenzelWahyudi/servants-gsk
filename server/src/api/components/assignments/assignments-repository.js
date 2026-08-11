const pool = require('../../../postgre/db');
const { toCamelCase, toCamelCaseRows } = require('../../../utils/caseConvert');

async function createAssignment(userId, roleId, status) {
    if (!status) status = 'pending';
    const result = await pool.query(
        'INSERT INTO assignments (user_id, role_id, status) VALUES ($1, $2, $3) RETURNING *',
        [userId, roleId, status]
    );
    return toCamelCase(result.rows[0]);
}

async function hasUserBeenAssigned(roleId, userId) {
    const result = await pool.query(
        'SELECT * FROM assignments WHERE role_id = $1 AND user_id = $2',
        [roleId, userId]
    );
    return toCamelCase(result.rows[0]);
}

async function getUserSchedule(userId) {
    const result = await pool.query(
        `
        SELECT r.name AS role_name, s.name AS service_name, s.date, s.time
        FROM assignments a
        JOIN roles r ON a.role_id = r.id
        JOIN services s ON r.service_id = s.id
        WHERE a.user_id = $1 AND a.status = 'confirmed'
    `,
        [userId]
    );
    return toCamelCaseRows(result.rows);
}

async function getPendingStatusAssignments() {
    const result = await pool.query(`
        SELECT 
            a.id, 
            u.name AS user_name, 
            r.id AS role_id, 
            r.name AS role_name, 
            s.name AS service_name, 
            s.date, 
            s.time
        FROM assignments a
        JOIN users u ON a.user_id = u.id
        JOIN roles r ON a.role_id = r.id
        JOIN services s ON r.service_id = s.id
        WHERE a.status = 'pending'
    `);
    return toCamelCaseRows(result.rows);
}

async function getAllUserAssignments(userId) {
    const result = await pool.query(
        `
        SELECT 
            a.id,
            s.name AS service_name, 
            r.name AS role_name, 
            s.date, 
            s.time, 
            a.status
        FROM assignments a
        JOIN users u ON a.user_id = u.id
        JOIN roles r ON a.role_id = r.id
        JOIN services s ON r.service_id = s.id
        WHERE a.user_id = $1
    `,
        [userId]
    );
    return toCamelCaseRows(result.rows);
}

async function updateStatus(assignmentId, status) {
    return pool.query('UPDATE assignments SET status = $1 WHERE id = $2', [
        status,
        assignmentId,
    ]);
}

async function getUsersToRelieve(roleId) {
    const result = await pool.query(
        `
        SELECT u.id AS user_id, u.name
        FROM assignments a
        JOIN users u ON a.user_id = u.id
        WHERE a.role_id = $1 AND a.status = 'confirmed'
    `,
        [roleId]
    );
    return toCamelCaseRows(result.rows);
}

async function relieveUser(userId, roleId) {
    return pool.query(
        'DELETE FROM assignments WHERE user_id = $1 AND role_id = $2',
        [userId, roleId]
    );
}

async function getAllUserAssignedServices(userId) {
    const result = await pool.query(
        `
        SELECT 
            s.id AS service_id, 
            s.name AS service_name, 
            s.date, 
            s.time,
            (
                SELECT COUNT(*) 
                FROM chats c 
                WHERE c.service_id = s.id 
                  AND c.status = 'success' 
                  AND NOT EXISTS (
                      SELECT 1 
                      FROM jsonb_array_elements(
                          CASE jsonb_typeof(c.read_by) 
                              WHEN 'array' THEN c.read_by 
                              ELSE '[]'::jsonb 
                          END
                      ) AS rb 
                      WHERE rb->>'userId' = $1::text
                  )
            )::integer AS unread_message
        FROM assignments a
        JOIN roles r ON a.role_id = r.id
        JOIN services s ON r.service_id = s.id
        WHERE a.user_id = $1::bigint AND a.status = 'confirmed'
        GROUP BY s.id, s.name, s.date, s.time
    `,
        [userId]
    );
    return toCamelCaseRows(result.rows);
}

async function getGroupDetails(serviceId) {
    const result = await pool.query(
        `
        SELECT 
            u.id AS user_id, 
            u.name AS user_name, 
            u.phone_number, 
            u.push_token, 
            array_agg(r.name) AS role_name
        FROM assignments a
        JOIN roles r ON a.role_id = r.id
        JOIN users u ON a.user_id = u.id
        WHERE r.service_id = $1 AND a.status = 'confirmed'
        GROUP BY u.id, u.name, u.phone_number, u.push_token
    `,
        [serviceId]
    );
    return toCamelCaseRows(result.rows);
}

async function getGroupMemberNames(serviceId) {
    const result = await pool.query(
        `
        SELECT u.id AS user_id, u.name AS user_name
        FROM assignments a
        JOIN roles r ON a.role_id = r.id
        JOIN users u ON a.user_id = u.id
        WHERE r.service_id = $1 AND a.status = 'confirmed'
        GROUP BY u.id, u.name
    `,
        [serviceId]
    );
    return toCamelCaseRows(result.rows);
}

module.exports = {
    createAssignment,
    hasUserBeenAssigned,
    getUserSchedule,
    getPendingStatusAssignments,
    updateStatus,
    getAllUserAssignments,
    getUsersToRelieve,
    relieveUser,
    getAllUserAssignedServices,
    getGroupDetails,
    getGroupMemberNames,
};
