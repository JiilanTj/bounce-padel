import { Link } from '@inertiajs/react';

export default function Facilities() {
    const facilities = [
        {
            title: 'Lapangan Indoor Pro',
            description:
                'Kaca panoramik, rumput Mondo, dan pencahayaan profesional untuk permainan yang sempurna.',
            icon: 'stadium',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWlE-9UDhnPPYTmQb0VHg__XUkAnTXCthkpo9ZkfiKNRmIC7CQUcyKlnsJXP235wYvaGqewFFJ6HS--YbNjQeYE2x3zY2ZDkRAONMAB_vpQQE2vIrmZcxaQNBvlY1vScM2u7xObOEwAR4FH36sqXxgM13S30u2rFJlhKTFMZJQdSRa4dR52rgZPUZuuv4bOvFYYeL8oEaywrg-IRdz3tBHtoia3Bq3TAGivjgtI6ebmZiNrCk0Bw41S1hx4qBFbHuBUg_gv9b5Rko',
        },
        {
            title: 'Lounge Member',
            description:
                'Bersantai sebelum atau sesudah pertandingan di lounge eksklusif kami.',
            icon: 'coffee',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgl66a98RU0fzBjt1ltPkrPH-XPRCBoh9QCA9dAYr6GYL6QYW5Rfwo3tcWj0yrIornNJ39rzpVrYzSfp9WS5DX8H6-kdA40c11RYFpfWLg9klYJHARCRDXfDQZOg8ZGkWrOuoJkiy7M8PSGL-fQ6dzi0k-UzO80hNlkvV4JtWwhnPUR8YCh56cLYlgyUc0nFhfSdDmbgTyg5HyNMWq1JxG0YAcGXP7OD9szU01TBGvbxdlgYXZsUKJeA4hd522iSVEgXuMjsknNXs',
        },
        {
            title: 'Ruang Ganti Mewah',
            description:
                'Shower dengan sentuhan spa, akses sauna, dan produk perawatan premium.',
            icon: 'checkroom',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZQUbakj-Y2WTQR6g7xtXEWAG9Z-42yQDUJ4fIyYut5SBglKLL_WGDCfTebYzry-MyopQjVfBAb_F8BQZxULjvJi10OxKgZPCFRAgf8xBjaw2T4MI_yLytjdMuIHFuXKRbJrsuvQMo2w2MBA5JDGOe99f_GkhbPL1b8I5YWn7d7L5vr8KgA0O5lxdl7GBArX2OIFZ9-yVzZJ18T-p2iAm_95PEGhyR7W-1D4KJSt_ksVaT_O06YfGn0QWE7d2MlYjgi7CGRhy69GM',
        },
        {
            title: 'Akademi Padel',
            description:
                'Program pelatihan dari pelatih bersertifikat untuk semua tingkatan.',
            icon: 'school',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSEYSeHhDE3Irg1C5tbRLgDfMNZHRirewmKYhMC5EnEFy1RYiodtvuYznwqpQNyat0ZjR5p40jEVuonDlG86vbVvts7udBMwFEuYANChbl_zyzIcd9-reDZO_kKMp0_wARUQ_pdjnENWpBCdln815_piG25Q7M-2aHE9Yf_xEh86V-MP57Cn419Nom8C63_oVvlwQQALeqismZEh3EBvODNKZunY4eKZUGrZxWP7HymAnK5oQL2turs80dy_hTsGEtAqhrJyT9M30',
        },
        {
            title: 'Musholla & Area Santai',
            description: 'Fasilitas ibadah yang nyaman dan area terbuka hijau.',
            icon: 'mosque',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3pXBPgMawfEfgq2yETVzdlu7RR4lG0L2GRBTgIFECLLcBDpp1Hi7R-jqp4WCd_cdl1a6z3q2wDfVI1j8wgIS07otEZ8IAjmaH3mE_-cO55iFZowYLH3Tw8lsXWyzj79aYU5p4kyaQ2Zungmq4YsA7ylb3_atGVgXg1-l2exzj9klR0n1c5VQ1OfAldzuqcnLomAi-eIwoOLhFVLfXulxmwEXU9-Kk0xn45K3ZvkKY5Ue8D00Q5NDZBqtb8BxXBccDU1i0Wu1X5Xk',
        },
    ];

    return (
        <section className="bg-background-light py-16 dark:bg-background-dark md:py-24">
            <div className="mx-auto max-w-[1280px] px-6">
                <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                    <div className="max-w-xl">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
                            Fasilitas Kelas Dunia
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-gray-400">
                            Dirancang untuk performa terbaik dan relaksasi
                            maksimal. Setiap detail di Bounce Padel dikurasi
                            untuk memberikan pengalaman terbaik bagi Anda.
                        </p>
                    </div>
                    <Link
                        href="#"
                        className="group flex items-center gap-1 font-semibold text-primary hover:text-green-400"
                    >
                        Lihat semua fasilitas
                        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                            arrow_forward
                        </span>
                    </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
                    {facilities.map((facility, index) => (
                        <div
                            key={index}
                            className={`group relative cursor-pointer overflow-hidden rounded-xl ${
                                index === 0
                                    ? 'col-span-2 h-[300px] md:col-span-2 md:h-[400px] lg:col-span-2'
                                    : index === 3 || index === 4
                                      ? 'col-span-1 h-[200px] md:col-span-1 md:h-[400px]'
                                      : 'col-span-1 h-[200px] md:col-span-1 md:h-[400px]'
                            }`}
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url("${facility.image}")`,
                                }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 w-full p-4 md:p-8">
                                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[#112217] md:mb-4 md:h-12 md:w-12">
                                    <span className="material-symbols-outlined text-sm md:text-2xl">
                                        {facility.icon}
                                    </span>
                                </div>
                                <h3
                                    className={`font-bold text-white ${index === 0 ? 'mb-2 text-xl md:text-2xl' : 'mb-1 text-sm md:mb-2 md:text-xl'}`}
                                >
                                    {facility.title}
                                </h3>
                                <p
                                    className={`transform text-gray-300 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 ${index === 0 ? 'translate-y-2 text-sm md:text-base' : 'hidden md:block md:translate-y-2 md:text-sm'}`}
                                >
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
