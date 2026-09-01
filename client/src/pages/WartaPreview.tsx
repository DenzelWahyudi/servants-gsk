import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, Printer } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../api"
import gskLogo from "../assets/gsk-logo.png"
import { readWartaDraft, type WartaDraft, type WartaService } from "../warta"
import { WARTA_TEMPLATE } from "../wartaTemplate"
import "./WartaPreview.css"

interface AssignedRole {
    id: string
    name: string
    spotsTotal: number
    spotsFilled: number
    userNames: string[]
}

type RolesByService = Record<string, AssignedRole[]>

const PANEL_LABELS: Record<string, string> = {
    "outside-prayer": "Sisi luar — doa dan himbauan",
    "outside-schedule": "Sisi luar — jadwal kegiatan",
    "outside-cover": "Sisi luar — sampul",
    "inside-renungan": "Sisi dalam — renungan",
    "inside-services": "Sisi dalam — petugas pelayanan",
    "inside-offerings": "Sisi dalam — laporan persembahan"
}

export function WartaPreview() {
    const navigate = useNavigate()
    const [draft] = useState<WartaDraft | null>(() => readWartaDraft())
    const [rolesByService, setRolesByService] = useState<RolesByService>({})
    const [assignmentsLoading, setAssignmentsLoading] = useState(Boolean(draft))
    const [assignmentsError, setAssignmentsError] = useState<string | null>(null)
    const [overflowingPanels, setOverflowingPanels] = useState<string[]>([])
    const panelRefs = useRef<Record<string, HTMLElement | null>>({})

    useEffect(() => {
        if (!draft) return

        let isActive = true

        async function fetchAssignedRoles() {
            try {
                const entries = await Promise.all(
                    draft!.services.map(async (service) => {
                        const response = await fetch(
                            `${API_URL}/api/roles/assignedusersforroles/${service.id}`,
                            { headers: { "Content-Type": "application/json" } }
                        )

                        if (!response.ok) {
                            throw new Error("Failed to load service assignments")
                        }

                        const roles = (await response.json()) as AssignedRole[]
                        return [
                            service.id,
                            Array.isArray(roles)
                                ? roles.sort((a, b) => a.name.localeCompare(b.name))
                                : []
                        ] as const
                    })
                )

                if (isActive) setRolesByService(Object.fromEntries(entries))
            } catch {
                if (isActive) {
                    setAssignmentsError(
                        "Petugas pelayanan tidak dapat dimuat. Periksa koneksi lalu coba lagi."
                    )
                }
            } finally {
                if (isActive) setAssignmentsLoading(false)
            }
        }

        void fetchAssignedRoles()

        return () => {
            isActive = false
        }
    }, [draft])

    const measureOverflow = useCallback(() => {
        const overflowing = Object.entries(panelRefs.current)
            .filter(([, element]) => {
                if (!element) return false
                return (
                    element.scrollHeight > element.clientHeight + 1 ||
                    element.scrollWidth > element.clientWidth + 1
                )
            })
            .map(([panelId]) => panelId)
            .sort()

        setOverflowingPanels((current) =>
            current.join("|") === overflowing.join("|") ? current : overflowing
        )
        return overflowing
    }, [])

    useEffect(() => {
        let isActive = true
        let frame = window.requestAnimationFrame(measureOverflow)

        const scheduleMeasurement = () => {
            window.cancelAnimationFrame(frame)
            frame = window.requestAnimationFrame(measureOverflow)
        }

        window.addEventListener("resize", scheduleMeasurement)
        void document.fonts.ready.then(() => {
            if (isActive) scheduleMeasurement()
        })

        return () => {
            isActive = false
            window.cancelAnimationFrame(frame)
            window.removeEventListener("resize", scheduleMeasurement)
        }
    }, [assignmentsLoading, draft, measureOverflow, rolesByService])

    function registerPanel(panelId: string) {
        return (element: HTMLElement | null) => {
            panelRefs.current[panelId] = element
        }
    }

    function handlePrint() {
        const currentOverflow = measureOverflow()
        if (currentOverflow.length || assignmentsLoading || assignmentsError) return
        window.print()
    }

    if (!draft) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-900 p-6 text-zinc-100">
                <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-7 text-center shadow-xl">
                    <h1 className="text-2xl font-bold">Draft Warta Tidak Ditemukan</h1>
                    <p className="mt-3 text-sm text-zinc-400">
                        Isi formulir Warta terlebih dahulu sebelum membuka pratinjau.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/admin/warta")}
                        className="mt-6 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-500"
                    >
                        Kembali ke Formulir
                    </button>
                </div>
            </main>
        )
    }

    const coverService = draft.services.find((service) => service.id === draft.coverServiceId)
    const additionalOfferings = draft.laporanPersembahan.tambahan ?? []
    const totalOffering =
        draft.laporanPersembahan.umum +
        Number(draft.laporanPersembahan.gedung) +
        Number(draft.laporanPersembahan.usinda) +
        additionalOfferings.reduce((total, offering) => total + offering.amount, 0)
    const printBlocked =
        assignmentsLoading || Boolean(assignmentsError) || overflowingPanels.length > 0

    return (
        <main className="warta-preview">
            <header className="warta-preview-toolbar">
                <div>
                    <p className="warta-preview-eyebrow">Pratinjau cetak</p>
                    <h1>Warta F4 · Depan dan Belakang</h1>
                </div>
                <div className="warta-preview-actions">
                    <button type="button" onClick={() => navigate("/admin/warta")}>
                        <ArrowLeft size={17} />
                        Kembali Edit
                    </button>
                    <button
                        type="button"
                        className="warta-print-button"
                        disabled={printBlocked}
                        onClick={handlePrint}
                    >
                        <Printer size={17} />
                        Print / Simpan PDF
                    </button>
                </div>
            </header>

            <div className="warta-preview-status" role="status">
                {assignmentsLoading ? (
                    <p>Memuat petugas pelayanan sebelum memeriksa tata letak...</p>
                ) : assignmentsError ? (
                    <p className="warta-status-error">{assignmentsError}</p>
                ) : overflowingPanels.length > 0 ? (
                    <div className="warta-status-error">
                        <strong>Cetak diblokir karena konten melebihi panel:</strong>
                        <ul>
                            {overflowingPanels.map((panelId) => (
                                <li key={panelId}>{PANEL_LABELS[panelId]}</li>
                            ))}
                        </ul>
                        <span>Kembali ke formulir dan ringkas konten yang ditandai merah.</span>
                    </div>
                ) : (
                    <p className="warta-status-ready">
                        Tata letak aman untuk dicetak. Gunakan F4 landscape, dua sisi, dan flip pada
                        sisi pendek.
                    </p>
                )}
            </div>

            <div className="warta-preview-pages">
                <PreviewSheet label="Sisi luar · sampul berada di panel kanan">
                    <WartaPanel
                        id="outside-prayer"
                        className="warta-prayer-panel"
                        registerPanel={registerPanel}
                        isOverflowing={overflowingPanels.includes("outside-prayer")}
                    >
                        <PanelHeading>Doa Syafaat</PanelHeading>
                        <ol className="warta-prayer-list">
                            {toListItems(draft.doaSyafaat).map((item, index) => (
                                <li key={`${item}-${index}`}>{item}</li>
                            ))}
                        </ol>

                        <PanelHeading>Himbauan Ibadah</PanelHeading>
                        <ul className="warta-bullet-list">
                            {WARTA_TEMPLATE.reminders.map((reminder) => (
                                <li key={reminder}>{reminder}</li>
                            ))}
                        </ul>

                        <div className="warta-panel-bottom">
                            <PanelHeading>Pelayanan Doa</PanelHeading>
                            <p>{WARTA_TEMPLATE.prayerContact.intro}</p>
                            <p className="warta-contact">
                                {WARTA_TEMPLATE.prayerContact.phone}
                                <br />
                                {WARTA_TEMPLATE.prayerContact.pastor}
                            </p>
                        </div>
                    </WartaPanel>

                    <WartaPanel
                        id="outside-schedule"
                        registerPanel={registerPanel}
                        isOverflowing={overflowingPanels.includes("outside-schedule")}
                    >
                        <PanelHeading>Jadwal Kegiatan</PanelHeading>
                        <dl className="warta-schedule-list">
                            {WARTA_TEMPLATE.schedules.map((schedule) => (
                                <div key={schedule.name}>
                                    <dt>{schedule.name}</dt>
                                    <dd>{schedule.schedule}</dd>
                                </div>
                            ))}
                        </dl>
                        <p className="warta-greeting">{WARTA_TEMPLATE.greeting}</p>
                        <p className="warta-circulation">({WARTA_TEMPLATE.circulation})</p>
                    </WartaPanel>

                    <WartaPanel
                        id="outside-cover"
                        className="warta-cover-panel"
                        registerPanel={registerPanel}
                        isOverflowing={overflowingPanels.includes("outside-cover")}
                    >
                        <p className="warta-cover-kicker">W A R T A</p>
                        <img src={gskLogo} alt="Logo Gereja Sidang Kristus" />
                        <div className="warta-church-details">
                            <h2>{WARTA_TEMPLATE.church.name}</h2>
                            <p>{WARTA_TEMPLATE.church.registration}</p>
                            <p>{WARTA_TEMPLATE.church.decree}</p>
                            <strong>{WARTA_TEMPLATE.church.location}</strong>
                            <p>{WARTA_TEMPLATE.church.address}</p>
                            <p>{WARTA_TEMPLATE.church.phone}</p>
                            <p>{WARTA_TEMPLATE.church.email}</p>
                        </div>
                        <div className="warta-cover-service">
                            <p>{coverService ? formatLongDate(coverService.date) : ""}</p>
                            <h3>{draft.renungan.title}</h3>
                            <strong>{draft.ayatHarian.verse}</strong>
                            <p>{draft.preacherName}</p>
                        </div>
                        <p className="warta-welcome">
                            Selamat datang bagi Jemaat yang baru pertama kali beribadah besama kami,
                            kami menyambut kehadiran Bpk/Ibu/Sdra/Sdri. Dengan sukacita, kiranya
                            kasih dan berkat Allah Tritunggal memimpin hidup kita
                        </p>
                    </WartaPanel>
                </PreviewSheet>

                <PreviewSheet label="Sisi dalam · dibaca setelah lipatan dibuka">
                    <WartaPanel
                        id="inside-renungan"
                        registerPanel={registerPanel}
                        isOverflowing={overflowingPanels.includes("inside-renungan")}
                    >
                        <PanelHeading>Renungan</PanelHeading>
                        <h3 className="warta-renungan-title">{draft.renungan.title}</h3>
                        <div className="warta-renungan-body">
                            {toParagraphs(draft.renungan.body).map((paragraph, index) => (
                                <p key={`${paragraph}-${index}`}>{paragraph}</p>
                            ))}
                        </div>
                    </WartaPanel>

                    <WartaPanel
                        id="inside-services"
                        registerPanel={registerPanel}
                        isOverflowing={overflowingPanels.includes("inside-services")}
                    >
                        <PanelHeading>Petugas Pelayanan</PanelHeading>
                        <div className="warta-services-list">
                            {draft.services.map((service) => (
                                <ServiceRoster
                                    key={service.id}
                                    service={service}
                                    roles={rolesByService[service.id] ?? []}
                                    preacherName={
                                        service.id === draft.coverServiceId
                                            ? draft.preacherName
                                            : undefined
                                    }
                                />
                            ))}
                        </div>
                    </WartaPanel>

                    <WartaPanel
                        id="inside-offerings"
                        registerPanel={registerPanel}
                        isOverflowing={overflowingPanels.includes("inside-offerings")}
                    >
                        <p className="warta-wordmark">W A R T A</p>
                        <PanelHeading>Laporan Persembahan</PanelHeading>
                        <table className="warta-offering-table">
                            <tbody>
                                <OfferingRow
                                    label="P. Umum"
                                    amount={draft.laporanPersembahan.umum}
                                />
                                <OfferingRow
                                    label="P. P. Gedung"
                                    amount={Number(draft.laporanPersembahan.gedung)}
                                />
                                <OfferingRow
                                    label="P. USINDA"
                                    amount={Number(draft.laporanPersembahan.usinda)}
                                />
                                {additionalOfferings.map((offering, index) => (
                                    <OfferingRow
                                        key={`${offering.from}-${index}`}
                                        label={offering.from}
                                        amount={offering.amount}
                                    />
                                ))}
                                <OfferingRow label="Jumlah" amount={totalOffering} isTotal />
                            </tbody>
                        </table>

                        <div className="warta-bank-list">
                            {WARTA_TEMPLATE.bankAccounts.map((bank) => (
                                <div key={bank.account}>
                                    <p>{bank.purpose}</p>
                                    <strong>{bank.account}</strong>
                                </div>
                            ))}
                        </div>

                        <blockquote className="warta-verse-card">
                            <p>“{draft.ayatHarian.text}”</p>
                            <cite>{draft.ayatHarian.verse}</cite>
                        </blockquote>
                    </WartaPanel>
                </PreviewSheet>
            </div>
        </main>
    )
}

