import { useSQLiteContext } from "expo-sqlite"

export function useNotes() {
    const db = useSQLiteContext()

    async function getNoteText(color: string): Promise<string> {
        const row = await db.getFirstAsync<{ text: string }>(
            "SELECT text FROM notes WHERE color = ?",
            [color]
        )
        return row?.text ?? ""
    }

    async function saveNoteText(color: string, text: string): Promise<void> {
        await db.runAsync("INSERT OR REPLACE INTO notes (color, text) VALUES (?, ?)", [color, text])
    }

    async function getAllPagesWithText(): Promise<string[]> {
        const rows = await db.getAllAsync<{ color: string }>(
            "SELECT color FROM notes WHERE text != ''"
        )
        return rows.map((row) => {
            return row.color
        })
    }

    return { getNoteText, saveNoteText, getAllPagesWithText }
}
