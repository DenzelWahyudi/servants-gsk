import { useEffect, useState } from "react"
import { Header } from "../components/Header"
import { API_URL } from "../api"
import { useAuth } from "../hooks/useAuth"
import { ChevronLeftIcon } from "@heroicons/react/24/solid"
import { SendHorizontal, X, CheckCheck, Paperclip } from "lucide-react"
import { format } from "date-fns"
import { useLayoutEffect, useRef } from "react"
import { useChatSocket } from "../hooks/useChatSocket"
import React from "react"
import { motion } from "framer-motion"

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

interface Message {
    serviceId: string
    message: string
    file: UploadedFile | null
    status: string
    replyTo: ReplyTo | null
}

interface ReplyTo {
    chatId: string
    userId: string
    userName: string
    message: string
}

interface Chat {
    id: string
    userId: string
    userName: string
    message: string
}

interface Member {
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

export function Chats() {
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
    const containerRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const stickToBottomRef = useRef(true)
    const [userId, setUserId] = useState({
        id: ""
    })
    const [groupDetails, setGroupDetails] = useState<Group[] | null>(null)
    const [loading, setLoading] = useState(false)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const messageRefs = useRef<Record<string, HTMLDivElement | null>>({})
    const [highlightedId, setHighlightedId] = useState<string | null>(null)
    const [members, setMembers] = useState<Member[] | null>(null)
    const [readStatusChat, setReadStatusChat] = useState<{
        id: string
        userId: string
        userName: string
        message: string
        createdAt: string
        readBy: { userId: string; userName: string }[]
        replyTo: { chatId: string; userId: string; userName: string; message: string } | null
    } | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [attachedFile, setAttachedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
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
            if (searchQuery.length < 1) setAssignedServices(sorted)
            else {
                const filteredServices = data.filter((s) =>
                    s.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
                )
                setAssignedServices(filteredServices)
            }
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

        void fetchAssignedServices()
        void fetchUserId()
    }, [token, searchQuery])

    const handleScroll = () => {
        const el = containerRef.current
        if (!el) return
        stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 32
    }

