interface WebsiteSettings {
    phone_number: string | null;
    email: string | null;
    location: string | null;
    location_link: string | null;
    facebook_link: string | null;
    instagram_link: string | null;
    twitter_link: string | null;
    home_image_header: string | null;
    opening_hours: string | null;
    operating_days: string | null;
    holiday_notes: string | null;
}

export default function CTA({
    settings,
}: {
    settings: WebsiteSettings | null;
}) {
    // Generate WhatsApp link from phone number
    const getWhatsAppLink = () => {
        if (!settings?.phone_number) return null;
        // Remove all non-numeric characters
        const cleanPhone = settings.phone_number.replace(/\D/g, '');
        // If starts with 0, replace with 62 (Indonesia country code)
        const phone = cleanPhone.startsWith('0')
            ? '62' + cleanPhone.slice(1)
            : cleanPhone;
        return `https://wa.me/${phone}?text=Hi,%20saya%20ingin%20booking%20lapangan%20padel`;
    };

    const whatsappLink = getWhatsAppLink();
    // Generate QR code URL using Google Charts API
    const qrCodeUrl = whatsappLink
        ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(whatsappLink)}`
        : null;

    return (
        <section className="bg-background-light py-16 dark:bg-background-dark md:py-24">
            <div className="mx-auto max-w-[1280px] px-6">
                <div className="relative overflow-hidden rounded-3xl bg-[#112217] p-8 md:p-16">
                    {/* Background Image / Overlay */}
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-overlay"
                        style={{
                            backgroundImage:
                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAWlE-9UDhnPPYTmQb0VHg__XUkAnTXCthkpo9ZkfiKNRmIC7CQUcyKlnsJXP235wYvaGqewFFJ6HS--YbNjQeYE2x3zY2ZDkRAONMAB_vpQQE2vIrmZcxaQNBvlY1vScM2u7xObOEwAR4FH36sqXxgM13S30u2rFJlhKTFMZJQdSRa4dR52rgZPUZuuv4bOvFYYeL8oEaywrg-IRdz3tBHtoia3Bq3TAGivjgtI6ebmZiNrCk0Bw41S1hx4qBFbHuBUg_gv9b5Rko')",
                        }}
                    ></div>
                    <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#112217] via-[#112217]/90 to-transparent"></div>

                    <div className="relative z-10 flex flex-col items-center justify-between gap-12 md:flex-row">
                        <div className="max-w-lg text-center md:text-left">
                            <h2 className="mb-6 text-3xl font-extrabold leading-tight text-white md:text-5xl">
                                Siap untuk{' '}
                                <span className="text-primary">Juara?</span>
                            </h2>
                            <p className="mb-8 text-lg font-medium text-gray-400">
                                Jangan lewatkan keseruan bermain Padel. Booking
                                lapangan sekarang via Ayo.co.id atau website
                                kami.
                            </p>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <a
                                    href="https://ayo.co.id"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-primary px-6 py-4 font-bold text-[#112217] transition-all hover:bg-white sm:w-auto"
                                >
                                    <span className="material-symbols-outlined">
                                        sports_tennis
                                    </span>
                                    Book via Ayo Indonesia
                                </a>
                                <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/20 bg-transparent px-6 py-4 font-bold text-white transition-all hover:bg-white hover:text-[#112217] sm:w-auto">
                                    <span className="material-symbols-outlined">
                                        calendar_today
                                    </span>
                                    Web Booking
                                </button>
                            </div>
                        </div>

                        {/* QR Code / App Preview aligned right */}
                        <div className="relative flex justify-center">
                            <div className="relative flex h-64 w-64 items-center justify-center rounded-2xl bg-white p-4 shadow-2xl transition-transform hover:scale-105 md:h-72 md:w-72">
                                {qrCodeUrl ? (
                                    <img
                                        src={qrCodeUrl}
                                        alt="WhatsApp QR Code"
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <span className="material-symbols-outlined text-[150px] text-[#112217]">
                                        qr_code_2
                                    </span>
                                )}
                                <div className="absolute -bottom-4 rounded-full bg-primary px-4 py-1 text-sm font-bold text-[#112217] shadow-lg">
                                    {qrCodeUrl
                                        ? 'Scan to Book on Whatsapp'
                                        : 'Scan to Book'}
                                </div>
                            </div>
                            {/* Decorative background blur behind QR */}
                            <div className="absolute -inset-4 -z-10 rounded-full bg-primary/20 blur-3xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
