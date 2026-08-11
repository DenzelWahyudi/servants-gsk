import { KeyboardAvoidingView, Pressable, ScrollView, TextInput, View } from "react-native"
import { useState, useEffect, useRef } from "react"
import { useNotes } from "@/hooks/useNotes"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { SafeAreaView } from "react-native-safe-area-context"

const PAGE_COLORS = [
    { page: "#14213D", accent: "#34559e" },
    { page: "#14532D", accent: "#2cb562" },
    { page: "#7A1F3D", accent: "#cc3869" },
    { page: "#2C3333", accent: "#667676" },
    { page: "#4B1D6E", accent: "#8734c6" },
    { page: "#0B4F5C", accent: "#18adc9" },
    { page: "#8B3A1F", accent: "#d4623c" }
]

export default function NotesPage() {
    const { getNoteText, saveNoteText, getAllPagesWithText } = useNotes()
    const [page, setPage] = useState<string>("#14213D")
    const [text, setText] = useState<string>("")
    const [pagesWithText, setPagesWithText] = useState<Set<string>>(new Set())
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const pendingSaveRef = useRef<{ color: string; text: string } | null>(null)
    const saveNoteTextRef = useRef(saveNoteText)
    saveNoteTextRef.current = saveNoteText

    // Load which pages have text on mount
    useEffect(function loadPagesWithText() {
        getAllPagesWithText().then(function (colors) {
            setPagesWithText(new Set(colors))
        })

        AsyncStorage.getItem("lastOpenedNotePage")
            .then(function (savedPage) {
                if (savedPage) {
                    setPage(savedPage)
                }
            })
            .catch(function (error) {
                console.error("Error loading last opened page", error)
            })
    }, [])

    // Load note text when page color changes
    useEffect(
        function loadNote() {
            AsyncStorage.setItem("lastOpenedNotePage", page).catch(function (error) {
                console.error("Error saving last opened page", error)
            })

            // Flush any pending save for the previous page before switching
            if (saveTimerRef.current !== null) {
                clearTimeout(saveTimerRef.current)
                saveTimerRef.current = null
            }
            if (pendingSaveRef.current !== null) {
                void saveNoteTextRef.current(
                    pendingSaveRef.current.color,
                    pendingSaveRef.current.text
                )
                pendingSaveRef.current = null
            }

            getNoteText(page).then(function (savedText) {
                setText(savedText)
                setPagesWithText((prev) => {
                    const next = new Set(prev)
                    if (savedText === "") {
                        next.delete(page)
                    } else {
                        next.add(page)
                    }
                    return next
                })
            })
        },
        [page]
    )

    // Flush pending save on unmount
    useEffect(function mountCleanup() {
        return () => {
            if (saveTimerRef.current !== null) {
                clearTimeout(saveTimerRef.current)
            }
            if (pendingSaveRef.current !== null) {
                void saveNoteTextRef.current(
                    pendingSaveRef.current.color,
                    pendingSaveRef.current.text
                )
            }
        }
    }, [])

    function handleTextChange(newText: string) {
        setText(newText)
        setPagesWithText((prev) => {
            const next = new Set(prev)
            if (newText === "") {
                next.delete(page)
            } else {
                next.add(page)
            }
            return next
        })
        pendingSaveRef.current = { color: page, text: newText }

        if (saveTimerRef.current !== null) {
            clearTimeout(saveTimerRef.current)
        }

        saveTimerRef.current = setTimeout(() => {
            void saveNoteTextRef.current(page, newText)
            pendingSaveRef.current = null
            saveTimerRef.current = null
        }, 300)
    }

    return (
        <SafeAreaView className="flex-1 bg-zinc-900" edges={["top"]}>
            <View className="flex-1" style={{ backgroundColor: page }}>
                <View className="flex-row items-center justify-evenly bg-zinc-900 px-6 py-3">
                    {PAGE_COLORS.map((color) => {
                        const hasText = pagesWithText.has(color.page)
                        const isSelected = page === color.page
                        return (
                            <Pressable
                                key={color.page}
                                className="h-7 w-7 rounded-full border-4"
                                style={{
                                    borderColor: hasText ? color.accent : color.page,
                                    backgroundColor: isSelected ? color.accent : "transparent"
                                }}
                                onPress={function () {
                                    setPage(color.page)
                                }}
                            />
                        )
                    })}
                </View>
                <KeyboardAvoidingView className="flex-1" behavior="padding">
                    <ScrollView className="flex-1">
                        <TextInput
                            value={text}
                            onChangeText={handleTextChange}
                            multiline
                            textAlignVertical="top"
                            className="px-4 py-3 text-base text-zinc-100"
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    )
}
