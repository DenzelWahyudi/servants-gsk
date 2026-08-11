import { useEffect, useState } from "react"
import { API_URL } from "../api"

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

export function UpcomingServices() {
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
        <section className="bg-white py-4">
            <h2 className="mb-3 text-center text-3xl font-semibold text-slate-900">
                Upcoming Services
            </h2>
            <div className="overflow-hidden rounded-lg border border-zinc-200 shadow-lg">
                <table className="w-full table-fixed text-left text-sm text-zinc-300">
                    <thead className="border-t-2 border-b-2 border-amber-400 text-zinc-950">
                        <tr>
                            <th className="w-[15%] py-2 pl-3">Upcoming Service</th>
                            <th className="w-[12%]">Date</th>
                            <th className="w-[10%]">Time</th>
                            <th className="w-[51%]">Roles Needed</th>
                            <th className="w-[12%] text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services?.map((s) => (
                            <tr key={s.id} className="border-b border-zinc-400 text-zinc-950">
                                <td className="py-3 pl-3 font-medium">{s.name}</td>
                                <td>
                                    {new Date(s.date).toLocaleDateString("en-GB", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })}
                                </td>
                                <td>{s.time}</td>
                                <td className="wrap-break-word">
                                    {s.roles?.map((r) => r.name).join(", ") ?? "..."}
                                </td>
                                <td className="text-center">
                                    <span
                                        className={`inline-block w-28 rounded px-3 py-0.5 text-center font-semibold ${
                                            s.status === "Roles Closed"
                                                ? "bg-red-200"
                                                : "bg-green-200"
                                        }`}
                                    >
                                        {s.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}
