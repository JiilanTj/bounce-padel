export default function Facilities() {
    const facilities = [
        {
            title: 'Lapangan Indoor Pro',
            description:
                'Kaca panorama, rumput Mondo, dan pencahayaan profesional buat main makin nyaman.',
            icon: 'stadium',
            image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
        },
        {
            title: 'Lounge VIP',
            description:
                'Ruang eksklusif dengan fasilitas premium buat member dan tamu.',
            icon: 'chair',
            image: 'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=800',
        },
        {
            title: 'Pelatihan Ahli',
            description:
                'Pelatih bersertifikat siap bantu kamu lewat sesi privat atau kelompok.',
            icon: 'sports',
            image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800',
        },
        {
            title: 'Toko Perlengkapan',
            description:
                'Raket, baju, dan aksesoris premium dari brand ternama.',
            icon: 'shopping_bag',
            image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
        },
    ];

    return (
        <section className="bg-background-light py-24 dark:bg-background-dark">
            <div className="mx-auto max-w-[1280px] px-6">
                <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
                    <div className="max-w-xl">
                        <h2 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">
                            Fasilitas Lengkap
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-gray-400">
                            Semua yang kamu butuhkan buat pengalaman main padel
                            yang seru dan nyaman.
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
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-background-dark">
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
