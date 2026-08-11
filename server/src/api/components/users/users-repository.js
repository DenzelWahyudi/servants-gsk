const pool = require('../../../postgre/db');
const { toCamelCase, toCamelCaseRows } = require('../../../utils/caseConvert');

async function getUser(id) {
    const result = await pool.query(
        'SELECT id, name, email, phone_number, push_token, role ' +
            'FROM users WHERE id = $1',
        [id]
    );
    return toCamelCase(result.rows[0]);
}

async function getUsers() {
    const result = await pool.query(
        'SELECT id, name, email, phone_number, push_token, role FROM users'
    );
    return toCamelCaseRows(result.rows);
}

async function getUserByEmail(email) {
    const result = await pool.query(
        'SELECT id, name, email, phone_number, push_token, role FROM users WHERE email = $1',
        [email]
    );
    return toCamelCase(result.rows[0]);
}

async function getUserByPhoneNumber(phoneNumber) {
    const result = await pool.query(
        'SELECT * FROM users WHERE phone_number = $1',
        [phoneNumber]
    );
    return toCamelCase(result.rows[0]);
}

async function getUserByName(name) {
    const result = await pool.query(
        'SELECT id, name, email, phone_number, push_token, role FROM users WHERE name = $1',
        [name]
    );
    return toCamelCase(result.rows[0]);
}

async function createUser(name, email, phoneNumber, passwordHash, role) {
    if (role === undefined) role = 'volunteer';
    const result = await pool.query(
        'INSERT INTO users (name, email, phone_number, password_hash, role) ' +
            'VALUES ($1, $2, $3, $4, $5) ' +
            'RETURNING id, name, email, phone_number, role',
        [name, email, phoneNumber, passwordHash, role]
    );
    return toCamelCase(result.rows[0]);
}

async function updateEmail(id, email) {
    return pool.query('UPDATE users SET email = $1 WHERE id = $2', [email, id]);
}

async function updatePhoneNumber(id, phoneNumber) {
    return pool.query('UPDATE users SET phone_number = $1 WHERE id = $2', [
        phoneNumber,
        id,
    ]);
}

async function updateName(id, name) {
    return pool.query('UPDATE users SET name = $1 WHERE id = $2', [name, id]);
}

async function changePassword(id, passwordHash) {
    return pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
        passwordHash,
        id,
    ]);
}

async function forgotPassword(phoneNumber, passwordHash) {
    return pool.query(
        'UPDATE users SET password_hash = $1 WHERE phone_number = $2',
        [passwordHash, phoneNumber]
    );
}

async function deleteUser(id) {
    return pool.query('DELETE FROM users WHERE id = $1', [id]);
}

async function getUserName(id) {
    const user = await pool.query('SELECT name FROM users WHERE id = $1', [id]);
    return user.rows[0]?.name;
}

async function savePushToken(id, pushToken) {
    return pool.query('UPDATE users SET push_token = $1 WHERE id = $2', [
        pushToken,
        id,
    ]);
}

module.exports = {
    getUser,
    getUsers,
    getUserByEmail,
    getUserByPhoneNumber,
    getUserByName,
    createUser,
    updateEmail,
    updatePhoneNumber,
    updateName,
    changePassword,
    forgotPassword,
    deleteUser,
    getUserName,
    savePushToken,
};
