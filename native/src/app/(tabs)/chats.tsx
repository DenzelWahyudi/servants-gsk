import React, { useEffect, useState, useCallback, useRef } from "react"
import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    KeyboardAvoidingView,
    Dimensions,
    Keyboard,
    Linking
} from "react-native"
import * as DocumentPicker from "expo-document-picker"
import { useFocusEffect } from "expo-router"
import { API_URL } from "../../../api"
import { useAuth } from "@/hooks/useAuth"
import { SendHorizontal, X, CheckCheck, Paperclip, ChevronLeft, Search } from "lucide-react-native"
import { format } from "date-fns"
import { useChatSocket } from "@/hooks/useChatSocket"
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring
} from "react-native-reanimated"
import { scheduleOnRN } from "react-native-worklets"
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler"
import { File, UploadType } from "expo-file-system"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

// Interfaces
interface Service {
    serviceId: string
    serviceName: string
    date: Date
    time: string
    unreadMessage: number
}

interface Group {
    userId: string
    userName: string
    phoneNumber: string
    roleName: string[]
}

interface ReplyTo {
    chatId: string
    userId: string
    userName: string
    message: string
}

interface UploadedFile {
    id: string
    url: string
    publicId: string
    resourceType: string
    format?: string
    originalName?: string
    bytes?: number
}

interface Chat {
    id: string
    userId: string
    userName: string
    message: string
    createdAt: string
    readBy: { userId: string; userName: string }[]
    replyTo: ReplyTo | null
    file?: UploadedFile | null
}

interface Message {
    serviceId: string
    message: string
    file: UploadedFile | null
    status: string
    replyTo: ReplyTo | null
}

interface Member {
    userId: string
    userName: string
}

const { width } = Dimensions.get("window")

function ChatBubble({
    chat,
    isMine,
    members,
    onReply,
    onReadStatus,
    scrollToMessage
}: {
    chat: Chat
    isMine: boolean
    members: Member[] | null
    onReply: (c: Chat) => void
    onReadStatus: (c: Chat) => void
    scrollToMessage: (id: string) => void
}) {
    const translateX = useSharedValue(0)

    const pan = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onChange((event) => {
            // restrict dragging limits
            if (event.translationX > 90) translateX.value = 90
            else if (event.translationX < -90) translateX.value = -90
            else translateX.value = event.translationX
        })
        .onEnd((event) => {
            if (event.translationX > 50) {
                scheduleOnRN(onReply, chat)
            }
            if (event.translationX < -50 && isMine) {
                scheduleOnRN(onReadStatus, chat)
            }
            translateX.value = withSpring(0)
        })

    const style = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }]
    }))

    const readByOthersCount = chat.readBy.filter((r) => r.userId !== chat.userId).length
    const isReadByAll = members && members.length > 1 && readByOthersCount >= members.length - 1 // -1 for self

    const timeSpace = isMine
        ? "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
        : "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"

    return (
        <GestureDetector gesture={pan}>
            <Animated.View
                style={[
                    style,
                    {
                        alignSelf: isMine ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                        marginBottom: 8
                    }
                ]}
            >
                <View
                    className={`relative rounded-2xl px-3 pb-2 pt-2 shadow-sm ${isMine ? "rounded-tr-sm bg-[#dcf8c6]" : "rounded-tl-sm bg-white"}`}
                >
                    {!isMine && (
                        <Text className="mb-1 text-[13px] font-bold text-rose-500">
                            {chat.userName}
                        </Text>
                    )}

                    {chat.replyTo && (
                        <Pressable
                            className="mb-1.5 rounded-lg border-l-4 border-rose-500 bg-black/5 p-2"
                            onPress={() => scrollToMessage(chat.replyTo!.chatId)}
                        >
                            <Text className="mb-0.5 text-xs font-bold text-rose-500">
                                {chat.replyTo.userName}
                            </Text>
                            <Text className="text-xs text-zinc-600" numberOfLines={2}>
                                {chat.replyTo.message}
                            </Text>
                        </Pressable>
                    )}

                    {chat.file ? (
                        <Pressable
                            className={`${isMine ? "bg-[#c5e6b1]" : "bg-black/10"} mt-1 rounded-lg p-3`}
                            onPress={() => Linking.openURL(chat.file!.url)}
                        >
                            <Text
                                className={`${isMine ? "text-zinc-900" : "text-zinc-800"} font-medium`}
                            >
                                {chat.message || "Attached File"}
                            </Text>
                        </Pressable>
                    ) : (
                        <Text className="text-[15px] leading-5 text-zinc-900">
                            {chat.message}
                            <Text className="text-[10px] text-transparent">{timeSpace}</Text>
                        </Text>
                    )}

                    <View
                        className={`flex-row items-center gap-1 ${chat.file ? "mt-1 self-end" : "absolute bottom-1.5 right-3"}`}
                    >
                        <Text className="text-[10px] text-zinc-500">
                            {format(new Date(chat.createdAt), "HH:mm")}
                        </Text>
                        {isMine && (
                            <CheckCheck size={14} color={isReadByAll ? "#3b82f6" : "#9ca3af"} />
                        )}
                    </View>
                </View>
            </Animated.View>
        </GestureDetector>
    )
}

