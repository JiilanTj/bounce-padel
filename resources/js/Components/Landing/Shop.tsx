export default function Shop() {
    const products = [
        {
            name: 'Nox AT10 Luxury',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSEYSeHhDE3Irg1C5tbRLgDfMNZHRirewmKYhMC5EnEFy1RYiodtvuYznwqpQNyat0ZjR5p40jEVuonDlG86vbVvts7udBMwFEuYANChbl_zyzIcd9-reDZO_kKMp0_wARUQ_pdjnENWpBCdln815_piG25Q7M-2aHE9Yf_xEh86V-MP57Cn419Nom8C63_oVvlwQQALeqismZEh3EBvODNKZunY4eKZUGrZxWP7HymAnK5oQL2turs80dy_hTsGEtAqhrJyT9M30',
            tag: null,
        },
        {
            name: 'Bullpadel Hack',
            category: 'Hybrid Fly',
            price: '$140',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3pXBPgMawfEfgq2yETVzdlu7RR4lG0L2GRBTgIFECLLcBDpp1Hi7R-jqp4WCd_cdl1a6z3q2wDfVI1j8wgIS07otEZ8IAjmaH3mE_-cO55iFZowYLH3Tw8lsXWyzj79aYU5p4kyaQ2Zungmq4YsA7ylb3_atGVgXg1-l2exzj9klR0n1c5VQ1OfAldzuqcnLomAi-eIwoOLhFVLfXulxmwEXU9-Kk0xn45K3ZvkKY5Ue8D00Q5NDZBqtb8BxXBccDU1i0Wu1X5Xk',
            tag: null,
        },
    ];

    return (
        <section className="relative overflow-hidden bg-surface-dark py-24">
            {/* Abstract Background Pattern */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-landing-shop-gradient to-transparent"></div>
            <div className="relative z-10 mx-auto max-w-[1280px] px-6">
                <div className="mb-16 flex flex-col items-center justify-between md:flex-row">
                    <div>
                        <span className="mb-2 block text-sm font-bold uppercase tracking-widest text-primary">
                            Official Retailer
                        </span>
                        <h2 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">
                            Toko Pro
                        </h2>
                    </div>
                    <div className="mt-6 flex gap-4 md:mt-0">
                        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white hover:text-surface-dark">
                            <span className="material-symbols-outlined">
                                arrow_back
                            </span>
                        </button>
                        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white hover:text-surface-dark">
                            <span className="material-symbols-outlined">
                                arrow_forward
                            </span>
                        </button>
                    </div>
                </div>
                {/* Shop Grid */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((product, index) => (
                        <div
                            key={index}
                            className="group rounded-xl border border-white/5 bg-background-dark p-4 transition-all duration-300 hover:border-primary/50"
                        >
                            <div className="relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-landing-shop-card-bg">
                                {product.tag && (
                                    <span className="absolute left-3 top-3 rounded bg-white px-2 py-1 text-xs font-bold text-black">
                                        {product.tag}
                                    </span>
                                )}
                                <img
                                    alt={product.name}
                                    className="h-full w-full object-cover opacity-80 mix-blend-overlay transition-transform duration-500 group-hover:scale-105"
                                    src={product.image}
                                />
                            </div>
                            <div className="mb-2 flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        Perlengkapan premium untuk permainan
                                        terbaik Anda
                                    </p>
                                </div>
                                <span className="font-bold text-primary">
                                    {product.price}
                                </span>
                            </div>
                            <button className="mt-4 w-full rounded border border-white/20 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black">
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mt-12 text-center">
                    <a
                        className="inline-flex items-center border-b border-transparent pb-1 font-medium text-white transition-colors hover:border-primary hover:text-primary"
                        href="#"
                    >
                        Visit Online Store
                    </a>
                </div>
            </div>
        </section>
    );
}
