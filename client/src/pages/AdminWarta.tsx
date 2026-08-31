import { Header } from "../components/Header"
import { Sidebar } from "../components/Sidebar"
import { useEffect, useState } from "react"
import { Heading } from "../components/Heading"
import { API_URL } from "../api"

interface Service {
    id: string
    name: string
    date: string
    time: string
}

interface Renungan {
    title: string
    body: string
}

interface LaporanTambahan {
    from: string
    amount: number
}
interface LaporanPersembahan {
    umum: number
    gedung: string
    usinda: string
    tambahan?: LaporanTambahan[]
}

interface Ayat {
    verse: string
    text: string
}

export function AdminWarta() {
    const [services, setServices] = useState<Service[] | null>(null)
    const [chosenServices, setChosenService] = useState<Service[] | null>(null)
    const [renungan, setRenungan] = useState<Renungan | null>(null)
    const [laporanPersembahan, setLaporanPersembahan] = useState<LaporanPersembahan | null>(null)
    const [ayatHarian, setAyatHarian] = useState<Ayat | null>(null)
    const [doaSyafaat, setDoaSyafaat] = useState<string>("")

    useEffect(() => {
        async function fetchServices() {
            const response = await fetch(`${API_URL}/api/services`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            })
            const data: Service[] = await response.json()
            const sorted = data.sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            setServices(sorted)
        }
        void fetchServices()
    }, [])

    return (
        <div className="flex h-screen flex-col">
            <div className="px-6.5 py-4">
                <Header variant="admin" />
            </div>
            <div className="flex flex-1">
                <Sidebar variant="warta" />
                <div className="flex h-full w-full flex-col bg-zinc-100/2 px-10">
                    <div className="flex items-center justify-between py-7">
                        <Heading>Pembuat Warta</Heading>
                    </div>
                    <div></div>
                </div>
            </div>
        </div>
    )
}