export default function ChatsTab() {
    const insets = useSafeAreaInsets()
    const { token } = useAuth()
    const [assignedServices, setAssignedServices] = useState<Service[] | null>([])
    const [chosenService, setChosenService] = useState<Service | null>(null)
    const { chats } = useChatSocket(chosenService?.serviceId)
    const [message, setMessage] = useState<Message>({
        serviceId: "",
        message: "",
        file: null,
        status: "success",
        replyTo: null
    })
    const [error, setError] = useState<string | null>(null)
    const [userId, setUserId] = useState({ id: "" })
    const [groupDetails, setGroupDetails] = useState<Group[] | null>(null)
    const [loading, setLoading] = useState(false)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [members, setMembers] = useState<Member[] | null>(null)
    const [readStatusChat, setReadStatusChat] = useState<Chat | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [attachedFile, setAttachedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
        null
    )

    const scrollViewRef = useRef<ScrollView>(null)
    const messageLayouts = useRef<{ [key: string]: number }>({})

    const scrollToMessage = useCallback((chatId: string) => {
        const yOffset = messageLayouts.current[chatId]
        if (yOffset !== undefined && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: yOffset, animated: true })
        }
    }, [])

    // Animation values
    const chatRoomTranslateX = useSharedValue(width)
    const groupInfoTranslateX = useSharedValue(width)
    const readStatusTranslateX = useSharedValue(width)

    useFocusEffect(
        useCallback(() => {
            async function fetchAssignedServices() {
                const response = await fetch(`${API_URL}/api/assignments/assignedservices`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                })
                const data: Service[] = await response.json()
                const sorted = data.sort((a, b) => b.unreadMessage - a.unreadMessage)
                setAssignedServices(sorted)
            }

            async function fetchUserId() {
                const response = await fetch(`${API_URL}/api/users/id`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                })
                const data = await response.json()
                setUserId({ id: data })
            }

            if (token) {
                void fetchAssignedServices()
                void fetchUserId()
            }
        }, [token])
    )

    useEffect(() => {
        if (chosenService) {
            chatRoomTranslateX.value = withTiming(0, { duration: 250 })
        } else {
            chatRoomTranslateX.value = withTiming(width, { duration: 250 })
            Keyboard.dismiss()
        }
    }, [chosenService])

    useEffect(() => {
        if (groupDetails) {
            groupInfoTranslateX.value = withTiming(0, { duration: 250 })
        } else {
            groupInfoTranslateX.value = withTiming(width, { duration: 250 })
        }
    }, [groupDetails])

    useEffect(() => {
        if (readStatusChat) {
            readStatusTranslateX.value = withTiming(0, { duration: 250 })
        } else {
            readStatusTranslateX.value = withTiming(width, { duration: 250 })
        }
    }, [readStatusChat])

    // Handle incoming chats scroll
    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true })
        }, 100)
    }, [chats])

    async function uploadFile(): Promise<UploadedFile> {
        setError(null)
        if (!attachedFile) {
            throw new Error("No file attached!")
        }

        const file = new File(attachedFile.uri)

        const result = await file.upload(`${API_URL}/api/file/upload`, {
            uploadType: UploadType.MULTIPART,
            fieldName: "file"
        })

        if (result.status < 200 || result.status >= 300) {
            throw new Error("Failed to upload file!")
        }

        return JSON.parse(result.body) as UploadedFile
    }

    async function handleSend() {
        if (!message.message.trim() && !attachedFile) return
        setLoading(true)
        setError(null)

        let payload = message

        try {
            if (attachedFile) {
                const data: UploadedFile = await uploadFile()
                payload = { ...message, message: attachedFile.name, file: data }
                setAttachedFile(null)
            }

            const response = await fetch(`${API_URL}/api/chats/send`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || "Failed to send message.")
                return
            }

            setMessage((prev) => ({ ...prev, message: "", file: null, replyTo: null }))
        } catch (err: any) {
            setError(err.message || "Could not connect to the server. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    async function fetchGroupDetails(serviceId: string) {
        setLoadingDetails(true)
        setError(null)
        try {
            const response = await fetch(`${API_URL}/api/assignments/group/${serviceId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            })
            const data: Group[] = await response.json()
            if (response.ok) {
                setGroupDetails(data)
            } else {
                setError("Failed to get group details")
            }
        } catch {
            setError("Network Error")
        } finally {
            setLoadingDetails(false)
        }
    }

    async function handleReadServiceChats(serviceId: string) {
        try {
            await fetch(`${API_URL}/api/chats/read-all`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ serviceId })
            })
        } catch (e) {}
    }

    async function fetchGroupMemberNames(serviceId: string) {
        try {
            const response = await fetch(`${API_URL}/api/assignments/group-names/${serviceId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            })
            const data: Member[] = await response.json()
            if (response.ok) {
                setMembers(data)
            }
        } catch (e) {}
    }

    async function handleAttachment() {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["image/*", "application/pdf"],
                copyToCacheDirectory: true
            })

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setAttachedFile(result.assets[0])
            }
        } catch (err) {
            console.error("Failed to pick document", err)
        }
    }

    // Styles for animated views
    const chatRoomStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: chatRoomTranslateX.value }]
    }))
    const groupInfoStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: groupInfoTranslateX.value }]
    }))
    const readStatusStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: readStatusTranslateX.value }]
    }))

    const displayedServices =
        assignedServices?.filter((s) =>
            s.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
        ) || []

    return (
        <SafeAreaView
            className={`flex-1 ${chosenService || groupDetails || readStatusChat ? "bg-slate-900" : "bg-zinc-50"}`}
            edges={["top"]}
        >
            <GestureHandlerRootView className="flex-1">
                {/* Main Chat List Screen */}
                <View className="flex-1">
                    <View className="mb-4 px-6">
                        <Text className="mb-4 text-3xl font-bold text-zinc-900">Chats</Text>
                        <View className="flex-row items-center rounded-2xl bg-zinc-200/60 px-4 py-2.5">
                            <Search size={20} color="#71717a" />
                            <TextInput
                                className="ml-3 flex-1 text-base text-zinc-900"
                                placeholder="Search Service"
                                placeholderTextColor="#a1a1aa"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    <ScrollView className="flex-1 px-4" contentContainerClassName="pb-20">
                        {displayedServices.length === 0 ? (
                            <View className="mt-10 items-center justify-center">
                                <Text className="text-base font-medium text-zinc-500">
                                    No chats found.
                                </Text>
                            </View>
                        ) : (
                            displayedServices.map((s) => (
                                <Pressable
                                    key={s.serviceId}
                                    className="flex-row items-center border-b border-zinc-100 px-2 py-4"
                                    onPress={() => {
                                        setChosenService(s)
                                        setMessage((prev) => ({ ...prev, serviceId: s.serviceId }))
                                        void handleReadServiceChats(s.serviceId)
                                        void fetchGroupMemberNames(s.serviceId)
                                        setAssignedServices(
                                            (prev) =>
                                                prev?.map((se) =>
                                                    se.serviceId === s.serviceId
                                                        ? { ...se, unreadMessage: 0 }
                                                        : se
                                                ) ?? null
                                        )
                                    }}
                                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                                >
                                    <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                                        <Text className="text-xl font-bold text-amber-700">
                                            {s.serviceName.substring(0, 1).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View className="flex-1 justify-center">
                                        <Text
                                            className="mb-1 text-lg font-bold text-zinc-900"
                                            numberOfLines={1}
                                        >
                                            {s.serviceName}
                                        </Text>
                                        <Text className="text-sm font-medium text-zinc-500">
                                            {format(new Date(s.date), "d MMMM yyyy")}
                                        </Text>
                                    </View>
                                    <View className="ml-2 items-end justify-center">
                                        <Text className="mb-1 text-xs font-semibold text-zinc-400">
                                            {s.time}
                                        </Text>
                                        {s.unreadMessage > 0 ? (
                                            <View className="h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-500 px-1.5">
                                                <Text className="text-[10px] font-bold text-white">
                                                    {s.unreadMessage}
                                                </Text>
                                            </View>
                                        ) : (
                                            <View className="h-5 min-w-[20px]" />
                                        )}
                                    </View>
                                </Pressable>
                            ))
                        )}
                    </ScrollView>
                </View>

                {/* Chat Room Overlay */}
                <Animated.View
                    style={[
                        chatRoomStyle,
                        {
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#f4f4f5"
                        }
                    ]}
                >
                    <KeyboardAvoidingView
                        behavior="padding"
                        keyboardVerticalOffset={insets.top}
                        className="flex-1"
                    >
                        {/* Header */}
                        <View className="z-10 flex-row items-center bg-slate-900 px-2 pb-4 shadow-md">
                            <Pressable
                                className="mr-1 p-2"
                                onPress={() => {
                                    setChosenService(null)
                                    setMessage((prev) => ({ ...prev, replyTo: null }))
                                }}
                            >
                                <ChevronLeft size={28} color="#f4f4f5" />
                            </Pressable>
                            <Pressable
                                className="flex-1 flex-row items-center"
                                onPress={() => fetchGroupDetails(chosenService!.serviceId)}
                                disabled={loadingDetails}
                            >
                                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-amber-500">
                                    <Text className="text-lg font-bold text-slate-900">
                                        {chosenService?.serviceName.substring(0, 1).toUpperCase()}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text
                                        className="text-lg font-bold leading-tight text-zinc-50"
                                        numberOfLines={1}
                                    >
                                        {chosenService?.serviceName}
                                    </Text>
                                    <Text className="text-xs text-zinc-400">
                                        {chosenService
                                            ? `${format(new Date(chosenService.date), "d MMM yyyy")} • ${chosenService.time}`
                                            : ""}
                                    </Text>
                                </View>
                            </Pressable>
                        </View>

                        {/* Chat Area */}
                        <View className="flex-1 bg-[#efeae2]">
                            <ScrollView
                                ref={scrollViewRef}
                                className="flex-1 px-3 pt-4"
                                contentContainerClassName="pb-6"
                                onContentSizeChange={() =>
                                    scrollViewRef.current?.scrollToEnd({ animated: true })
                                }
                            >
                                {chats?.map((c, index) => {
                                    const currentDate = new Date(c.createdAt)
                                    const prevDate =
                                        index > 0 ? new Date(chats[index - 1].createdAt) : null
                                    const showDateSeparator =
                                        !prevDate ||
                                        currentDate.toDateString() !== prevDate.toDateString()

                                    return (
                                        <View
                                            key={c.id}
                                            onLayout={(e) => {
                                                messageLayouts.current[c.id] =
                                                    e.nativeEvent.layout.y
                                            }}
                                        >
                                            {showDateSeparator && (
                                                <View className="my-3 items-center">
                                                    <View className="rounded-lg bg-white/80 px-3 py-1 shadow-sm">
                                                        <Text className="text-xs font-medium uppercase text-zinc-500">
                                                            {format(currentDate, "EEE, d MMMM")}
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                            <ChatBubble
                                                chat={c}
                                                isMine={c.userId === userId.id}
                                                members={members}
                                                onReply={(chat) =>
                                                    setMessage((prev) => ({
                                                        ...prev,
                                                        replyTo: {
                                                            chatId: chat.id,
                                                            userId: chat.userId,
                                                            userName: chat.userName,
                                                            message: chat.message
                                                        }
                                                    }))
                                                }
                                                onReadStatus={(chat) => setReadStatusChat(chat)}
                                                scrollToMessage={scrollToMessage}
                                            />
                                        </View>
                                    )
                                })}
                            </ScrollView>

                            {/* Input Area */}
                            <View className="border-t border-zinc-200 bg-zinc-50 px-2 py-2">
                                {message.replyTo && (
                                    <View className="mx-2 mt-1 flex-row items-start justify-between rounded-t-2xl border-l-4 border-rose-500 bg-zinc-100 p-3">
                                        <View className="flex-1">
                                            <Text className="mb-1 text-sm font-bold text-rose-500">
                                                {message.replyTo.userName}
                                            </Text>
                                            <Text
                                                className="text-sm text-zinc-600"
                                                numberOfLines={2}
                                            >
                                                {message.replyTo.message}
                                            </Text>
                                        </View>
                                        <Pressable
                                            onPress={() =>
                                                setMessage((prev) => ({ ...prev, replyTo: null }))
                                            }
                                            className="p-1"
                                        >
                                            <X size={18} color="#a1a1aa" />
                                        </Pressable>
                                    </View>
                                )}

                                <View
                                    className={`flex-row items-end px-2 ${message.replyTo ? "pb-2" : ""}`}
                                >
                                    <Pressable
                                        className="mr-1 h-12 w-10 items-center justify-center"
                                        onPress={handleAttachment}
                                    >
                                        <Paperclip size={22} color="#71717a" />
                                    </Pressable>
                                    <View className="min-h-[48px] flex-1 flex-row items-end rounded-3xl border border-zinc-200 bg-white px-2 shadow-sm">
                                        {attachedFile ? (
                                            <View className="my-1.5 mr-1 flex-1 flex-row items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-100 px-3 py-2">
                                                <View className="mr-2 flex-1">
                                                    <Text
                                                        className="text-[13px] font-medium text-zinc-800"
                                                        numberOfLines={1}
                                                    >
                                                        {attachedFile.name}
                                                    </Text>
                                                    <Text className="text-[10px] text-zinc-500">
                                                        {attachedFile.size
                                                            ? attachedFile.size / (1024 * 1024) >= 1
                                                                ? `${(attachedFile.size / (1024 * 1024)).toFixed(2)} MB`
                                                                : `${(attachedFile.size / 1024).toFixed(1)} KB`
                                                            : ""}
                                                    </Text>
                                                </View>
                                                <Pressable
                                                    className="h-7 w-7 items-center justify-center rounded-full bg-zinc-200"
                                                    onPress={() => setAttachedFile(null)}
                                                >
                                                    <X size={14} color="#71717a" />
                                                </Pressable>
                                            </View>
                                        ) : (
                                            <TextInput
                                                className="max-h-32 flex-1 px-1 pb-3 pt-3 text-base text-zinc-900"
                                                multiline
                                                placeholder="Message"
                                                placeholderTextColor="#a1a1aa"
                                                value={message.message}
                                                onChangeText={(text) =>
                                                    setMessage((prev) => ({
                                                        ...prev,
                                                        message: text
                                                    }))
                                                }
                                            />
                                        )}
                                    </View>
                                    <Pressable
                                        className={`ml-2 h-12 w-12 items-center justify-center rounded-full shadow-sm ${
                                            message.message.trim() || attachedFile
                                                ? "bg-amber-500"
                                                : "bg-zinc-300"
                                        }`}
                                        onPress={handleSend}
                                        disabled={
                                            (!message.message.trim() && !attachedFile) || loading
                                        }
                                    >
                                        <SendHorizontal
                                            size={20}
                                            color={
                                                message.message.trim() || attachedFile
                                                    ? "#451a03"
                                                    : "#71717a"
                                            }
                                        />
                                    </Pressable>
                                </View>
                                {error && (
                                    <Text className="mt-2 text-center text-xs text-rose-500">
                                        {error}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Animated.View>

                {/* Group Details Overlay */}
                <Animated.View
                    style={[
                        groupInfoStyle,
                        {
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#f4f4f5",
                            zIndex: 20
                        }
                    ]}
                >
                    <View className="flex-row items-center bg-slate-900 px-2 pb-4 shadow-md">
                        <Pressable className="p-2" onPress={() => setGroupDetails(null)}>
                            <ChevronLeft size={28} color="#f4f4f5" />
                        </Pressable>
                        <Text className="ml-2 text-xl font-bold text-zinc-50">Group Info</Text>
                    </View>

                    <ScrollView className="flex-1">
                        <View className="mb-2 items-center border-b border-zinc-200 bg-white py-8 shadow-sm">
                            <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-amber-100">
                                <Text className="text-4xl font-bold text-amber-700">
                                    {chosenService?.serviceName.substring(0, 1).toUpperCase()}
                                </Text>
                            </View>
                            <Text className="mb-1 text-2xl font-bold text-zinc-900">
                                {chosenService?.serviceName}
                            </Text>
                            <Text className="mb-1 text-base font-medium text-zinc-500">
                                {chosenService
                                    ? `${format(new Date(chosenService.date), "EEEE, dd MMMM yyyy")} • ${chosenService.time}`
                                    : ""}
                            </Text>
                            <Text className="text-sm text-zinc-400">
                                Group • {groupDetails?.length || 0} members
                            </Text>
                        </View>

                        <View className="border-y border-zinc-200 bg-white py-2 shadow-sm">
                            <Text className="px-5 py-3 text-sm font-bold uppercase tracking-wider text-amber-600">
                                Members
                            </Text>
                            {groupDetails?.map((g, index) => (
                                <View
                                    key={g.userId}
                                    className={`flex-row items-center justify-between px-5 py-3 ${index < groupDetails.length - 1 ? "border-b border-zinc-100" : ""}`}
                                >
                                    <View className="flex-1 flex-row items-center pr-4">
                                        <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                                            <Text className="text-lg font-bold text-zinc-500">
                                                {g.userName.substring(0, 1).toUpperCase()}
                                            </Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="mb-0.5 text-base font-bold text-zinc-900">
                                                {g.userName}
                                            </Text>
                                            <Text className="text-sm text-zinc-500">
                                                {g.phoneNumber}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        {g.roleName?.map((role, idx) => (
                                            <View
                                                key={idx}
                                                className="mb-1 rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1"
                                            >
                                                <Text className="text-[10px] font-bold uppercase text-indigo-600">
                                                    {role}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </Animated.View>

                {/* Read Status Overlay */}
                <Animated.View
                    style={[
                        readStatusStyle,
                        {
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#f4f4f5",
                            zIndex: 30
                        }
                    ]}
                >
                    <View className="flex-row items-center bg-slate-900 px-2 pb-4 shadow-md">
                        <Pressable className="p-2" onPress={() => setReadStatusChat(null)}>
                            <ChevronLeft size={28} color="#f4f4f5" />
                        </Pressable>
                        <View className="ml-2">
                            <Text className="text-xl font-bold text-zinc-50">Message Info</Text>
                            <Text className="text-xs text-zinc-400">
                                {readStatusChat
                                    ? format(
                                          new Date(readStatusChat.createdAt),
                                          "d MMMM yyyy, HH:mm"
                                      )
                                    : ""}
                            </Text>
                        </View>
                    </View>

                    <ScrollView className="flex-1">
                        {/* Message Preview */}
                        {readStatusChat && (
                            <View className="items-end border-b border-zinc-200 bg-white p-4 shadow-sm">
                                <View className="relative max-w-[80%] rounded-2xl rounded-tr-sm bg-[#dcf8c6] px-3 pb-2 pt-2 shadow-sm">
                                    {readStatusChat.file ? (
                                        <Pressable
                                            className="mt-1 rounded-lg bg-[#c5e6b1] p-3"
                                            onPress={() =>
                                                Linking.openURL(readStatusChat.file!.url)
                                            }
                                        >
                                            <Text className="font-medium text-zinc-900">
                                                {readStatusChat.message || "Attached File"}
                                            </Text>
                                        </Pressable>
                                    ) : (
                                        <Text className="text-[15px] leading-5 text-zinc-900">
                                            {readStatusChat.message}
                                            <Text className="text-[10px] text-transparent">
                                                {
                                                    "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
                                                }
                                            </Text>
                                        </Text>
                                    )}
                                    <View
                                        className={`flex-row items-center gap-1 ${readStatusChat.file ? "mt-1 self-end" : "absolute bottom-1.5 right-3"}`}
                                    >
                                        <Text className="text-[10px] text-zinc-500">
                                            {format(new Date(readStatusChat.createdAt), "HH:mm")}
                                        </Text>
                                        <CheckCheck
                                            size={14}
                                            color={
                                                members &&
                                                members.length > 1 &&
                                                readStatusChat.readBy.filter(
                                                    (r) => r.userId !== readStatusChat.userId
                                                ).length >=
                                                    members.length - 1
                                                    ? "#3b82f6"
                                                    : "#9ca3af"
                                            }
                                        />
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Read By List */}
                        {readStatusChat &&
                            readStatusChat.readBy.filter((r) => r.userId !== userId.id).length >
                                0 && (
                                <View className="mt-4 border-y border-zinc-200 bg-white py-2 shadow-sm">
                                    <View className="flex-row items-center gap-2 px-5 py-3">
                                        <CheckCheck size={18} color="#3b82f6" />
                                        <Text className="text-sm font-bold uppercase tracking-wider text-blue-500">
                                            Read By
                                        </Text>
                                    </View>
                                    {readStatusChat.readBy
                                        .filter((r) => r.userId !== userId.id)
                                        .map((r, index, arr) => (
                                            <View
                                                key={r.userId}
                                                className={`flex-row items-center justify-between px-5 py-3 ${index < arr.length - 1 ? "border-b border-zinc-100" : ""}`}
                                            >
                                                <Text className="text-base font-bold text-zinc-900">
                                                    {r.userName}
                                                </Text>
                                                <Text className="text-sm font-medium text-blue-500">
                                                    Read
                                                </Text>
                                            </View>
                                        ))}
                                </View>
                            )}

                        {/* Unread By List */}
                        {readStatusChat &&
                            members &&
                            members.filter(
                                (m) =>
                                    m.userId !== userId.id &&
                                    !readStatusChat.readBy.some((r) => r.userId === m.userId)
                            ).length > 0 && (
                                <View className="mb-10 mt-4 border-y border-zinc-200 bg-white py-2 shadow-sm">
                                    <View className="flex-row items-center gap-2 px-5 py-3">
                                        <CheckCheck size={18} color="#9ca3af" />
                                        <Text className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                                            Remaining
                                        </Text>
                                    </View>
                                    {members
                                        .filter(
                                            (m) =>
                                                m.userId !== userId.id &&
                                                !readStatusChat.readBy.some(
                                                    (r) => r.userId === m.userId
                                                )
                                        )
                                        .map((m, index, arr) => (
                                            <View
                                                key={m.userId}
                                                className={`flex-row items-center justify-between px-5 py-3 ${index < arr.length - 1 ? "border-b border-zinc-100" : ""}`}
                                            >
                                                <Text className="text-base font-bold text-zinc-900">
                                                    {m.userName}
                                                </Text>
                                                <Text className="text-sm font-medium text-zinc-400">
                                                    Delivered
                                                </Text>
                                            </View>
                                        ))}
                                </View>
                            )}
                    </ScrollView>
                </Animated.View>
            </GestureHandlerRootView>
        </SafeAreaView>
    )
}
