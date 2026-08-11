import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import Constants from "expo-constants"

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: false,
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false
    })
})

export async function registerForPushNotificationsAsync() {
    let token

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C"
        })
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
    }

    if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!")
        return
    }

    try {
        // Retrieve the push token from Expo
        token = (
            await Notifications.getExpoPushTokenAsync({
                projectId: Constants.easConfig?.projectId
            })
        ).data
    } catch (e) {
        console.log("Error getting push token:", e)
    }

    return token
}

export async function dismissAllNotifications() {
    await Notifications.dismissAllNotificationsAsync()
    await Notifications.setBadgeCountAsync(0)
}
