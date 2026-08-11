import { Header } from "../components/Header"
import React, { useState } from "react"
import { ButtonLink } from "../components/ButtonLink"
import { Form } from "../components/Form"
import { Heading } from "../components/Heading"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { API_URL } from "../api"

export function LoginAdmin() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [formData, setFormData] = useState({
        phoneNumber: "",
        password: ""
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    function handleChange(field: keyof typeof formData) {
        return (e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    }

    async function handleLogin() {
        setError(null)
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/users/login/admin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || "Login failed. Please try again.")
                return
            }

            login(data.token, data.user)

            navigate("/admin/services")
        } catch {
            setError("Please connect to a Wi-Fi network and try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto flex flex-col items-center gap-15 px-12 py-5 select-none">
            <Header variant="loginadmin" />
            <div className="flex h-118 w-100 flex-col items-center gap-1.5 rounded-xl bg-slate-800 p-7">
                <div className="mt-2">
                    <Heading>Login</Heading>
                </div>
                <div className="mt-4 mb-4">
                    <h2 className="text-lg text-zinc-400">
                        No one comes to help, no one comes to contribute, everybody comes to learn
                        and to serve - Stephen Tong
                    </h2>
                </div>
                <Form
                    label="Phone number"
                    value={formData.phoneNumber}
                    onChange={handleChange("phoneNumber")}
                    type="tel"
                />
                <Form
                    label="Password"
                    value={formData.password}
                    onChange={handleChange("password")}
                    type="password"
                />

                {error && <p className="w-full text-center text-sm text-red-400">{error}</p>}

                <div className="flex w-full justify-end">
                    <ButtonLink
                        to="/forgot-password"
                        variant="secondary"
                        className="text-sm text-amber-400"
                    >
                        Forgot Password?
                    </ButtonLink>
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="mt-auto flex w-full justify-center rounded-lg bg-amber-400 py-1.5 text-base font-semibold text-blue-950 transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </div>
        </div>
    )
}
