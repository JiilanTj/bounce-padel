export default function Facilities() {
    const facilities = [
        {
            title: 'Pro Indoor Courts',
            description:
                'Panoramic glass, Mondo turf, and professional lighting for the perfect game.',
            icon: 'stadium',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWlE-9UDhnPPYTmQb0VHg__XUkAnTXCthkpo9ZkfiKNRmIC7CQUcyKlnsJXP235wYvaGqewFFJ6HS--YbNjQeYE2x3zY2ZDkRAONMAB_vpQQE2vIrmZcxaQNBvlY1vScM2u7xObOEwAR4FH36sqXxgM13S30u2rFJlhKTFMZJQdSRa4dR52rgZPUZuuv4bOvFYYeL8oEaywrg-IRdz3tBHtoia3Bq3TAGivjgtI6ebmZiNrCk0Bw41S1hx4qBFbHuBUg_gv9b5Rko',
        },
        {
            title: 'The Members Lounge',
            description:
                'Relax pre or post-match in our exclusive lounge serving organic refreshments.',
            icon: 'coffee',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgl66a98RU0fzBjt1ltPkrPH-XPRCBoh9QCA9dAYr6GYL6QYW5Rfwo3tcWj0yrIornNJ39rzpVrYzSfp9WS5DX8H6-kdA40c11RYFpfWLg9klYJHARCRDXfDQZOg8ZGkWrOuoJkiy7M8PSGL-fQ6dzi0k-UzO80hNlkvV4JtWwhnPUR8YCh56cLYlgyUc0nFhfSdDmbgTyg5HyNMWq1JxG0YAcGXP7OD9szU01TBGvbxdlgYXZsUKJeA4hd522iSVEgXuMjsknNXs',
        },
        {
            title: 'Luxury Changing Rooms',
            description:
                'Spa-inspired showers, sauna access, and premium grooming products.',
            icon: 'checkroom',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZQUbakj-Y2WTQR6g7xtXEWAG9Z-42yQDUJ4fIyYut5SBglKLL_WGDCfTebYzry-MyopQjVfBAb_F8BQZxULjvJi10OxKgZPCFRAgf8xBjaw2T4MI_yLytjdMuIHFuXKRbJrsuvQMo2w2MBA5JDGOe99f_GkhbPL1b8I5YWn7d7L5vr8KgA0O5lxdl7GBArX2OIFZ9-yVzZJ18T-p2iAm_95PEGhyR7W-1D4KJSt_ksVaT_O06YfGn0QWE7d2MlYjgi7CGRhy69GM',
        },
    ];

    return (
        <section className="bg-background-light py-24 dark:bg-background-dark">
            <div className="mx-auto max-w-[1280px] px-6">
                <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
                    <div className="max-w-xl">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
                            World-Class Facilities
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-gray-400">
                            Designed for peak performance and ultimate
                            relaxation. Every detail at Bounce Padel is curated
                            for the discerning athlete.
                        </p>
                    </div>
                    <a
                        className="group flex items-center gap-1 font-semibold text-primary hover:text-green-400"
                        href="#"
                    >
                        Explore all facilities
                        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                            arrow_forward
                        </span>
                    </a>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {facilities.map((facility, index) => (
                        <div
                            key={index}
                            className="group relative h-[400px] cursor-pointer overflow-hidden rounded-xl"
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url("${facility.image}")`,
                                }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 w-full p-8">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-[#112217]">
                                    <span className="material-symbols-outlined">
                                        {facility.icon}
                                    </span>
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-white">
                                    {facility.title}
                                </h3>
                                <p className="translate-y-2 transform text-sm text-gray-300 opacity-0 transition-opacity duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                    {facility.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
