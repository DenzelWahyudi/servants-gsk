import { Header } from "../components/Header"
import { Sidebar } from "../components/Sidebar"
import { useEffect, useState } from "react"
import { Heading } from "../components/Heading"
import { API_URL } from "../api"
import { Check, Plus, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
    WARTA_DRAFT_STORAGE_KEY,
    readWartaDraft,
    type WartaAyat as Ayat,
    type WartaDraft,
    type WartaLaporanPersembahan as LaporanPersembahan,
    type WartaLaporanTambahan as LaporanTambahan,
    type WartaRenungan as Renungan,
    type WartaService as Service
} from "../warta"

type ValidationField =
    "services" | "coverService" | "preacher" | "renungan" | "laporan" | "ayat" | "doa"

type ValidationErrors = Partial<Record<ValidationField, string>>

export function AdminWarta() {
    const navigate = useNavigate()
    const [savedDraft] = useState(() => readWartaDraft())
    const [services, setServices] = useState<Service[] | null>(null)
    const [chosenServices, setChosenService] = useState<Service[] | null>(
        savedDraft?.services ?? null
    )
    const [coverServiceId, setCoverServiceId] = useState(savedDraft?.coverServiceId ?? "")
    const [preacherName, setPreacherName] = useState(savedDraft?.preacherName ?? "")
    const [renungan, setRenungan] = useState<Renungan | null>(savedDraft?.renungan ?? null)
    const [laporanPersembahan, setLaporanPersembahan] = useState<LaporanPersembahan | null>(
        savedDraft?.laporanPersembahan ?? null
    )
    const [ayatHarian, setAyatHarian] = useState<Ayat | null>(savedDraft?.ayatHarian ?? null)
    const [doaSyafaat, setDoaSyafaat] = useState(savedDraft?.doaSyafaat ?? "")
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

    useEffect(() => {
        async function fetchServices() {
            try {
                const response = await fetch(`${API_URL}/api/services`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                })
                const data: Service[] = await response.json()
                const sorted = Array.isArray(data)
                    ? data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    : []
                setServices(sorted)
            } catch {
                setServices([])
            }
        }
        void fetchServices()
    }, [])

    function toggleService(service: Service) {
        const isSelected = chosenServices?.some((item) => item.id === service.id)

        if (isSelected && coverServiceId === service.id) {
            setCoverServiceId("")
        }

        setChosenService((current) => {
            const selectedServices = current ?? []
            const serviceIsSelected = selectedServices.some((item) => item.id === service.id)

            return serviceIsSelected
                ? selectedServices.filter((item) => item.id !== service.id)
                : [...selectedServices, service]
        })
        clearValidationError("services")
    }

    function chooseCoverService(serviceId: string) {
        setCoverServiceId(serviceId)
        clearValidationError("coverService")

        const service = services?.find((item) => item.id === serviceId)
        if (!service) return

        setChosenService((current) => {
            const selectedServices = current ?? []
            return selectedServices.some((item) => item.id === service.id)
                ? selectedServices
                : [...selectedServices, service]
        })
        clearValidationError("services")
    }

    function updateRenungan(field: keyof Renungan, value: string) {
        setRenungan((current) => ({
            ...(current ?? { title: "", body: "" }),
            [field]: value
        }))
        clearValidationError("renungan")
    }

    function updateLaporan(field: "umum" | "gedung" | "usinda", value: string) {
        const amount = value.replace(/\D/g, "")

        setLaporanPersembahan((current) => ({
            ...(current ?? { umum: 0, gedung: "", usinda: "" }),
            [field]: field === "umum" ? Number(amount) : amount
        }))
        clearValidationError("laporan")
    }

    function addLaporanTambahan() {
        setLaporanPersembahan((current) => {
            const laporan = current ?? { umum: 0, gedung: "", usinda: "" }
            return {
                ...laporan,
                tambahan: [...(laporan.tambahan ?? []), { from: "", amount: 0 }]
            }
        })
        clearValidationError("laporan")
    }

    function updateLaporanTambahan(index: number, field: keyof LaporanTambahan, value: string) {
        setLaporanPersembahan((current) => {
            const laporan = current ?? { umum: 0, gedung: "", usinda: "" }
            const tambahan = [...(laporan.tambahan ?? [])]
            tambahan[index] = {
                ...tambahan[index],
                [field]: field === "amount" ? Number(value.replace(/\D/g, "")) : value
            }
            return { ...laporan, tambahan }
        })
        clearValidationError("laporan")
    }

    function removeLaporanTambahan(index: number) {
        setLaporanPersembahan((current) => {
            if (!current) return current
            return {
                ...current,
                tambahan: current.tambahan?.filter((_, itemIndex) => itemIndex !== index)
            }
        })
        clearValidationError("laporan")
    }

    function updateAyat(field: keyof Ayat, value: string) {
        setAyatHarian((current) => ({
            ...(current ?? { verse: "", text: "" }),
            [field]: value
        }))
        clearValidationError("ayat")
    }

    function formatServiceDate(date: string) {
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC"
        }).format(new Date(date))
    }

    function formatAmount(value: number | string | undefined) {
        if (value === undefined || value === "" || Number(value) === 0) return ""

        return Number(value).toLocaleString("en-US")
    }

    function clearValidationError(field: ValidationField) {
        setValidationErrors((current) => {
            if (!current[field]) return current

            const nextErrors = { ...current }
            delete nextErrors[field]
            return nextErrors
        })
    }

    function validateWarta() {
        const errors: ValidationErrors = {}

        if (!chosenServices?.length) {
            errors.services = "Pilih setidaknya satu pelayanan."
        }

        if (!coverServiceId || !chosenServices?.some((service) => service.id === coverServiceId)) {
            errors.coverService = "Pilih pelayanan yang akan digunakan sebagai tanggal sampul."
        }

        if (!preacherName.trim()) {
            errors.preacher = "Nama pengkhotbah wajib diisi."
        }

        if (!renungan?.title.trim() || !renungan.body.trim()) {
            errors.renungan = "Judul dan isi renungan wajib diisi."
        }

        const hasIncompleteAdditionalOffering = laporanPersembahan?.tambahan?.some(
            (item) => !item.from.trim() || item.amount <= 0
        )
        if (
            !laporanPersembahan ||
            laporanPersembahan.umum <= 0 ||
            !laporanPersembahan.gedung ||
            !laporanPersembahan.usinda ||
            hasIncompleteAdditionalOffering
        ) {
            errors.laporan = "Semua jumlah persembahan dan setiap baris tambahan wajib dilengkapi."
        }

        if (!ayatHarian?.verse.trim() || !ayatHarian.text.trim()) {
            errors.ayat = "Referensi dan isi ayat wajib diisi."
        }

        if (!doaSyafaat.trim()) {
            errors.doa = "Pokok doa syafaat wajib diisi."
        }

        return errors
    }

    function handleGenerate() {
        const errors = validateWarta()
        setValidationErrors(errors)

        if (Object.keys(errors).length > 0) {
            window.requestAnimationFrame(() => {
                document
                    .querySelector<HTMLElement>("[data-warta-error='true']")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
            })
            return
        }

        if (!chosenServices || !renungan || !laporanPersembahan || !ayatHarian) return

        const draft: WartaDraft = {
            services: chosenServices,
            coverServiceId,
            preacherName: preacherName.trim(),
            renungan,
            laporanPersembahan,
            ayatHarian,
            doaSyafaat: doaSyafaat.trim(),
            generatedAt: new Date().toISOString()
        }

        sessionStorage.setItem(WARTA_DRAFT_STORAGE_KEY, JSON.stringify(draft))
        navigate("/admin/warta/preview")
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <div className="px-6.5 py-4">
                <Header variant="admin" />
            </div>
            <div className="flex min-h-0 flex-1">
                <Sidebar variant="warta" />
                <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-zinc-100/2 px-6 pb-10 lg:px-10">
                    <div className="flex items-center justify-between py-7">
                        <Heading>Pembuat Warta</Heading>
                    </div>
                    <div className="flex w-full max-w-7xl flex-col gap-5">
                        <section
                            data-warta-error={Boolean(validationErrors.services)}
                            className={`rounded-xl border bg-slate-800 p-5 shadow-lg shadow-slate-950/20 ${validationErrors.services ? "border-red-400" : "border-slate-700"}`}
                        >
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-zinc-100">
                                        Pilih Pelayanan
                                    </h2>
                                    <p className="mt-1 text-sm text-zinc-400">
                                        Pilih satu atau beberapa pelayanan untuk warta ini.
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-medium text-amber-400">
                                    {chosenServices?.length ?? 0} dipilih
                                </span>
                            </div>

                            {services === null ? (
                                <div className="rounded-lg border border-dashed border-slate-600 py-8 text-center text-sm text-zinc-400">
                                    Memuat pelayanan...
                                </div>
                            ) : services.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-600 py-8 text-center text-sm text-zinc-400">
                                    Belum ada pelayanan yang tersedia.
                                </div>
                            ) : (
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {services.map((service) => {
                                        const isSelected = chosenServices?.some(
                                            (item) => item.id === service.id
                                        )

                                        return (
                                            <button
                                                key={service.id}
                                                type="button"
                                                aria-pressed={isSelected}
                                                onClick={() => toggleService(service)}
                                                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                                                    isSelected
                                                        ? "border-amber-400 bg-amber-400/10"
                                                        : "border-slate-600 bg-slate-700/60 hover:border-slate-500"
                                                }`}
                                            >
                                                <span
                                                    className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                                                        isSelected
                                                            ? "border-amber-400 bg-amber-400 text-slate-950"
                                                            : "border-slate-500"
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <Check size={14} strokeWidth={3} />
                                                    )}
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block truncate text-sm font-semibold text-zinc-100">
                                                        {service.name}
                                                    </span>
                                                    <span className="mt-0.5 block text-xs text-zinc-400">
                                                        {formatServiceDate(service.date)} ·{" "}
                                                        {service.time}
                                                    </span>
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                            <ValidationMessage message={validationErrors.services} />
                        </section>

                        <section
                            data-warta-error={Boolean(
                                validationErrors.coverService || validationErrors.preacher
                            )}
                            className={`rounded-xl border bg-slate-800 p-5 shadow-lg shadow-slate-950/20 ${validationErrors.coverService || validationErrors.preacher ? "border-red-400" : "border-slate-700"}`}
                        >
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold text-zinc-100">
                                    Detail Sampul
                                </h2>
                                <p className="mt-1 text-sm text-zinc-400">
                                    Pelayanan terpilih menentukan tanggal sampul dan otomatis masuk
                                    ke daftar pelayanan.
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
                                    Pelayanan untuk sampul
                                    <select
                                        value={coverServiceId}
                                        onChange={(event) => chooseCoverService(event.target.value)}
                                        className={`rounded-lg border bg-slate-700 px-3 py-2.5 text-zinc-100 transition-colors outline-none focus:border-amber-400 ${validationErrors.coverService ? "border-red-400" : "border-slate-600"}`}
                                    >
                                        <option value="">Pilih pelayanan</option>
                                        {services?.map((service) => (
                                            <option key={service.id} value={service.id}>
                                                {service.name} · {formatServiceDate(service.date)}
                                            </option>
                                        ))}
                                    </select>
                                    <ValidationMessage message={validationErrors.coverService} />
                                </label>
                                <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
                                    Nama pengkhotbah
                                    <input
                                        type="text"
                                        value={preacherName}
                                        onChange={(event) => {
                                            setPreacherName(event.target.value)
                                            clearValidationError("preacher")
                                        }}
                                        placeholder="Contoh: Pdt. Jhonny S. Wihu, M.Th."
                                        className={`rounded-lg border bg-slate-700 px-3 py-2.5 text-zinc-100 transition-colors outline-none placeholder:text-zinc-500 focus:border-amber-400 ${validationErrors.preacher ? "border-red-400" : "border-slate-600"}`}
                                    />
                                    <ValidationMessage message={validationErrors.preacher} />
                                </label>
                            </div>
                        </section>

                        <div className="grid items-start gap-5 xl:grid-cols-2">
                            <div className="flex flex-col gap-5">
                                <section
                                    data-warta-error={Boolean(validationErrors.renungan)}
                                    className={`rounded-xl border bg-slate-800 p-5 shadow-lg shadow-slate-950/20 ${validationErrors.renungan ? "border-red-400" : "border-slate-700"}`}
                                >
                                    <div className="mb-4">
                                        <h2 className="text-lg font-semibold text-zinc-100">
                                            Renungan
                                        </h2>
                                        <p className="mt-1 text-sm text-zinc-400">
                                            Tuliskan judul dan isi renungan untuk jemaat.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
                                            Judul renungan
                                            <input
                                                type="text"
                                                value={renungan?.title ?? ""}
                                                onChange={(event) =>
                                                    updateRenungan("title", event.target.value)
                                                }
                                                placeholder="Masukkan judul renungan"
                                                className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-zinc-100 transition-colors outline-none placeholder:text-zinc-500 focus:border-amber-400"
                                            />
                                        </label>
                                        <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
                                            Isi renungan
                                            <textarea
                                                value={renungan?.body ?? ""}
                                                onChange={(event) =>
                                                    updateRenungan("body", event.target.value)
                                                }
                                                placeholder="Tuliskan isi renungan..."
                                                rows={8}
                                                className="resize-y rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-zinc-100 transition-colors outline-none placeholder:text-zinc-500 focus:border-amber-400"
                                            />
                                        </label>
                                    </div>
                                    <ValidationMessage message={validationErrors.renungan} />
                                </section>

                                <section
                                    data-warta-error={Boolean(validationErrors.ayat)}
                                    className={`rounded-xl border bg-slate-800 p-5 shadow-lg shadow-slate-950/20 ${validationErrors.ayat ? "border-red-400" : "border-slate-700"}`}
                                >
                                    <div className="mb-4">
                                        <h2 className="text-lg font-semibold text-zinc-100">
                                            Ayat
                                        </h2>
                                        <p className="mt-1 text-sm text-zinc-400">
                                            Tambahkan referensi dan isi ayat pilihan.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
                                            Referensi ayat
                                            <input
                                                type="text"
                                                value={ayatHarian?.verse ?? ""}
                                                onChange={(event) =>
                                                    updateAyat("verse", event.target.value)
                                                }
                                                placeholder="Contoh: Mazmur 23:1"
                                                className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-zinc-100 transition-colors outline-none placeholder:text-zinc-500 focus:border-amber-400"
                                            />
                                        </label>
                                        <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
                                            Isi ayat
                                            <textarea
                                                value={ayatHarian?.text ?? ""}
                                                onChange={(event) =>
                                                    updateAyat("text", event.target.value)
                                                }
                                                placeholder="Tuliskan isi ayat..."
                                                rows={4}
                                                className="resize-y rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-zinc-100 transition-colors outline-none placeholder:text-zinc-500 focus:border-amber-400"
                                            />
                                        </label>
                                    </div>
                                    <ValidationMessage message={validationErrors.ayat} />
                                </section>
                            </div>

                            <div className="flex flex-col gap-5">
                                <section
                                    data-warta-error={Boolean(validationErrors.laporan)}
                                    className={`rounded-xl border bg-slate-800 p-5 shadow-lg shadow-slate-950/20 ${validationErrors.laporan ? "border-red-400" : "border-slate-700"}`}
                                >
                                    <div className="mb-4">
                                        <h2 className="text-lg font-semibold text-zinc-100">
                                            Laporan Persembahan
                                        </h2>
                                        <p className="mt-1 text-sm text-zinc-400">
                                            Catat persembahan utama dan sumber tambahan.
                                        </p>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
                                            Umum
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={formatAmount(laporanPersembahan?.umum)}
                                                onChange={(event) =>
                                                    updateLaporan("umum", event.target.value)
                                                }
                                                placeholder="0"
                                                className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-zinc-100 transition-colors outline-none placeholder:text-zinc-500 focus:border-amber-400"
                                            />
                                        </label>
                                        <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
                                            Gedung
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={formatAmount(laporanPersembahan?.gedung)}
                                                onChange={(event) =>
                                                    updateLaporan("gedung", event.target.value)
                                                }
                                                placeholder="0"
                                                className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-zinc-100 transition-colors outline-none placeholder:text-zinc-500 focus:border-amber-400"
                                            />
                                        </label>
                                        <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
                                            Usinda
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={formatAmount(laporanPersembahan?.usinda)}
                                                onChange={(event) =>
                                                    updateLaporan("usinda", event.target.value)
                                                }
                                                placeholder="0"
                                                className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-zinc-100 transition-colors outline-none placeholder:text-zinc-500 focus:border-amber-400"
                                            />
                                        </label>
                                    </div>

                                    <div className="mt-5 border-t border-slate-700 pt-5">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <h3 className="text-sm font-medium text-zinc-200">
                                                Persembahan tambahan
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={addLaporanTambahan}
                                                className="flex items-center gap-1 rounded-lg border border-amber-400 px-2.5 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-400 hover:text-slate-950"
                                            >
                                                <Plus size={14} />
                                                Tambah
                                            </button>
                                        </div>

                                        {!laporanPersembahan?.tambahan?.length ? (
                                            <p className="rounded-lg border border-dashed border-slate-600 py-4 text-center text-xs text-zinc-500">
                                                Belum ada persembahan tambahan.
                                            </p>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                {laporanPersembahan.tambahan.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-end gap-3"
                                                    >
                                                        <label className="flex flex-1 flex-col gap-1.5 text-xs text-zinc-400">
                                                            Sumber
                                                            <input
                                                                type="text"
                                                                value={item.from}
                                                                onChange={(event) =>
                                                                    updateLaporanTambahan(
                                                                        index,
                                                                        "from",
                                                                        event.target.value
                                                                    )
                                                                }
                                                                placeholder="Nama sumber"
                                                                className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-sm text-zinc-100 transition-colors outline-none placeholder:text-zinc-500 focus:border-amber-400"
                                                            />
                                                        </label>
                                                        <label className="flex flex-1 flex-col gap-1.5 text-xs text-zinc-400">
                                                            Jumlah
                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                value={formatAmount(item.amount)}
                                                                onChange={(event) =>
                                                                    updateLaporanTambahan(
                                                                        index,
                                                                        "amount",
                                                                        event.target.value
                                                                    )
                                                                }
                                                                placeholder="0"
                                                                className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-sm text-zinc-100 transition-colors outline-none placeholder:text-zinc-500 focus:border-amber-400"
                                                            />
                                                        </label>
                                                        <button
                                                            type="button"
                                                            aria-label={`Hapus persembahan tambahan ${index + 1}`}
                                                            onClick={() =>
                                                                removeLaporanTambahan(index)
                                                            }
                                                            className="mb-0.5 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-400/10 hover:text-red-400"
                                                        >
                                                            <Trash2 size={17} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <ValidationMessage message={validationErrors.laporan} />
                                </section>

                                <section
                                    data-warta-error={Boolean(validationErrors.doa)}
                                    className={`rounded-xl border bg-slate-800 p-5 shadow-lg shadow-slate-950/20 ${validationErrors.doa ? "border-red-400" : "border-slate-700"}`}
                                >
                                    <div className="mb-4">
                                        <h2 className="text-lg font-semibold text-zinc-100">
                                            Doa Syafaat
                                        </h2>
                                        <p className="mt-1 text-sm text-zinc-400">
                                            Tuliskan pokok-pokok doa syafaat.
                                        </p>
                                    </div>
                                    <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
                                        Pokok doa
                                        <textarea
                                            value={doaSyafaat}
                                            onChange={(event) => {
                                                setDoaSyafaat(event.target.value)
                                                clearValidationError("doa")
                                            }}
                                            placeholder="Tuliskan pokok doa syafaat..."
                                            rows={7}
                                            className="resize-y rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-zinc-100 transition-colors outline-none placeholder:text-zinc-500 focus:border-amber-400"
                                        />
                                    </label>
                                    <ValidationMessage message={validationErrors.doa} />
                                </section>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse items-end justify-between gap-3 sm:flex-row sm:items-center">
                            <p className="text-xs text-zinc-500">
                                Draft disimpan saat membuka pratinjau dan dipulihkan ketika kembali.
                            </p>
                            <button
                                type="button"
                                onClick={handleGenerate}
                                className="w-full rounded-lg bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-500 sm:w-auto"
                            >
                                Generate Warta
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

function ValidationMessage({ message }: { message?: string }) {
    if (!message) return null

    return (
        <p role="alert" className="mt-2 text-xs text-red-400">
            {message}
        </p>
    )
}
