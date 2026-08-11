import { Header } from "../components/Header"
import { useNavigate } from "react-router-dom"
import { Form as FormComponent } from "../components/Form"
import { Heading } from "../components/Heading"
import React, { useRef, useState, useEffect } from "react"
import { API_URL } from "../api"

interface Form {
    phoneNumber: string
    new_password: string
    confirm_new_password: string
    code: string
}

export function ForgotPassword() {
    const navigate = useNavigate()

    const [form, setForm] = useState<Form>({
        phoneNumber: "",
        new_password: "",
        confirm_new_password: "",
        code: ""
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // OTP specific state
    const inputRef = useRef<HTMLInputElement>(null)
    const [focused, setFocused] = useState(false)
    const [timer, setTimer] = useState(0)
    const [otpSent, setOtpSent] = useState(false)

    useEffect(() => {
        if (!otpSent || timer === 0) return
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(interval)
    }, [otpSent, timer])

    function handleChange(field: keyof Form) {
        return (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

    function handleOTPChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (error !== null) setError(null)
        const digits = e.target.value.replace(/\D/g, "")
        setForm((prev) => ({ ...prev, code: digits }))
    }

    async function handleForgotPasswordSubmit() {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_URL}/api/users/forgot-password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })
            const data = await response.json()

            if (!response.ok) {
                setError(data.message || "Failed to change password.")
                return
            }

            navigate("/login")
        } catch {
            setError("Could not connect to the server. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    async function handleSendOTP() {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_URL}/api/users/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: form.phoneNumber })
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

            setOtpSent(true)
            setTimer(600)
        } catch {
            setError("Could not connect to the server. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto flex min-h-screen flex-col items-center gap-8 px-4 pt-5 pb-10 select-none sm:gap-12 sm:px-12">
            <Header variant="register" />

            <div className="flex w-full max-w-lg flex-col items-center gap-4 rounded-2xl border border-slate-700/50 bg-slate-800/80 p-6 shadow-2xl backdrop-blur-sm sm:p-10">
                <div className="mb-2 text-center">
                    <Heading>Reset Password</Heading>
                    <h2 className="mt-2 text-sm text-zinc-400 sm:text-base">
                        Enter details to reset your password
                    </h2>
                </div>

                <div className="mt-4 flex w-full flex-col gap-6">
                    {/* Step 1: Phone & OTP inline */}
                    <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/50 bg-slate-900/50 p-5">
                        <FormComponent
                            label="Phone Number"
                            value={form.phoneNumber}
                            onChange={handleChange("phoneNumber")}
                        />

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-zinc-400">
                                {otpSent
                                    ? timer > 0
                                        ? `Code expires in ${Math.floor(timer / 60)
                                              .toString()
                                              .padStart(
                                                  2,
                                                  "0"
                                              )}:${(timer % 60).toString().padStart(2, "0")}`
                                        : "Code expired"
                                    : "OTP Verification"}
                            </span>
                            <button
                                onClick={handleSendOTP}
                                disabled={loading || (otpSent && timer > 0)}
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                            >
                                {loading && !otpSent
                                    ? "Sending..."
                                    : otpSent
                                      ? timer > 0
                                          ? `Resend (${Math.floor(timer / 60)
                                                .toString()
                                                .padStart(
                                                    2,
                                                    "0"
                                                )}:${(timer % 60).toString().padStart(2, "0")})`
                                          : "Resend OTP"
                                      : "Send OTP"}
                            </button>
                        </div>

                        {/* OTP Input Grid */}
                        <div
                            className="relative inline-flex w-full justify-center gap-2 sm:gap-3"
                            onClick={() => inputRef.current?.focus()}
                        >
                            <input
                                value={form.code}
                                onChange={handleOTPChange}
                                inputMode="numeric"
                                type="text"
                                pattern="[0-9]*"
                                maxLength={6}
                                ref={inputRef}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                className="absolute z-10 h-full w-full cursor-text opacity-0"
                            />
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex h-14 w-11 items-center justify-center rounded-xl border font-mono text-xl text-zinc-100 transition-all duration-200 sm:h-16 sm:w-14 sm:text-2xl ${focused && i === form.code.length ? "border-amber-400 bg-slate-800 shadow-[0_0_12px_rgba(251,191,36,0.3)]" : error && !form.code ? "border-red-500 bg-red-500/10" : "border-slate-600 bg-slate-800/60"} `}
                                >
                                    {form.code[i]}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: New Password */}
                    <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/50 bg-slate-900/50 p-5">
                        <FormComponent
                            label="New Password"
                            value={form.new_password}
                            onChange={handleChange("new_password")}
                        />
                        <FormComponent
                            label="Confirm New Password"
                            value={form.confirm_new_password}
                            onChange={handleChange("confirm_new_password")}
                        />
                    </div>
                </div>

                {error && (
                    <p className="mt-2 w-full rounded-lg border border-red-400/20 bg-red-400/10 py-2 text-center text-sm text-red-400">
                        {error}
                    </p>
                )}

                <div className="mt-4 flex w-full flex-col gap-6">
                    <button
                        onClick={handleForgotPasswordSubmit}
                        disabled={loading}
                        className="w-full rounded-xl bg-amber-400 py-3 text-[15px] font-bold text-slate-900 transition-all duration-200 hover:bg-amber-500 hover:shadow-lg hover:shadow-amber-400/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Reset Password"}
                    </button>
                </div>
            </div>
        </div>
    )
}
