const pool = require('../../../postgre/db');
const { toCamelCase, toCamelCaseRows } = require('../../../utils/caseConvert');
const cloudinary = require('../../../core/cloudinary');

async function sendChat(
    serviceId,
    userId,
    userName,
    message,
    file,
    status,
    replyTo
) {
    const result = await pool.query(
        `INSERT INTO chats (service_id, user_id, user_name, message, file, status, reply_to)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
            serviceId,
            userId,
            userName,
            message,
            file ? JSON.stringify(file) : null,
            status,
            replyTo ? JSON.stringify(replyTo) : null,
        ]
    );
    return toCamelCase(result.rows[0]);
}

async function getAllChats(serviceId) {
    const result = await pool.query(
        'SELECT * FROM chats WHERE service_id = $1 ORDER BY created_at ASC',
        [serviceId]
    );
    return toCamelCaseRows(result.rows);
}

async function deleteFiles(serviceId) {
    const { rows } = await pool.query(
        'SELECT file FROM chats WHERE service_id = $1',
        [serviceId]
    );

    const filesToDelete = rows.filter((c) => c.file?.publicId);

    if (filesToDelete.length === 0) return true;

    return Promise.allSettled(
        filesToDelete.map((c) =>
            cloudinary.uploader.destroy(c.file.publicId, {
                resource_type: c.file.resourceType,
            })
        )
    );
}

async function deleteChat(chatId) {
    const chatResult = await pool.query(
        'SELECT file FROM chats WHERE id = $1',
        [chatId]
    );

    const chat = chatResult.rows[0];
    if (chat?.file?.publicId) {
        await cloudinary.uploader.destroy(chat.file.publicId, {
            resource_type: chat.file.resourceType,
        });
    }

    return pool.query('DELETE FROM chats WHERE id = $1', [chatId]);
}

async function markChatAsRead(chatId, userId, userName) {
    const result = await pool.query(
        `UPDATE chats
         SET read_by = read_by || $1::jsonb,
             updated_at = now()
         WHERE id = $2
           AND NOT EXISTS (
               SELECT 1 FROM jsonb_array_elements(read_by) AS rb
               WHERE rb->>'userId' = $3::text
           )
         RETURNING *`,
        [JSON.stringify({ userId, userName }), chatId, String(userId)]
    );
    return toCamelCase(result.rows[0]);
}

async function markServiceChatsAsRead(serviceId, userId, userName) {
    const result = await pool.query(
        `UPDATE chats
         SET read_by = read_by || $1::jsonb,
             updated_at = now()
         WHERE service_id = $2
           AND NOT EXISTS (
               SELECT 1 FROM jsonb_array_elements(read_by) AS rb
               WHERE rb->>'userId' = $3::text
           )
         RETURNING id, read_by`,
        [JSON.stringify({ userId, userName }), serviceId, String(userId)]
    );
    return toCamelCaseRows(result.rows);
}

module.exports = {
    sendChat,
    getAllChats,
    deleteFiles,
    deleteChat,
    markChatAsRead,
    markServiceChatsAsRead,
};
