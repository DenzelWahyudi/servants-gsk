const { Expo } = require('expo-server-sdk');
let expo = new Expo();

async function sendPushNotifications(tokens, title, body, data = {}) {
    let messages = [];
    for (let pushToken of tokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(
                `Push token ${pushToken} is not a valid Expo push token`
            );
            continue;
        }

        messages.push({
            to: pushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data,
        });
    }

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error('Error sending push notification chunk:', error);
        }
    }
    return tickets;
}

module.exports = { sendPushNotifications };
