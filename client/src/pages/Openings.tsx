import { useEffect, useState } from "react"
import { Footer } from "../components/Footer"
import { Header } from "../components/Header"
import { Heading } from "../components/Heading"
import { useAuth } from "../hooks/useAuth"
import { API_URL } from "../api"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"

type SignUpCardProps = {
    userId: string
    roleId: string
    serviceName: string
    roleName: string
    date: string
    onClose: () => void
    onSave: () => void
}

type OpeningsCardProp = {
    serviceName: string
    date: string
    time: string
    role: string
    roleId: string
    userId: string
    onSave: () => void
}

interface SignUp {
    roleId: string
    serviceName: string
    roleName: string
}

interface Service {
    id: string
    name: string
    date: string
    time: string
    status: string
}

interface Role {
    id: string
    serviceId: string
    name: string
    spotsTotal: number
    spotsFilled: number
}

export function Openings() {
    const [services, setServices] = useState<Service[] | null>(null)
    const [roles, setRoles] = useState<Role[] | null>(null)
    const [userId, setUserId] = useState("")
    const { token } = useAuth()

    useEffect(() => {
        async function fetchRoles() {
            const roles = await fetch(`${API_URL}/api/roles`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const rolesData = await roles.json()
            setRoles(rolesData)

            const services = await fetch(`${API_URL}/api/services`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const servicesData = await services.json()
            setServices(servicesData)
        }
        async function fetchUser() {
            const response = await fetch(`${API_URL}/api/users/id`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
            const data = await response.json()
            setUserId(data)
        }
        if (token) {
            void fetchUser()
        }
        void fetchRoles()
    }, [token])

    async function fetchRoles() {
        const roles = await fetch(`${API_URL}/api/roles`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const rolesData = await roles.json()
        setRoles(rolesData)

        const services = await fetch(`${API_URL}/api/services`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const servicesData = await services.json()
        setServices(servicesData)
    }

    return (
        <div className="mx-auto flex flex-col gap-13 p-4 py-5 sm:px-12">
            <Header variant="openings" />
            <div className="-mt-8">
                <Heading>Openings</Heading>
            </div>
            <div className="min-h-130">
                <div className="-mt-7 flex flex-wrap gap-2 sm:gap-4">
                    {roles?.map((role) => {
                        if (role.spotsFilled < role.spotsTotal) {
                            const service = services?.find(
                                (s) => s.id === role.serviceId && s.status == "Roles Open"
                            )
                            if (!service) return null

                            return (
                                <OpeningsCard
                                    key={role.id}
                                    serviceName={service.name}
                                    date={format(new Date(service.date), "d MMMM yyyy")}
                                    time={service.time}
                                    role={role.name}
                                    roleId={role.id}
                                    userId={userId}
                                    onSave={() => {
                                        void fetchRoles()
                                    }}
                                />
                            )
                        }
                    })}
                </div>
            </div>
            <Footer />
        </div>
    )
}

function SignUpCard({
    userId,
    roleId,
    serviceName,
    roleName,
    date,
    onClose,
    onSave
}: SignUpCardProps) {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleAssign(userId: string, roleId: string) {
        setError(null)
        setLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/assignments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    roleId,
                    status: "pending"
                })
            })

            const data = await response.json()
            if (!response.ok) {
                setError(data.message || "Sign Up failed!")
                return
            }

            if (onSave) onSave()
            else navigate("/openings")
        } catch {
            setError("Could not connect to server")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex w-85 flex-col gap-3 rounded-lg bg-slate-900 p-4.5 text-zinc-100 sm:w-110">
            <div className="pb-2.5">
                <Heading>Sign Up</Heading>
            </div>
            <hr className="-mx-4.5 h-0.5 border-0 bg-amber-400" />
            <div className="flex flex-col gap-1">
                <h3 className="mt-3.5 text-sm font-light text-zinc-100">Service</h3>
                <span className="w-full rounded border border-zinc-600 p-1 pl-2 text-left text-base">
                    {serviceName}
                </span>
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="text-sm font-light text-zinc-100">Role</h3>
                <span className="w-full rounded border border-zinc-600 p-1 pl-2 text-left text-base">
                    {roleName.length > 30 ? roleName.slice(0, 30) + "..." : roleName}
                </span>
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="text-sm font-light text-zinc-100">Date</h3>
                <span className="w-full rounded border border-zinc-600 p-1 pl-2 text-left text-base">
                    {date}
                </span>
            </div>
            {error && <p className="-mb-6.5 pl-1 text-sm text-red-600">{error}</p>}
            <div className="mt-10 flex justify-end gap-2">
                <button
                    onClick={() => (onClose ? onClose() : navigate("/openings"))}
                    className="rounded-lg bg-zinc-600 px-3 py-1.5 text-base text-zinc-200 hover:bg-zinc-700"
                >
                    Cancel
                </button>
                <button
                    onClick={() => handleAssign(userId, roleId)}
                    disabled={loading}
                    className="rounded-lg bg-amber-400 px-3 py-1.5 text-base text-slate-900 hover:bg-amber-500"
                >
                    {loading ? "Loading..." : "Sign Up"}
                </button>
            </div>
        </div>
    )
}

function OpeningsCard({ serviceName, date, time, role, roleId, userId, onSave }: OpeningsCardProp) {
    const [signUpData, setSignUpData] = useState<SignUp | null>(null)

    return (
        <div className="flex h-52 w-43 flex-col gap-3 rounded-lg bg-zinc-100 p-3 text-slate-900 select-none sm:w-55 sm:p-3.5">
            <h2 className="hidden font-semibold sm:block">{serviceName}</h2>
            <h2 className="font-semibold sm:hidden">
                {serviceName.length > 13 ? serviceName.slice(0, 11) + " ..." : serviceName}
            </h2>
            <div className="flex flex-col gap-1">
                <h2>{date}</h2>
                <h2>{time}</h2>
            </div>
            <h2 className="hidden font-semibold sm:block">
                {role.length > 17 ? role.slice(0, 17) + "..." : role}
            </h2>
            <h2 className="font-semibold sm:hidden">
                {role.length > 12 ? role.slice(0, 12) + "..." : role}
            </h2>
            <div className="mt-auto flex justify-center">
                <button
                    onClick={() =>
                        setSignUpData({
                            roleId,
                            serviceName,
                            roleName: role
                        })
                    }
                    className="mt-auto flex w-full justify-center rounded-lg bg-amber-400 px-2 py-1 text-sm font-medium text-blue-950 transition-colors hover:bg-amber-500"
                >
                    Sign Up
                </button>
            </div>
            {signUpData && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => setSignUpData(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-[90vh] overflow-y-auto"
                    >
                        <SignUpCard
                            userId={userId}
                            roleId={signUpData.roleId}
                            serviceName={signUpData.serviceName}
                            roleName={signUpData.roleName}
                            date={date}
                            onClose={() => {
                                setSignUpData(null)
                            }}
                            onSave={() => {
                                onSave()
                                setSignUpData(null)
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
