import { useEffect, useState } from "react"
import { API_URL } from "../api"
import { format } from "date-fns"

interface Role {
    id: string
    serviceId: string
    name: string
}

interface Service {
    id: string
    name: string
    date: string
    time: string
    status: string
    roles?: Role[]
}

export function UpcomingServicesMobile() {
    const [services, setServices] = useState<Service[] | null>(null)

    useEffect(() => {
        async function fetchServices() {
            const response = await fetch(`${API_URL}/api/services/with-roles`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const data: Service[] = await response.json()
            setServices(data)
        }
        void fetchServices()
    }, [])

    return (
        <section className="pb-4">
            <h2 className="pt-5 pb-2 pl-4 text-start text-xl font-semibold text-slate-900">
                Upcoming Services
            </h2>
            <div className="flex flex-col gap-3">
                {services?.map((s) => (
                    <div
                        key={s.id}
                        className="mx-4 flex flex-col gap-1 rounded-lg border border-zinc-200 p-4 shadow-lg"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold text-zinc-950">{s.name}</h3>
                                <h3 className="text-zinc-950">
                                    {format(new Date(s.date), "d MMMM yyyy")}
                                </h3>
                            </div>
                            <span className="text-zinc-950">{s.time}</span>
                        </div>
                        <div className="py-1">
                            <hr className="text-zinc-400" />
                        </div>
                        {s.roles?.map((r) => (
                            <span key={r.id} className="max-w-80 wrap-break-word text-zinc-950">
                                {r.name}
                            </span>
                        ))}
                        <span
                            className={`-mt-7 text-end ${
                                s.status === "Roles Closed" ? "text-red-600" : "text-green-600"
                            }`}
                        >
                            {s.status}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    )
}
