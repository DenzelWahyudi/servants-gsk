import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import logo from "../assets/logo.png"
import { Footer } from "../components/Footer.tsx"

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800) {
    const [count, setCount] = useState(0)
    const started = useRef(false)

    function start() {
        if (started.current) return
        started.current = true
        const startTime = performance.now()
        function step(now: number) {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }

    return { count, start }
}

// ─── Intersection observer hook ───────────────────────────────────────────────
function useInView(threshold = 0.2) {
    const ref = useRef<HTMLDivElement>(null)
    const [inView, setInView] = useState(false)
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setInView(true)
            },
            { threshold }
        )
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [threshold])
    return { ref, inView }
}

// ─── Stat counter card ────────────────────────────────────────────────────────
function StatCard({
    label,
    target,
    suffix = ""
}: {
    label: string
    target: number
    suffix?: string
}) {
    const { count, start } = useCounter(target)
    const { ref, inView } = useInView()

    useEffect(() => {
        if (inView) start()
    }, [inView, start])

    return (
        <div ref={ref} className="flex flex-col items-center gap-1">
            <span className="text-4xl font-extrabold text-amber-400 tabular-nums sm:text-5xl">
                {count.toLocaleString()}
                {suffix}
            </span>
            <span className="text-center text-sm text-zinc-400 sm:text-base">{label}</span>
        </div>
    )
}

