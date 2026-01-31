export default function Hero() {
    return (
        <header className="relative flex h-[85vh] min-h-[600px] w-full items-center justify-center overflow-hidden">
            {/* Background Image with Gradient Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                data-alt="Dark moody cinematic shot of a professional indoor padel court with glass walls"
                style={{
                    backgroundImage:
                        'linear-gradient(to bottom, rgba(17, 34, 23, 0.3) 0%, rgba(17, 34, 23, 0.8) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAOnW-epr9MoxJ8I2Ta3O1prVPte_4rqrgYc8AMuKLSx6bopyZoIXWaZwfgVpMWwcXP9t4yg8lioRTIQ4oq7SqIWz9uwcm5D20A_aal3lfQ7jBhgTZFg6ZvQ05QJXDMOjtukj6rLBZ-p8VSdryj9qXl8-p7wQfMOBwcj08B1y1GaFYHFZBS4Bb1Q3FyJV8nLkRE2HvhYcYCSkRK1GwJ0MJaOmnbdkrOpyrZuxAcDlziK25GV2A7DaxtOimKc1yO0nIaPcjDIU9bBG0")',
                }}
            ></div>
            <div className="relative z-10 max-w-4xl px-6 text-center">
                <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    Klub Padel Terbaik di Kota
                </span>
                <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white md:text-6xl lg:text-7xl">
                    Lapangan Indoor Berkualitas
                    <br />
                    <span className="text-primary">
                        Main Padel Semakin Seru
                    </span>
                </h1>
                <p className="mb-10 text-lg font-medium leading-relaxed text-gray-200 md:text-xl">
                    Gabung di klub padel paling asyik! Fasilitas lengkap,
                    pelatih berpengalaman, dan komunitas yang solid buat kamu
                    yang suka main padel.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button className="h-12 w-full transform rounded-lg bg-primary px-8 text-base font-bold text-background-dark transition-all hover:scale-105 hover:bg-green-600 sm:w-auto">
                        Booking Lapangan
                    </button>
                    <button className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-white/30 bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10 sm:w-auto">
                        <span>Lihat Fasilitas</span>
                        <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
                            play_circle
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}
