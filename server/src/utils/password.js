const bcrypt = require('bcryptjs');

/**
 * Hash a plain text password
 * @param {string} password - The password to be hashed
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
    const saltRounds = 10;

    return await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                reject(err);
            } else {
                resolve(hash);
            }
        });
    });
}

/**
 * Compares a plain text password and its hashed to determine its equality
 * Mainly use for comparing login credentials
 * @param {string} password - A plain text password
 * @param {string} hashedPassword - A hashed password
 * @returns {Promise<boolean>}
 */
async function passwordMatched(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
}

module.exports = {
    hashPassword,
    passwordMatched,
};
