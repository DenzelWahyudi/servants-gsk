import { useEffect, useRef, useState } from "react"
import { API_URL } from "../api"
import { useAuth } from "./useAuth.ts"

interface Chat {
    id: string
    userId: string
    userName: string
    message: string
    file: UploadedFile | null
    status: string
    replyTo: ReplyTo | null
    readBy: ReadBy[] | []
    createdAt: string
}

interface ReplyTo {
    chatId: string
    userId: string
    userName: string
    message: string
}

interface ReadBy {
    userId: string
    userName: string
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

// Derives ws:// or wss:// from your existing API_URL automatically
const WS_URL = API_URL.replace(/^http/, "ws")

export function useChatSocket(serviceId: string | undefined) {
    const [chats, setChats] = useState<Chat[]>([])
    const wsRef = useRef<WebSocket | null>(null)
    const { token } = useAuth()

    useEffect(() => {
        let cancelled = false

        if (!serviceId) return

        // Initial load via REST
        fetch(`${API_URL}/api/chats/${serviceId}`, {
            headers: { "Content-Type": "application/json" }
        })
            .then((res) => res.json())
            .then((data: Chat[]) => {
                if (!cancelled) setChats(data)
            })
            .catch((err) => {
                if (!cancelled) console.error("Failed to load chats:", err)
            })

        // Live updates via WebSocket
        function connect() {
            const ws = new WebSocket(`${WS_URL}/ws/chats/${serviceId}`)
            wsRef.current = ws

            ws.onmessage = (event) => {
                const { type, data } = JSON.parse(event.data)
                if (type === "NEW_CHAT") {
                    setChats((prev) => [...prev, data])
                    void fetch(`${API_URL}/api/chats/read`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ serviceId, chatId: data.id })
                    })
                }
                if (type === "NEW_READ") {
                    setChats((prev) =>
                        prev.map((chat) =>
                            chat.id === data.id ? { ...chat, readBy: data.readBy } : chat
                        )
                    )
                }
                if (type === "NEW_READS") {
                    setChats((prev) =>
                        prev.map((chat) => {
                            const matchingChat = data.find(
                                (newChat: Chat) => newChat.id === chat.id
                            )
                            return matchingChat ? { ...chat, readBy: matchingChat.readBy } : chat
                        })
                    )
                }
            }

            ws.onerror = () => ws.close()

            ws.onclose = () => {
                if (!cancelled) setTimeout(connect, 3000) // ← only retry if still active
            }
        }

        connect()

        return () => {
            cancelled = true
            wsRef.current?.close()
            wsRef.current = null
        }
    }, [serviceId, token])

    return { chats }
}