function PreviewSheet({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <section className="warta-sheet-group">
            <p className="warta-side-label">{label}</p>
            <div className="warta-sheet-frame">
                <div className="warta-sheet">{children}</div>
            </div>
        </section>
    )
}

function WartaPanel({
    id,
    className = "",
    registerPanel,
    isOverflowing,
    children
}: {
    id: string
    className?: string
    registerPanel: (panelId: string) => (element: HTMLElement | null) => void
    isOverflowing: boolean
    children: React.ReactNode
}) {
    return (
        <article
            ref={registerPanel(id)}
            className={`warta-panel ${className} ${isOverflowing ? "warta-panel-overflow" : ""}`}
        >
            {isOverflowing && <span className="warta-overflow-badge">Konten berlebih</span>}
            {children}
        </article>
    )
}

function PanelHeading({ children }: { children: React.ReactNode }) {
    return <h2 className="warta-panel-heading">{children}</h2>
}

function ServiceRoster({
    service,
    roles,
    preacherName
}: {
    service: WartaService
    roles: AssignedRole[]
    preacherName?: string
}) {
    const hasPreacherRole = roles.some((role) => /pengkhotbah/i.test(role.name))

    return (
        <section className="warta-service-roster">
            <h3>
                {service.name} <span>{formatLongDate(service.date)}</span>
            </h3>
            <dl>
                {preacherName && !hasPreacherRole && (
                    <div>
                        <dt>Pengkhotbah</dt>
                        <dd>{preacherName}</dd>
                    </div>
                )}
                {roles.map((role) => (
                    <div key={role.id}>
                        <dt>{role.name}</dt>
                        <dd>
                            {preacherName && /pengkhotbah/i.test(role.name)
                                ? preacherName
                                : role.userNames.length
                                  ? role.userNames.join(", ")
                                  : "—"}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    )
}

function OfferingRow({
    label,
    amount,
    isTotal = false
}: {
    label: string
    amount: number
    isTotal?: boolean
}) {
    return (
        <tr className={isTotal ? "warta-offering-total" : ""}>
            <td>{label}</td>
            <td>Rp</td>
            <td>{formatAmount(amount)}</td>
        </tr>
    )
}

function formatLongDate(date: string) {
    return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
    }).format(new Date(date))
}

function formatAmount(amount: number) {
    return amount.toLocaleString("en-US")
}

function toListItems(value: string) {
    return value
        .split(/\r?\n/)
        .map((item) => item.replace(/^\s*(?:[-•]|\d+[.)])\s*/, "").trim())
        .filter(Boolean)
}

function toParagraphs(value: string) {
    return value
        .split(/\n\s*\n|\r?\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
}
