export const WARTA_DRAFT_STORAGE_KEY = "admin-warta-draft"

export interface WartaService {
    id: string
    name: string
    date: string
    time: string
}

export interface WartaRenungan {
    title: string
    body: string
}

export interface WartaLaporanTambahan {
    from: string
    amount: number
}

export interface WartaLaporanPersembahan {
    umum: number
    gedung: string
    usinda: string
    tambahan?: WartaLaporanTambahan[]
}

export interface WartaAyat {
    verse: string
    text: string
}

export interface WartaDraft {
    services: WartaService[]
    coverServiceId: string
    preacherName: string
    renungan: WartaRenungan
    laporanPersembahan: WartaLaporanPersembahan
    ayatHarian: WartaAyat
    doaSyafaat: string
    generatedAt: string
}

export function readWartaDraft(): WartaDraft | null {
    try {
        const storedDraft = sessionStorage.getItem(WARTA_DRAFT_STORAGE_KEY)
        return storedDraft ? (JSON.parse(storedDraft) as WartaDraft) : null
    } catch {
        return null
    }
}
