import logo from "../assets/logo.png"

export function Footer() {
    return (
        <div className="flex flex-col gap-10 pt-7">
            <div className="flex justify-between">
                <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-zinc-300">Location</h3>
                    <h4 className="hidden text-sm text-zinc-400 sm:block">
                        Indonesia, Jakarta Utara
                    </h4>
                    <h4 className="text-sm text-zinc-400 sm:hidden">Indonesia, </h4>
                    <h4 className="text-sm text-zinc-400 sm:hidden">Jakarta Utara</h4>
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-zinc-300">Contact us</h3>
                    <div className="flex flex-col gap-1.5">
                        <h4 className="hidden text-sm text-zinc-400 sm:block">📞 089682115180</h4>
                        <h4 className="hidden text-sm text-zinc-400 sm:block">
                            ✉️ denzel.wahyudi@outlook.com
                        </h4>
                        <h4 className="text-sm text-zinc-400 sm:hidden">089682115180</h4>
                        <h4 className="text-sm text-zinc-400 sm:hidden">
                            denzel.wahyudi@outlook.com
                        </h4>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <img src={logo} alt="Servants Logo" className="h-10 w-7.5" />
                <h1 className="text-2xl font-bold">Servants</h1>
            </div>

            <span className="text-sm text-zinc-400">© 2026 Sevants. All rights reserved.</span>
        </div>
    )
}
