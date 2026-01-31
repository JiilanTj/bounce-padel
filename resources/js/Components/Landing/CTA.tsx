export default function CTA() {
    return (
        <section className="bg-background-light py-24 dark:bg-background-dark">
            <div className="mx-auto max-w-[1280px] px-6">
                <div className="relative flex flex-col items-center justify-between overflow-hidden rounded-3xl bg-primary p-8 md:flex-row md:p-16">
                    {/* Decorative Circle */}
                    <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/20 blur-3xl"></div>
                    <div className="relative z-10 max-w-lg">
                        <h2 className="mb-6 text-3xl font-extrabold leading-tight text-background-dark md:text-5xl">
                            Siap gabung?
                        </h2>
                        <p className="mb-8 text-lg font-medium text-background-dark/80">
                            Download aplikasi Bounce buat booking lapangan,
                            cari lawan main, dan pantau progress kamu dengan
                            mudah.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="flex items-center gap-3 rounded-lg bg-background-dark px-6 py-3 font-bold text-white transition-colors hover:bg-black">
                                <span className="material-symbols-outlined">
                                    ios
                                </span>
                                App Store
                            </button>
                            <button className="flex items-center gap-3 rounded-lg bg-background-dark px-6 py-3 font-bold text-white transition-colors hover:bg-black">
                                <span className="material-symbols-outlined">
                                    android
                                </span>
                                Google Play
                            </button>
                        </div>
                    </div>
                    <div className="relative z-10 mt-10 flex justify-center md:mt-0">
                        <div className="flex h-64 w-64 items-center justify-center rounded-full border border-background-dark/10 bg-background-dark/10 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-[100px] text-background-dark">
                                qr_code_2
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
