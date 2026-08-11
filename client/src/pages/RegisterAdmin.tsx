import { Header } from "../components/Header"
import { useNavigate } from "react-router-dom"
import { ButtonLink } from "../components/ButtonLink"
import { Form } from "../components/Form"
import { Heading } from "../components/Heading"
import React, { useRef, useState, useEffect } from "react"
import { API_URL } from "../api"

export function RegisterAdmin() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirm_password: "",
        role: "admin",
        code: ""
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState("form")
    const inputRef = useRef<HTMLInputElement>(null)
    const [focused, setFocused] = useState(false)
    const [timer, setTimer] = useState(600)

    useEffect(() => {
        if (page !== "otp" || timer === 0) return
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(interval)
    }, [page, timer])

    function handleChange(field: keyof typeof formData) {
        return (e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    }

    function handleOTPChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (error !== null) setError(null)
        const digits = e.target.value.replace(/\D/g, "")
        return setFormData((prev) => ({ ...prev, code: digits }))
    }

    async function handleRegister() {
        setError(null)
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/users/admin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || "Registration failed. Please try again.")
                return
            }

            navigate("/admin/login")
        } catch {
            setError("Please connect to a Wi-Fi network and try again.")
        } finally {
            setLoading(false)
        }
    }

    async function handleSendOTP() {
        setLoading(true)
        setError(null)

        try {
            const check = await fetch(`${API_URL}/api/users/check`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            const checkData = await check.json()
            if (!check.ok) {
                setError(checkData.message || "Failed checks.")
                return
            }

            const response = await fetch(`${API_URL}/api/users/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: formData.phoneNumber })
            })
            const data = await response.json()
            if (!response.ok) {
                setError(
                    data.statusCode === 400
                        ? "Use international format eg: +62123456..."
                        : data.message || "Failed to send otp."
                )
                return
            }

            setPage("otp")
            setTimer(600)
        } catch {
            setError("Please connect to a Wi-Fi network and try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto flex min-h-screen flex-col items-center gap-8 px-4 pt-5 pb-10 select-none sm:gap-12 sm:px-12">
            <Header variant="registeradmin" />
            {page === "form" ? (
                <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-slate-700/50 bg-slate-800/80 p-6 shadow-2xl backdrop-blur-sm sm:p-10">
                    <div className="mb-2 text-center">
                        <Heading>Create Account</Heading>
                        <h2 className="mt-2 text-sm text-zinc-400 sm:text-base">
                            Join the servants team
                        </h2>
                    </div>

                    <div className="flex w-full flex-col gap-3.5">
                        <Form
                            label="Full Name"
                            value={formData.name}
                            onChange={handleChange("name")}
                        />
                        <Form
                            label="Email"
                            value={formData.email}
                            onChange={handleChange("email")}
                            type="email"
                        />
                        <Form
                            label="Phone Number"
                            value={formData.phoneNumber}
                            onChange={handleChange("phoneNumber")}
                            type="tel"
                        />
                        <Form
                            label="Password"
                            value={formData.password}
                            onChange={handleChange("password")}
                        />
                        <Form
                            label="Confirm Password"
                            value={formData.confirm_password}
                            onChange={handleChange("confirm_password")}
                        />
                    </div>

                    {error && (
                        <p className="mt-1 w-full rounded-lg border border-red-400/20 bg-red-400/10 py-2 text-center text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <div className="mt-4 flex w-full flex-col gap-6">
                        <button
                            onClick={() => handleSendOTP()}
                            disabled={loading}
                            className="w-full rounded-xl bg-amber-400 py-2.5 text-[15px] font-bold text-slate-900 transition-all duration-200 hover:bg-amber-500 hover:shadow-lg hover:shadow-amber-400/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:py-3"
                        >
                            {loading ? "Loading..." : "Register"}
                        </button>

                        <div className="flex items-center justify-center gap-2">
                            <span className="text-sm text-zinc-400">Already have an account?</span>
                            <ButtonLink
                                to="/admin/login"
                                variant="secondary"
                                className="text-sm font-semibold text-amber-400 hover:text-amber-300"
                            >
                                Login
                            </ButtonLink>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex min-h-96 w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-slate-700/50 bg-slate-800/80 p-6 shadow-2xl backdrop-blur-sm sm:p-10">
                    <div className="text-center">
                        <Heading>OTP Verification</Heading>
                        <h2 className="mt-2 text-sm text-zinc-400 sm:text-base">
                            We just sent an SMS to{" "}
                            <span className="text-zinc-200">{formData.phoneNumber}</span>
                        </h2>
                    </div>

                    <div
                        className="relative mt-4 inline-flex gap-2 sm:gap-3"
                        onClick={() => inputRef.current?.focus()}
                    >
                        <input
                            value={formData.code}
                            onChange={handleOTPChange}
                            inputMode="numeric"
                            type="text"
                            pattern="[0-9]*"
                            maxLength={6}
                            ref={inputRef}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            className="absolute h-full w-full cursor-text opacity-0"
                        />
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className={`flex h-14 w-11 items-center justify-center rounded-xl border font-mono text-xl text-zinc-100 transition-all duration-200 sm:h-16 sm:w-14 sm:text-2xl ${focused && i === formData.code.length ? "border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]" : error ? "border-red-500 bg-red-500/10" : "border-slate-600 bg-slate-700/50"} `}
                            >
                                {formData.code[i]}
                            </div>
                        ))}
                    </div>

                    <div className="text-center text-sm text-zinc-400">
                        Code expires in{" "}
                        <span className="font-medium text-amber-400">
                            {Math.floor(timer / 60)
                                .toString()
                                .padStart(2, "0")}
                            :{(timer % 60).toString().padStart(2, "0")}
                        </span>
                    </div>

                    {error && (
                        <span className="w-full rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-2 text-center text-sm text-red-400">
                            {error}
                        </span>
                    )}

                    <div className="mt-auto flex w-full flex-col gap-4">
                        <button
                            className="w-full rounded-xl bg-indigo-600 py-2.5 text-[15px] font-bold text-white transition-all duration-200 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50 sm:py-3"
                            onClick={() => handleRegister()}
                        >
                            Verify Code
                        </button>
                        <button
                            onClick={() => setPage("form")}
                            className="py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-amber-400"
                        >
                            ← Back to register
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
