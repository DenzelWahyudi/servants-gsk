const chatsService = require('./chats-service');
const { getUserName } = require('../users/users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { broadcastToService } = require('../../../core/webSocket');
const { getGroupDetails } = require('../assignments/assignments-repository');
const { sendPushNotifications } = require('../../../utils/pushNotifications');

async function sendChat(req, res, next) {
    try {
        const userId = req.user.id;
        const { serviceId, message, file, status, replyTo } = req.body;

        if (!message) {
            throw errorResponder(errorTypes.EMPTY_BODY, 'No message was sent.');
        }

        const userName = await getUserName(userId);

        const success = await chatsService.sendChat(
            serviceId,
            userId,
            userName,
            message,
            file,
            status,
            replyTo
        );
        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to send message!'
            );
        }

        broadcastToService(serviceId, { type: 'NEW_CHAT', data: success });

        try {
            const groupMembers = await getGroupDetails(serviceId);
            const tokens = groupMembers
                .filter(
                    (member) =>
                        member.userId.toString() !== userId.toString() &&
                        member.pushToken
                )
                .map((member) => member.pushToken);

            if (tokens.length > 0) {
                await sendPushNotifications(
                    tokens,
                    `New message from ${userName}`,
                    message,
                    { serviceId }
                );
            }
        } catch (err) {
            console.error('Failed to send push notifications:', err);
        }

        return res.status(201).json(success);
    } catch (error) {
        next(error);
    }
}

async function getAllChats(req, res, next) {
    try {
        const serviceId = req.params.serviceId;

        const success = await chatsService.getAllChats(serviceId);
        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to get messages.'
            );
        }

        return res.status(200).json(success);
    } catch (error) {
        next(error);
    }
}

async function markChatAsRead(req, res, next) {
    try {
        const userId = req.user.id;
        const { serviceId, chatId } = req.body;
        const userName = await getUserName(userId);

        const success = await chatsService.markChatAsRead(
            chatId,
            userId,
            userName
        );
        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to mark chat as read.'
            );
        }

        broadcastToService(serviceId, { type: 'NEW_READ', data: success });

        res.status(200).json(success);
    } catch (error) {
        next(error);
    }
}

async function markServiceChatsAsRead(req, res, next) {
    try {
        const userId = req.user.id;
        const { serviceId } = req.body;
        const userName = await getUserName(userId);

        const success = await chatsService.markServiceChatsAsRead(
            serviceId,
            userId,
            userName
        );
        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to mark service chats as read.'
            );
        }

        broadcastToService(serviceId, { type: 'NEW_READS', data: success });

        res.status(200).json(success);
    } catch (error) {
        next(error);
    }
}

async function deleteChat(req, res, next) {
    try {
        const { chatId } = req.params;

        await chatsService.deleteChat(chatId);

        return res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    sendChat,
    getAllChats,
    markChatAsRead,
    markServiceChatsAsRead,
    deleteChat,
};
