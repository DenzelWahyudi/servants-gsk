import { useState, type ComponentProps } from "react"
import logo from "../assets/logo.png"
import { Button } from "./Button"
import { ButtonLink } from "./ButtonLink"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

type Variant =
    | "home"
    | "schedule"
    | "openings"
    | "chats"
    | "register"
    | "login"
    | "registeradmin"
    | "loginadmin"
    | "admin"

type HeaderProps = {
    variant?: Variant
} & ComponentProps<"header">

export function Header({ variant = "home", ...props }: HeaderProps) {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [loading, setLoading] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    async function handleLogout() {
        setLoading(true)

        try {
            logout()
            navigate("/login")
        } finally {
            setLoading(false)
        }
    }

    async function handleLogoutAdmin() {
        setLoading(true)

        try {
            logout()
            navigate("/admin/login")
        } finally {
            setLoading(false)
        }
    }

    return (
        <header
            {...props}
            className="relative flex w-full items-center justify-between select-none"
        >
            <div className="flex items-center gap-3">
                <img src={logo} alt="Servants Logo" className="h-10 w-7.5" />
                <h1 className="text-2xl font-bold">Servants</h1>
            </div>
            <div className="hidden sm:flex">
                {getVariantStyles(variant, handleLogout, handleLogoutAdmin, loading)}
            </div>

            {/* mobile view */}
            <button
                className="flex flex-col gap-1.5 rounded-lg p-2 hover:bg-amber-400/70 sm:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <span className="block h-0.5 w-6 bg-white" />
                <span className="block h-0.5 w-6 bg-white" />
                <span className="block h-0.5 w-6 bg-white" />
            </button>

            {menuOpen && (
                <div
                    className="absolute top-full right-0 z-50 mt-2 flex min-w-37 flex-col rounded-lg border border-amber-400 bg-slate-900/80 p-4 md:hidden"
                    onClick={() => setMenuOpen(false)}
                >
                    {getVariantStyles(variant, handleLogout, handleLogoutAdmin, loading, true)}
                </div>
            )}
        </header>
    )
}

function getVariantStyles(
    variant: Variant,
    onLogout: () => void,
    onLogoutAdmin: () => void,
    isLoading: boolean,
    isMobile: boolean = false
) {
    const wrapperClass = isMobile
        ? "cursor-pointer flex flex-col gap-5 items-start"
        : "flex gap-4 items-center"
    switch (variant) {
        case "home":
            return (
                <div className={wrapperClass}>
                    <Button variant="secondary">Home</Button>
                    <ButtonLink to="/schedule" variant="secondary">
                        Schedule
                    </ButtonLink>
                    <ButtonLink to="/openings" variant="secondary">
                        Openings
                    </ButtonLink>
                    <ButtonLink to="/chats" variant="secondary">
                        Chats
                    </ButtonLink>
                    <button
                        onClick={onLogout}
                        disabled={isLoading}
                        className={
                            isMobile
                                ? `ml-2 rounded border border-zinc-100 px-2 py-0.5 font-medium text-red-400 hover:bg-red-800/90 disabled:cursor-not-allowed disabled:opacity-30`
                                : `rounded-lg border border-amber-400 bg-slate-900 px-4 py-1.5 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-30`
                        }
                    >
                        {isLoading ? "Logging out..." : "Logout"}
                    </button>
                </div>
            )
        case "schedule":
            return (
                <div className={wrapperClass}>
                    <ButtonLink to="/home" variant="secondary">
                        Home
                    </ButtonLink>
                    <Button variant="secondary">Schedule</Button>
                    <ButtonLink to="/openings" variant="secondary">
                        Openings
                    </ButtonLink>
                    <ButtonLink to="/chats" variant="secondary">
                        Chats
                    </ButtonLink>
                    <button
                        onClick={onLogout}
                        disabled={isLoading}
                        className="rounded-lg border border-amber-400 bg-slate-900 px-4 py-1.5 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        {isLoading ? "Logging out..." : "Logout"}
                    </button>
                </div>
            )
        case "openings":
            return (
                <div className={wrapperClass}>
                    <ButtonLink to="/home" variant="secondary">
                        Home
                    </ButtonLink>
                    <ButtonLink to="/schedule" variant="secondary">
                        Schedule
                    </ButtonLink>
                    <Button variant="secondary">Openings</Button>
                    <ButtonLink to="/chats" variant="secondary">
                        Chats
                    </ButtonLink>
                    <button
                        onClick={onLogout}
                        disabled={isLoading}
                        className="rounded-lg border border-amber-400 bg-slate-900 px-4 py-1.5 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        {isLoading ? "Logging out..." : "Logout"}
                    </button>
                </div>
            )
        case "chats":
            return (
                <div className={wrapperClass}>
                    <ButtonLink to="/home" variant="secondary">
                        Home
                    </ButtonLink>
                    <ButtonLink to="/schedule" variant="secondary">
                        Schedule
                    </ButtonLink>
                    <ButtonLink to="/openings" variant="secondary">
                        Openings
                    </ButtonLink>
                    <Button variant="secondary">Chats</Button>
                    <button
                        onClick={onLogout}
                        disabled={isLoading}
                        className="rounded-lg border border-amber-400 bg-slate-900 px-4 py-1.5 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        {isLoading ? "Logging out..." : "Logout"}
                    </button>
                </div>
            )
        case "register":
            return (
                <div className={wrapperClass}>
                    <ButtonLink to="/login" variant="primary">
                        Login
                    </ButtonLink>
                </div>
            )
        case "login":
            return (
                <div className={wrapperClass}>
                    <ButtonLink to="/register" variant="primary">
                        Register
                    </ButtonLink>
                </div>
            )
        case "registeradmin":
            return (
                <div className={wrapperClass}>
                    <ButtonLink to="/admin/login" variant="primary">
                        Login
                    </ButtonLink>
                </div>
            )
        case "loginadmin":
            return (
                <div className={wrapperClass}>
                    <ButtonLink to="/admin/register" variant="primary">
                        Register
                    </ButtonLink>
                </div>
            )
        case "admin":
            return (
                <div className={wrapperClass}>
                    <button
                        onClick={onLogoutAdmin}
                        disabled={isLoading}
                        className="rounded-lg border border-amber-400 bg-slate-900 px-4 py-1.5 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        {isLoading ? "Logging out..." : "Logout"}
                    </button>
                </div>
            )
        default:
            throw new Error(`Invalid variant: ${variant satisfies never}`)
    }
}