    useLayoutEffect(() => {
        if (containerRef.current && stickToBottomRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight
        }

        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "auto"
            textarea.style.height = `${textarea.scrollHeight}px`
            textarea.style.overflowY = textarea.scrollHeight >= 128 ? "auto" : "hidden"
        }
    }, [chats, message.message])

    function handleChange(field: keyof typeof message) {
        return (e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setMessage((prev) => ({ ...prev, [field]: e.target.value }))
    }

    async function handleSend() {
        setLoading(true)
        setError(null)

        let payload = message

        try {
            if (attachedFile) {
                const data: UploadedFile = await uploadFile()
                payload = { ...message, message: attachedFile.name, file: data }
                handleRemoveFile()
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
        } catch {
            setError("Could not connect to the server. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    async function fetchGroupDetails(serviceId: string) {
        setLoadingDetails(true)
        setError(null)

        const response = await fetch(`${API_URL}/api/assignments/group/${serviceId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        })

        const data: Group[] = await response.json()

        if (!response.ok) {
            setLoadingDetails(false)
            setError("Failed to get group details")
            return
        }

        setGroupDetails(data)
        setLoadingDetails(false)
    }

    function handleReply(c: Chat) {
        setMessage((prev) => ({
            ...prev,
            replyTo: {
                chatId: c.id,
                userId: c.userId,
                userName: c.userName,
                message: c.message
            }
        }))
    }

    function scrollToMessage(chatId: string) {
        const el = messageRefs.current[chatId]
        if (!el) return
        el.scrollIntoView({ behavior: "smooth", block: "center" })
        setHighlightedId(chatId)
        setTimeout(() => setHighlightedId(null), 1500)
    }

    async function handleReadServiceChats(serviceId: string) {
        setError(null)

        const response = await fetch(`${API_URL}/api/chats/read-all`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ serviceId })
        })

        if (!response.ok) {
            setError("Failed to mark read all service chats.")
            return
        }
        setError(null)
    }

    async function fetchGroupMemberNames(serviceId: string) {
        setError(null)

        const response = await fetch(`${API_URL}/api/assignments/group-names/${serviceId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        })

        const data: Member[] = await response.json()

        if (!response.ok) {
            setError("Failed to get group member names")
            return
        }

        setMembers(data)
    }

    function handleSearchService(e: React.ChangeEvent<HTMLInputElement>) {
        return setSearchQuery(e.target.value)
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) setAttachedFile(file)
    }

    function handleRemoveFile() {
        setAttachedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    function handlePreviewFile(file: File) {
        if (file.type.startsWith("image/")) {
            return window.open(URL.createObjectURL(file), "_blank", "noopener,noreffer")
        }
    }

    async function uploadFile(): Promise<UploadedFile> {
        setError(null)

        if (!attachedFile) {
            throw new Error("No file attached!")
        }

        const formData = new FormData()
        formData.append("file", attachedFile)

        const response = await fetch(`${API_URL}/api/file/upload`, {
            method: "POST",
            body: formData
        })

        const data: UploadedFile = await response.json()
        if (!response.ok) {
            setError("Failed to upload file to cloudinary.")
            throw new Error("Failed to upload file!")
        }

        return data
    }

    return (
        <div className="mx-auto flex flex-col gap-5 p-4 py-5 sm:px-12">
            <Header variant="chats" />

            <div className="relative mx-auto flex h-147 w-full justify-center overflow-hidden">
                <div
                    className={`absolute flex h-full w-full flex-col gap-4 overflow-y-auto bg-slate-800 py-4 transition-transform duration-300 ease-in-out ${chosenService ? "-translate-x-full" : "translate-x-0"}`}
                >
                    <input
                        className="mx-2 rounded-lg border border-slate-600 bg-slate-700 px-3 py-1 text-sm text-zinc-100 transition-colors outline-none focus:border-amber-400"
                        placeholder="🔍︎  Search Service"
                        value={searchQuery}
                        onChange={handleSearchService}
                    />
                    <div className="pr-0 select-none">
                        {assignedServices?.length === 0 ? (
                            <p className="text-center text-sm text-zinc-100">
                                No assignments found — this may still be loading
                            </p>
                        ) : (
                            assignedServices?.map((s) => (
                                <button
                                    className="flex w-full justify-between border-y border-zinc-700 px-2.5 py-2 text-sm font-medium hover:bg-slate-600"
                                    key={s.serviceId}
                                    onClick={() => {
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
                                >
                                    <div className="flex flex-col text-left">
                                        <span>{s.serviceName}</span>
                                        <span className="font-normal text-zinc-300">
                                            {format(new Date(s.date), "d MMMM yyyy")}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5">
                                        <span>{s.time}</span>
                                        {s.unreadMessage > 0 ? (
                                            <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-indigo-500 px-1.5 font-light">
                                                {s.unreadMessage}
                                            </span>
                                        ) : (
                                            <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 font-light" />
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* chat view */}
                <div
                    className={`absolute flex h-full w-full flex-col bg-slate-800 transition-transform duration-300 ease-in-out ${chosenService ? "translate-x-0" : "translate-x-full"}`}
                >
                    <div className="flex items-center justify-between bg-slate-700 px-2.5 py-3.5 select-none">
                        <div className="flex items-center gap-1">
                            <ChevronLeftIcon
                                className="-ml-2 h-6.5 cursor-pointer transition-colors hover:text-slate-600"
                                onClick={() => {
                                    setChosenService(null)
                                    setMessage((prev) => ({ ...prev, replyTo: null }))
                                }}
                            />
                            <div className="flex flex-col items-start gap-1">
                                <button
                                    disabled={loadingDetails}
                                    className="text-[13.5px] leading-none font-medium hover:text-zinc-300 disabled:text-zinc-300"
                                    onClick={() => fetchGroupDetails(chosenService!.serviceId)}
                                >
                                    {chosenService?.serviceName}
                                </button>
                                <h2 className="text-[10px] leading-none text-zinc-300">
                                    {chosenService
                                        ? format(new Date(chosenService.date), "d MMMM yyyy")
                                        : null}
                                </h2>
                            </div>
                        </div>
                        <h3 className="text-[12px]">{chosenService?.time}</h3>
                    </div>

                    <div
                        ref={containerRef}
                        onScroll={handleScroll}
                        className="flex h-full w-full flex-col gap-2.5 overflow-y-auto px-2.5 py-2"
                    >
                        {chats?.map((c, index) => {
                            const currentDate = new Date(c.createdAt)
                            const prevDate = index > 0 ? new Date(chats[index - 1].createdAt) : null
                            const showDateSeperator =
                                !prevDate || currentDate.toDateString() !== prevDate.toDateString()

                            return (
                                <React.Fragment key={c.id}>
                                    {showDateSeperator && (
                                        <div className="my-1 flex justify-center">
                                            <span className="rounded-md bg-zinc-900 px-2 text-[10.5px] font-medium">
                                                {format(currentDate, "EEE, d MMMM")}
                                            </span>
                                        </div>
                                    )}
                                    {c.replyTo === null ? (
                                        <motion.div
                                            drag="x"
                                            dragConstraints={{ left: -90, right: 90 }}
                                            dragElastic={{ left: 0.5, right: 0.5 }}
                                            dragSnapToOrigin
                                            onDragEnd={(_, info) => {
                                                if (info.offset.x > 60) handleReply(c)
                                                if (info.offset.x < -60 && c.userId === userId.id)
                                                    setReadStatusChat(c)
                                            }}
                                            className={`relative ${c.userId === userId.id ? "self-end bg-sky-700" : "self-start bg-zinc-800"} max-w-3/4 items-end gap-2.5 rounded-lg px-1.5 py-1 ${highlightedId === c.id ? "ring-2 ring-amber-400 transition-all" : ""}`}
                                            ref={(el) => {
                                                messageRefs.current[c.id] =
                                                    el as HTMLDivElement | null
                                            }}
                                        >
                                            <span
                                                className={`${c.userId === userId.id ? "hidden" : ""} text-[12px] font-semibold text-rose-400`}
                                            >
                                                {c.userName}
                                            </span>
                                            <div className="text-sm wrap-break-word whitespace-pre-wrap select-text">
                                                {c.file ? (
                                                    <div
                                                        className={`${c.userId === userId.id ? "bg-sky-900" : "bg-black/25"} cursor-pointer rounded px-1.5 py-2.5 select-none`}
                                                        onClick={() =>
                                                            window.open(
                                                                c.file?.url,
                                                                "_blank",
                                                                "noopener,noreffer"
                                                            )
                                                        }
                                                    >
                                                        {c.message}
                                                    </div>
                                                ) : (
                                                    c.message
                                                )}
                                                <span className="invisible ml-2.5 inline-flex gap-1 text-[10px] whitespace-nowrap">
                                                    {format(new Date(c.createdAt), "HH:mm")}{" "}
                                                    {c.userId === userId.id && (
                                                        <CheckCheck
                                                            size={13}
                                                            className="text-zinc-100"
                                                        />
                                                    )}
                                                </span>
                                            </div>
                                            <span className="absolute right-1.5 bottom-1 inline-flex items-center gap-1 text-[10px] whitespace-nowrap text-zinc-300 select-none">
                                                {format(new Date(c.createdAt), "HH:mm")}{" "}
                                                {c.userId === userId.id && (
                                                    <CheckCheck
                                                        size={13}
                                                        className={
                                                            members &&
                                                            c.readBy.length < members.length
                                                                ? "text-zinc-100"
                                                                : "text-blue-800"
                                                        }
                                                    />
                                                )}
                                            </span>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            drag="x"
                                            dragConstraints={{ left: -90, right: 90 }}
                                            dragElastic={{ left: 0.5, right: 0.5 }}
                                            dragSnapToOrigin
                                            onDragEnd={(_, info) => {
                                                if (info.offset.x > 60) handleReply(c)
                                                if (info.offset.x < -60 && c.userId === userId.id)
                                                    setReadStatusChat(c)
                                            }}
                                            className={`relative ${c.userId === userId.id ? "self-end bg-sky-700" : "self-start bg-zinc-800"} max-w-3/4 items-end gap-2.5 rounded-lg px-1.5 py-1 ${highlightedId === c.id ? "ring-2 ring-amber-400 transition-all" : ""}`}
                                            ref={(el) => {
                                                messageRefs.current[c.id] =
                                                    el as HTMLDivElement | null
                                            }}
                                        >
                                            <span
                                                className={`${c.userId === userId.id ? "hidden" : ""} text-[12px] font-semibold text-rose-400`}
                                            >
                                                {c.userName}
                                            </span>
                                            <div
                                                className={`${c.userId === userId.id ? "bg-sky-900" : "bg-black/25"} flex max-h-22.5 flex-col items-start overflow-hidden rounded-lg border-l-3 border-rose-400 p-2 text-sm`}
                                                onClick={() => {
                                                    if (c.replyTo !== null)
                                                        scrollToMessage(c.replyTo.chatId)
                                                }}
                                            >
                                                <span className="text-[12px] font-semibold text-rose-400">
                                                    {c.replyTo.userName}
                                                </span>
                                                <span className="w-full text-sm wrap-break-word whitespace-pre-wrap text-zinc-200">
                                                    {c.replyTo.message}
                                                </span>
                                            </div>
                                            <div className="text-sm wrap-break-word whitespace-pre-wrap select-text">
                                                {c.file ? (
                                                    <div
                                                        className={`${c.userId === userId.id ? "bg-sky-900" : "bg-black/25"} mt-1.5 cursor-pointer rounded px-1.5 py-2.5 select-none`}
                                                        onClick={() =>
                                                            window.open(
                                                                c.file?.url,
                                                                "_blank",
                                                                "noopener,noreffer"
                                                            )
                                                        }
                                                    >
                                                        {c.message}
                                                    </div>
                                                ) : (
                                                    c.message
                                                )}
                                                <span className="invisible ml-2.5 inline-flex gap-1 text-[10px] whitespace-nowrap">
                                                    {format(new Date(c.createdAt), "HH:mm")}{" "}
                                                    {c.userId === userId.id && (
                                                        <CheckCheck
                                                            size={13}
                                                            className="text-zinc-100"
                                                        />
                                                    )}
                                                </span>
                                            </div>
                                            <span className="absolute right-1.5 bottom-1 inline-flex items-center gap-1 text-[10px] whitespace-nowrap text-zinc-300 select-none">
                                                {format(new Date(c.createdAt), "HH:mm")}{" "}
                                                {c.userId === userId.id && (
                                                    <CheckCheck
                                                        size={13}
                                                        className={
                                                            members &&
                                                            c.readBy.length < members.length
                                                                ? "text-zinc-100"
                                                                : "text-blue-700"
                                                        }
                                                    />
                                                )}
                                            </span>
                                        </motion.div>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </div>

                    {message.replyTo ? (
                        <div className="bg-slate-700 p-2 pb-0">
                            <div
                                className={`${message.replyTo.userId === userId.id ? "bg-sky-900" : "bg-black/50"} flex max-h-[89.9px] flex-col items-start overflow-hidden rounded-lg border-l-3 border-rose-400 p-2 text-sm`}
                            >
                                <div className="flex w-full justify-between">
                                    <span className="text-[12px] font-semibold text-rose-400">
                                        {message.replyTo.userName}
                                    </span>
                                    <button
                                        className="rounded-full bg-black/50 p-1 text-center hover:text-black/50"
                                        onClick={() =>
                                            setMessage((prev) => ({ ...prev, replyTo: null }))
                                        }
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                                <span className="w-full text-sm wrap-break-word whitespace-pre-wrap text-zinc-200">
                                    {message.replyTo.message}
                                </span>
                            </div>
                        </div>
                    ) : null}
                    <div className="mt-auto flex items-center gap-1.5 bg-slate-700 px-2.5 py-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex h-5 w-5 shrink-0 items-center justify-center text-zinc-300 transition-colors hover:text-amber-400"
                        >
                            <Paperclip size={16} />
                        </button>

                        {attachedFile ? (
                            <div className="flex w-full min-w-0 flex-1 items-center justify-between rounded-2xl border border-slate-600 bg-slate-700/80 px-3 py-2 text-sm text-zinc-100 shadow-sm">
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                    <div className="flex flex-col overflow-hidden">
                                        <span
                                            className="text-[13px] font-medium wrap-break-word text-zinc-200"
                                            onClick={() => handlePreviewFile(attachedFile)}
                                        >
                                            {attachedFile.name}
                                        </span>
                                        <span className="text-[10px] text-zinc-400">
                                            {attachedFile.size / (1024 * 1024) >= 1
                                                ? `${(attachedFile.size / (1024 * 1024)).toFixed(2)} MB`
                                                : `${(attachedFile.size / 1024).toFixed(1)} KB`}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800/50 text-zinc-400 transition-all hover:bg-rose-500/20 hover:text-rose-400"
                                    onClick={handleRemoveFile}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <textarea
                                ref={textareaRef}
                                className="max-h-32 w-full resize-none overflow-y-hidden rounded-2xl border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm leading-normal text-zinc-100 transition-colors outline-none focus:border-amber-400"
                                rows={1}
                                value={message.message}
                                onChange={handleChange("message")}
                            />
                        )}
                        <button
                            onClick={() => handleSend()}
                            disabled={(message.message === "" && attachedFile === null) || loading}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-green-600 text-zinc-950 hover:bg-green-950 disabled:bg-green-800"
                        >
                            <SendHorizontal size={15} />
                        </button>
                    </div>
                    {error && (
                        <span className="py-0.5 text-center text-sm text-red-500">{error}</span>
                    )}
                </div>

                {/* group description view */}
                <div
                    className={`absolute h-full w-full overflow-y-auto bg-slate-800 px-2.5 py-3.5 transition-transform duration-300 ease-in-out ${groupDetails && chosenService ? "translate-x-0" : "translate-x-full"}`}
                >
                    <ChevronLeftIcon
                        className="-ml-2 h-6.5 cursor-pointer transition-colors hover:text-slate-600"
                        onClick={() => setGroupDetails(null)}
                    />
                    <div className="flex flex-col items-center gap-1">
                        <h1 className="text-xl font-semibold">{chosenService?.serviceName}</h1>
                        <h3 className="text-sm text-zinc-300">
                            Group ⋅ {groupDetails?.length} members
                        </h3>
                        <h1 className="text-sm">
                            {chosenService
                                ? `${format(new Date(chosenService.date), "EEEE dd MMMM yyyy")}, ${chosenService.time}`
                                : null}
                        </h1>
                        <div className="mt-2 flex w-83 flex-col rounded-lg border border-zinc-400 px-3">
                            {groupDetails?.map((g, index) => (
                                <div
                                    key={g.userId}
                                    className={`flex justify-between py-3 ${index < groupDetails.length - 1 ? "border-b" : ""}`}
                                >
                                    <div className="flex flex-col">
                                        <span className="wrap-break-word">{g.userName}</span>
                                        <span className="text-sm text-zinc-300">
                                            {g.phoneNumber}
                                        </span>
                                    </div>
                                    <div className="flex w-33 flex-col">
                                        {g.roleName?.map((e, index) => (
                                            <span
                                                className={`rounded bg-indigo-400/30 px-2 py-0.5 wrap-break-word ${index > 0 ? "mt-2" : ""} text-sm`}
                                            >
                                                {e}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* read / unread status view */}
                <div
                    className={`absolute h-full w-full overflow-y-auto bg-slate-800 transition-transform duration-300 ease-in-out ${readStatusChat && chosenService ? "translate-x-0" : "translate-x-full"}`}
                >
                    {/* header */}
                    <div className="flex items-center gap-1 bg-slate-700 px-2.5 py-3.5 select-none">
                        <ChevronLeftIcon
                            className="-ml-2 h-6.5 cursor-pointer transition-colors hover:text-slate-600"
                            onClick={() => setReadStatusChat(null)}
                        />
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-[13.5px] leading-none font-medium">
                                Message Info
                            </span>
                            <span className="text-[10px] leading-none text-zinc-300">
                                {readStatusChat
                                    ? format(
                                          new Date(readStatusChat.createdAt),
                                          "d MMMM yyyy, HH:mm"
                                      )
                                    : null}
                            </span>
                        </div>
                    </div>

                    {/* message preview */}
                    {readStatusChat && (
                        <div className="flex flex-col border-b border-zinc-700 px-2.5 py-3">
                            <div className="relative ml-auto max-w-3/4 self-end rounded-lg bg-sky-700 px-1.5 py-1">
                                <div className="text-sm wrap-break-word whitespace-pre-wrap select-text">
                                    {readStatusChat.message}
                                    <span className="invisible ml-2.5 inline-flex gap-1 text-[10px] whitespace-nowrap">
                                        {format(new Date(readStatusChat.createdAt), "HH:mm")}
                                        <CheckCheck size={13} />
                                    </span>
                                </div>
                                <span className="absolute right-1.5 bottom-1 inline-flex items-center gap-1 text-[10px] whitespace-nowrap text-zinc-300 select-none">
                                    {format(new Date(readStatusChat.createdAt), "HH:mm")}
                                    <CheckCheck
                                        size={13}
                                        className={
                                            members && readStatusChat.readBy.length < members.length
                                                ? "text-zinc-100"
                                                : "text-blue-500"
                                        }
                                    />
                                </span>
                            </div>
                        </div>
                    )}

                    {/* read by section */}
                    {readStatusChat &&
                        readStatusChat.readBy.filter((r) => r.userId !== userId.id).length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 px-2.5 pt-3 pb-1">
                                    <CheckCheck size={14} className="text-blue-400" />
                                    <span className="text-[11px] font-semibold tracking-widest text-blue-400 uppercase">
                                        Read
                                    </span>
                                </div>
                                {readStatusChat.readBy
                                    .filter((r) => r.userId !== userId.id)
                                    .map((r, index, arr) => (
                                        <div
                                            key={r.userId}
                                            className={`flex items-center justify-between px-2.5 py-2.5 ${index < arr.length - 1 ? "border-b border-zinc-700" : ""}`}
                                        >
                                            <span className="text-[13.5px] font-medium">
                                                {r.userName}
                                            </span>
                                            <span className="text-[11px] font-medium text-blue-400">
                                                Read
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        )}

                    {/* unread by section */}
                    {readStatusChat &&
                        members &&
                        members.filter(
                            (m) =>
                                m.userId !== userId.id &&
                                !readStatusChat.readBy.some((r) => r.userId === m.userId)
                        ).length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 px-2.5 pt-3 pb-1">
                                    <CheckCheck size={14} className="text-zinc-400" />
                                    <span className="text-[11px] font-semibold tracking-widest text-zinc-400 uppercase">
                                        Unread
                                    </span>
                                </div>
                                {members!
                                    .filter(
                                        (m) =>
                                            m.userId !== userId.id &&
                                            !readStatusChat!.readBy.some(
                                                (r) => r.userId === m.userId
                                            )
                                    )
                                    .map((m, index, arr) => (
                                        <div
                                            key={m.userId}
                                            className={`flex items-center justify-between px-2.5 py-2.5 ${index < arr.length - 1 ? "border-b border-zinc-700" : ""}`}
                                        >
                                            <span className="text-[13.5px] font-medium">
                                                {m.userName}
                                            </span>
                                            <span className="text-[11px] font-medium text-zinc-400">
                                                Unread
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        )}
                </div>
            </div>
        </div>
    )
}