// ─── Feature card ─────────────────────────────────────────────────────────────
type FeatureCardProps = {
    icon: string
    title: string
    description: string
    delay: string
    inView: boolean
}
function FeatureCard({ icon, title, description, delay, inView }: FeatureCardProps) {
    return (
        <div
            className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-sm transition-all duration-500 hover:border-amber-400/50 hover:bg-slate-800/80 sm:p-7"
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 0.6s ease ${delay}, transform 0.6s ease ${delay}`
            }}
        >
            {/* glow orb */}
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl transition-all duration-500 group-hover:h-32 group-hover:w-32 group-hover:bg-amber-400/20" />
            <div className="text-4xl">{icon}</div>
            <h3 className="text-lg font-bold text-zinc-100 transition-colors duration-300 group-hover:text-amber-400">
                {title}
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
        </div>
    )
}

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({
    step,
    title,
    description,
    inView,
    delay
}: {
    step: number
    title: string
    description: string
    inView: boolean
    delay: string
}) {
    return (
        <div
            className="flex flex-col items-center gap-4 text-center"
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.5s ease ${delay}, transform 0.5s ease ${delay}`
            }}
        >
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-400/40 bg-amber-400/15">
                <span className="text-xl font-bold text-amber-400">{step}</span>
                <div className="absolute inset-0 animate-pulse rounded-full bg-amber-400/10 blur-md" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
            <p className="max-w-52 text-sm leading-relaxed text-zinc-400">{description}</p>
        </div>
    )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function LandingNav({ scrolled }: { scrolled: boolean }) {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <nav
            className={`fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-5 py-4 transition-all duration-300 sm:px-12 ${
                scrolled
                    ? "border-b border-slate-700/50 bg-slate-900/90 shadow-lg backdrop-blur-md"
                    : "bg-transparent"
            }`}
        >
            <div className="flex items-center gap-3 select-none">
                <img src={logo} alt="Servants Logo" className="h-9 w-7" />
                <span className="text-xl font-bold text-zinc-100">Servants</span>
            </div>

            {/* Desktop CTA */}
            <div className="hidden items-center gap-3 sm:flex">
                <Link
                    to="/login"
                    className="px-4 py-2 font-medium text-zinc-300 transition-colors duration-200 hover:text-amber-400"
                >
                    Sign In
                </Link>
                <Link
                    to="/register"
                    className="rounded-xl bg-amber-400 px-5 py-2 font-bold text-slate-900 transition-all duration-200 hover:bg-amber-500 hover:shadow-lg hover:shadow-amber-400/25 active:scale-[0.97]"
                >
                    Get Started
                </Link>
            </div>

            {/* Mobile hamburger */}
            <button
                className="flex flex-col gap-1.5 rounded-lg p-2 transition-colors hover:bg-amber-400/20 sm:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                <span
                    className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
                />
                <span
                    className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
                />
                <span
                    className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
                />
            </button>

            {menuOpen && (
                <div
                    className="absolute top-full right-4 mt-2 flex min-w-44 flex-col gap-3 rounded-xl border border-slate-700 bg-slate-800/95 p-4 shadow-2xl backdrop-blur sm:hidden"
                    onClick={() => setMenuOpen(false)}
                >
                    <Link
                        to="/login"
                        className="px-2 py-1.5 font-medium text-zinc-200 transition-colors hover:text-amber-400"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="rounded-xl bg-amber-400 px-4 py-2 text-center font-bold text-slate-900 transition-all hover:bg-amber-500"
                    >
                        Get Started
                    </Link>
                </div>
            )}
        </nav>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function Landing() {
    const [scrolled, setScrolled] = useState(false)
    const [heroVisible, setHeroVisible] = useState(false)

    // Features section
    const featuresRef = useRef<HTMLDivElement>(null)
    const [featuresInView, setFeaturesInView] = useState(false)

    // Steps section
    const stepsRef = useRef<HTMLDivElement>(null)
    const [stepsInView, setStepsInView] = useState(false)

    // Stats section
    const statsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Hero entrance
        const t = setTimeout(() => setHeroVisible(true), 100)

        // Scroll detection
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", onScroll)

        // Intersection observers
        const makeObserver = (setter: (v: boolean) => void, threshold = 0.15) =>
            new IntersectionObserver(
                ([e]) => {
                    if (e.isIntersecting) setter(true)
                },
                { threshold }
            )

        const obs1 = makeObserver(setFeaturesInView)
        const obs2 = makeObserver(setStepsInView)

        if (featuresRef.current) obs1.observe(featuresRef.current)
        if (stepsRef.current) obs2.observe(stepsRef.current)

        return () => {
            clearTimeout(t)
            window.removeEventListener("scroll", onScroll)
            obs1.disconnect()
            obs2.disconnect()
        }
    }, [])

    const features = [
        {
            icon: "📅",
            title: "Smart Scheduling",
            description:
                "View upcoming church services at a glance. See what's happening today, this week, and beyond — all in one organized timeline."
        },
        {
            icon: "🙋",
            title: "Role Sign-Ups",
            description:
                "Browse open volunteer roles and sign up instantly. From worship team to hospitality, find where you fit and make a difference."
        },
        {
            icon: "🔔",
            title: "Service Reminders",
            description:
                "Never miss your assigned service. Receive timely SMS reminders so you're always prepared and ready to serve."
        },
        {
            icon: "💬",
            title: "Team Communication",
            description:
                "Stay connected with fellow servants through built-in group and direct messaging. Coordinate effortlessly, serve together joyfully."
        },
        {
            icon: "📋",
            title: "Assignment Tracking",
            description:
                "Track your past and upcoming assignments in one place. Know your confirmed, pending, and completed services at a glance."
        },
        {
            icon: "🤝",
            title: "Community First",
            description:
                "Built for church communities that believe in serving with purpose. Foster deeper connections and a culture of joyful contribution."
        }
    ]

    const steps = [
        {
            step: 1,
            title: "Create Your Account",
            description:
                "Sign up with your name, email, and phone number to join your church's servant community."
        },
        {
            step: 2,
            title: "Browse Open Roles",
            description:
                "Explore available roles across upcoming services and choose where you'd like to contribute."
        },
        {
            step: 3,
            title: "Sign Up & Get Confirmed",
            description:
                "Submit your sign-up and get notified once you're confirmed by the admin team."
        },
        {
            step: 4,
            title: "Serve with Purpose",
            description: "Show up, serve your community, and grow together in faith and commitment."
        }
    ]

    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-900 text-zinc-100 select-none">
            <LandingNav scrolled={scrolled} />

            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="relative flex min-h-screen items-center justify-center px-5 pt-24 pb-16 sm:px-12">
                {/* Background decoration */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {/* Large ambient orbs */}
                    <div
                        className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-amber-400/6 blur-3xl"
                        style={{ animationDuration: "4s" }}
                    />
                    <div
                        className="absolute right-1/4 bottom-1/4 h-80 w-80 animate-pulse rounded-full bg-indigo-600/8 blur-3xl"
                        style={{ animationDuration: "6s", animationDelay: "1s" }}
                    />
                    <div className="absolute top-1/2 left-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-800/40 blur-3xl" />
                    {/* Grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(251,191,36,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.5) 1px, transparent 1px)",
                            backgroundSize: "60px 60px"
                        }}
                    />
                </div>

                <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
                    {/* Badge */}
                    <div
                        className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-medium text-amber-400 sm:text-sm"
                        style={{
                            opacity: heroVisible ? 1 : 0,
                            transform: heroVisible ? "translateY(0)" : "translateY(-16px)",
                            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s"
                        }}
                    >
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                        Church Volunteer Management Platform
                    </div>

                    {/* Headline */}
                    <h1
                        className="text-4xl leading-tight font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
                        style={{
                            opacity: heroVisible ? 1 : 0,
                            transform: heroVisible ? "translateY(0)" : "translateY(24px)",
                            transition: "opacity 0.7s ease 0.25s, transform 0.7s ease 0.25s"
                        }}
                    >
                        Serve Together,{" "}
                        <span className="bg-linear-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                            Grow Together
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p
                        className="max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg lg:text-xl"
                        style={{
                            opacity: heroVisible ? 1 : 0,
                            transform: heroVisible ? "translateY(0)" : "translateY(24px)",
                            transition: "opacity 0.7s ease 0.4s, transform 0.7s ease 0.4s"
                        }}
                    >
                        Servants is a platform built for church communities — making it simple to
                        schedule services, fill volunteer roles, and stay connected as a team.
                    </p>

                    {/* Quote */}
                    <blockquote
                        className="max-w-lg border-l-2 border-amber-400/50 pl-4 text-left"
                        style={{
                            opacity: heroVisible ? 1 : 0,
                            transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                            transition: "opacity 0.7s ease 0.55s, transform 0.7s ease 0.55s"
                        }}
                    >
                        <p className="text-sm leading-relaxed text-zinc-400 italic">
                            "No one comes to help, no one comes to contribute, everybody comes to
                            learn and to serve."
                        </p>
                        <footer className="mt-1 text-xs font-semibold text-amber-400">
                            — Stephen Tong
                        </footer>
                    </blockquote>

                    {/* CTA buttons */}
                    <div
                        className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4"
                        style={{
                            opacity: heroVisible ? 1 : 0,
                            transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                            transition: "opacity 0.7s ease 0.7s, transform 0.7s ease 0.7s"
                        }}
                    >
                        <Link
                            to="/register"
                            id="hero-register-btn"
                            className="rounded-xl bg-amber-400 px-8 py-3.5 text-center text-base font-bold text-slate-900 transition-all duration-200 hover:bg-amber-500 hover:shadow-xl hover:shadow-amber-400/20 active:scale-[0.97]"
                        >
                            Join the Team →
                        </Link>
                        <Link
                            to="/login"
                            id="hero-login-btn"
                            className="rounded-xl border border-slate-600 bg-slate-800/80 px-8 py-3.5 text-center text-base font-semibold text-zinc-100 backdrop-blur transition-all duration-200 hover:border-amber-400/50 hover:bg-slate-700/80"
                        >
                            Sign In
                        </Link>
                    </div>

                    {/* Scroll indicator */}
                    <div
                        className="mt-4 flex flex-col items-center gap-2 text-xs text-zinc-500"
                        style={{
                            opacity: heroVisible ? 1 : 0,
                            transition: "opacity 0.7s ease 1s"
                        }}
                    >
                        <span>Scroll to explore</span>
                        <div className="h-8 w-0.5 animate-bounce bg-linear-to-b from-zinc-500 to-transparent" />
                    </div>
                </div>
            </section>

            {/* ── Stats ────────────────────────────────────────────── */}
            <section ref={statsRef} className="relative px-5 py-16 sm:px-12 sm:py-20">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-amber-400/5 via-transparent to-indigo-600/5" />
                <div className="relative mx-auto max-w-4xl">
                    <div className="grid grid-cols-2 gap-8 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-8 backdrop-blur-sm sm:grid-cols-4 sm:gap-12 sm:p-12">
                        <StatCard label="Services Organized" target={320} suffix="+" />
                        <StatCard label="Volunteers Served" target={150} suffix="+" />
                        <StatCard label="Roles Filled" target={1200} suffix="+" />
                        <StatCard label="Reminders Sent" target={4800} suffix="+" />
                    </div>
                </div>
            </section>

            {/* ── Features ─────────────────────────────────────────── */}
            <section ref={featuresRef} className="px-5 py-16 sm:px-12 sm:py-24">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-12 text-center sm:mb-16">
                        <span
                            className="text-sm font-semibold tracking-widest text-amber-400 uppercase"
                            style={{
                                opacity: featuresInView ? 1 : 0,
                                transition: "opacity 0.5s ease 0.1s"
                            }}
                        >
                            Everything you need
                        </span>
                        <h2
                            className="mt-3 text-3xl font-extrabold text-zinc-100 sm:text-4xl"
                            style={{
                                opacity: featuresInView ? 1 : 0,
                                transform: featuresInView ? "translateY(0)" : "translateY(16px)",
                                transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s"
                            }}
                        >
                            Built for Servant Hearts
                        </h2>
                        <p
                            className="mx-auto mt-3 max-w-xl text-sm text-zinc-400 sm:text-base"
                            style={{
                                opacity: featuresInView ? 1 : 0,
                                transition: "opacity 0.6s ease 0.3s"
                            }}
                        >
                            Everything your church team needs to coordinate, communicate, and serve
                            with excellence.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                        {features.map((f, i) => (
                            <FeatureCard
                                key={f.title}
                                {...f}
                                inView={featuresInView}
                                delay={`${0.1 + i * 0.1}s`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it works ──────────────────────────────────────── */}
            <section ref={stepsRef} className="relative px-5 py-16 sm:px-12 sm:py-24">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-slate-700 to-transparent" />
                    <div className="absolute right-0 bottom-0 left-0 h-px bg-linear-to-r from-transparent via-slate-700 to-transparent" />
                </div>

                <div className="mx-auto max-w-5xl">
                    <div className="mb-12 text-center sm:mb-16">
                        <span
                            className="text-sm font-semibold tracking-widest text-amber-400 uppercase"
                            style={{
                                opacity: stepsInView ? 1 : 0,
                                transition: "opacity 0.5s ease 0.1s"
                            }}
                        >
                            Simple process
                        </span>
                        <h2
                            className="mt-3 text-3xl font-extrabold text-zinc-100 sm:text-4xl"
                            style={{
                                opacity: stepsInView ? 1 : 0,
                                transform: stepsInView ? "translateY(0)" : "translateY(16px)",
                                transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s"
                            }}
                        >
                            Start Serving in Minutes
                        </h2>
                    </div>

                    <div className="relative grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
                        {/* connector line (desktop) */}
                        <div className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-0.5 bg-linear-to-r from-amber-400/30 via-amber-400/60 to-amber-400/30 sm:block" />
                        {steps.map((s, i) => (
                            <StepCard
                                key={s.step}
                                {...s}
                                inView={stepsInView}
                                delay={`${0.1 + i * 0.15}s`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ───────────────────────────────────────── */}
            <section className="px-5 py-16 sm:px-12 sm:py-24">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="relative overflow-hidden rounded-3xl border border-amber-400/20 bg-linear-to-br from-slate-800/80 to-slate-900/80 p-8 backdrop-blur-sm sm:p-14">
                        {/* decorative orbs */}
                        <div className="pointer-events-none absolute -top-12 -left-12 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />
                        <div className="pointer-events-none absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-indigo-600/10 blur-3xl" />

                        <div className="relative z-10 flex flex-col items-center gap-6">
                            <div className="flex items-center gap-3">
                                <img
                                    src={logo}
                                    alt="Servants Logo"
                                    className="h-10 w-8 opacity-90"
                                />
                                <h2 className="text-2xl font-extrabold text-zinc-100 sm:text-4xl">
                                    Ready to <span className="text-amber-400">Serve?</span>
                                </h2>
                            </div>
                            <p className="max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
                                Join hundreds of volunteers who are already making an impact through
                                Servants. Your church team is waiting for you.
                            </p>
                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
                                <Link
                                    to="/register"
                                    id="cta-register-btn"
                                    className="rounded-xl bg-amber-400 px-8 py-3.5 text-center text-base font-bold text-slate-900 transition-all duration-200 hover:bg-amber-500 hover:shadow-xl hover:shadow-amber-400/25 active:scale-[0.97]"
                                >
                                    Create Account
                                </Link>
                                <Link
                                    to="/login"
                                    id="cta-login-btn"
                                    className="rounded-xl border border-slate-600 px-8 py-3.5 text-center text-base font-semibold text-zinc-300 transition-all duration-200 hover:border-amber-400/60 hover:text-zinc-100"
                                >
                                    I already have an account
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ───────────────────────────────────────────── */}
            <footer className="border-t border-slate-700/50 px-5 py-10 sm:px-12">
                <Footer />
            </footer>
        </div>
    )
}
