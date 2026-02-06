import { formatCurrency } from '@/utils/currency';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

interface Product {
    id: number;
    category_id: number | null;
    name: string;
    sku: string | null;
    description: string | null;
    price_buy: number | null;
    price_rent: number | null;
    stock_buy: number;
    stock_rent: number;
    image_path: string | null;
    type: string;
    category?: {
        id: number;
        name: string;
    };
}

interface ProductCardProps {
    product: {
        name: string;
        description: string;
        price: string;
        image: string;
        tag: string | null;
    };
}

function ProductCard({ product }: ProductCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div className="group rounded-xl border border-white/5 bg-[#112217] p-3 transition-all duration-300 hover:border-primary/50 md:p-4">
            <div className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-[#1a2c21] md:mb-4">
                {product.tag && (
                    <span className="absolute left-2 top-2 rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-black md:left-3 md:top-3 md:px-2 md:py-1 md:text-xs">
                        {product.tag}
                    </span>
                )}
                {!imageLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-gray-800" />
                )}
                <img
                    alt={product.name}
                    className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    src={product.image}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setImageLoaded(true)}
                />
            </div>
            <div className="mb-2 flex flex-col justify-between gap-1 md:flex-row md:items-start">
                <div>
                    <h3 className="truncate text-sm font-semibold text-white md:text-lg">
                        {product.name}
                    </h3>
                    <p className="truncate text-xs text-gray-400 md:text-sm">
                        {product.description}
                    </p>
                </div>
                <span className="text-sm font-bold text-primary md:text-base">
                    {product.price}
                </span>
            </div>
            <button className="mt-2 w-full rounded border border-white/20 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white hover:text-black md:mt-4 md:py-2 md:text-sm">
                Add to Cart
            </button>
        </div>
    );
}

export default function Shop({ products }: { products: Product[] }) {
    // Fallback products if database is empty
    const fallbackProducts = [
        {
            name: 'Nox AT10 Luxury',
            description: 'Professional Series',
            price: 'Rp 4.500.000',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2b8iIcSdsnvF_Xk3wkGTIYrdcOlPCpm3CxosbR9OvOXlnWBCJgXd93pVuop5_3kHL83JPyIHqXEWBFhNYhT_HOvYQEVBD_n9zX46rZtStS9cdMVPorxPVkEoreiOOPRfl3WCyzKspyPD7cHmg463G5aUbltnGaAgs6TCuHLGWViq3AssBIKmuE03Yp8pUEmVmrkr4DcAyXHYvC_3Q4mOfGCjsx9dFabHsHvnTc6n7gHRWP14iuGJIsziBE4QZ0dsJQtImnsrHY-o',
            tag: 'NEW',
        },
        {
            name: 'Head Pro S Balls',
            description: '3-Ball Can',
            price: 'Rp 150.000',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcP4gaYsK-qbYkqyLjEzVtkn5OA_csCQt3sagYgR707L3O-S0SJSPGK4FwwQRVfX4vs0HNpWZiooHXTVyR5-5lF4eWcoW_YWSshqi96SYVwMWNcKyiRJ-dR4Ca0yldKnZ1mEWIFAQlbJIYrcEQM-SbGmz-IAnNKltdDYl8-Uo8IMSLxqrEKOwKRM_2tEGKlQWadH8j92YTRUvdq8foe7eYc_a2gK-xl-it5plQTD96oGbXSLSA5e9JoGPHr6Dnv7zbUHiKUIdARC0',
            tag: null,
        },
        {
            name: 'Bounce Tech Tee',
            description: 'Breathable Fabric',
            price: 'Rp 450.000',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSEYSeHhDE3Irg1C5tbRLgDfMNZHRirewmKYhMC5EnEFy1RYiodtvuYznwqpQNyat0ZjR5p40jEVuonDlG86vbVvts7udBMwFEuYANChbl_zyzIcd9-reDZO_kKMp0_wARUQ_pdjnENWpBCdln815_piG25Q7M-2aHE9Yf_xEh86V-MP57Cn419Nom8C63_oVvlwQQALeqismZEh3EBvODNKZunY4eKZUGrZxWP7HymAnK5oQL2turs80dy_hTsGEtAqhrJyT9M30',
            tag: null,
        },
        {
            name: 'Bullpadel Hack',
            description: 'Hybrid Fly',
            price: 'Rp 2.200.000',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3pXBPgMawfEfgq2yETVzdlu7RR4lG0L2GRBTgIFECLLcBDpp1Hi7R-jqp4WCd_cdl1a6z3q2wDfVI1j8wgIS07otEZ8IAjmaH3mE_-cO55iFZowYLH3Tw8lsXWyzj79aYU5p4kyaQ2Zungmq4YsA7ylb3_atGVgXg1-l2exzj9klR0n1c5VQ1OfAldzuqcnLomAi-eIwoOLhFVLfXulxmwEXU9-Kk0xn45K3ZvkKY5Ue8D00Q5NDZBqtb8BxXBccDU1i0Wu1X5Xk',
            tag: null,
        },
    ];

    // Map database products to display format
    const displayProducts =
        products && products.length > 0
            ? products.map((p) => {
                  // Determine price to display (prefer buy, fallback to rent)
                  const price =
                      p.price_buy && p.price_buy > 0
                          ? formatCurrency(p.price_buy)
                          : p.price_rent && p.price_rent > 0
                            ? `${formatCurrency(p.price_rent)}/day`
                            : 'Rp 0';

                  // Determine tag based on type and stock
                  let tag: string | null = null;
                  if (p.stock_buy > 0 && p.stock_rent > 0) {
                      tag = 'RENT & BUY';
                  } else if (p.stock_buy > 0) {
                      tag = 'BUY';
                  } else if (p.stock_rent > 0) {
                      tag = 'RENT';
                  }

                  return {
                      name: p.name,
                      description:
                          p.description || 'High-quality padel equipment',
                      price,
                      image:
                          p.image_path ||
                          'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=60',
                      tag,
                  };
              })
            : fallbackProducts;

    // Don't render if no products
    if (displayProducts.length === 0) return null;

    return (
        <section className="relative overflow-hidden bg-surface-dark py-16 md:py-24">
            {/* Abstract Background Pattern */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#152e20] to-transparent"></div>
            <div className="relative z-10 mx-auto max-w-[1280px] px-6">
                <div className="mb-12 md:mb-16">
                    <span className="mb-2 block text-sm font-bold uppercase tracking-widest text-primary">
                        Official Retailer
                    </span>
                    <h2 className="text-3xl font-bold text-white md:text-5xl">
                        The Pro Shop
                    </h2>
                </div>
                {/* Shop Grid */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-8">
                    {displayProducts.map((product, index) => (
                        <ProductCard key={index} product={product} />
                    ))}
                </div>
                <div className="mt-12 text-center">
                    <Link
                        className="inline-flex items-center border-b border-transparent pb-1 font-medium text-white transition-colors hover:border-primary hover:text-primary"
                        href="#"
                    >
                        Visit Online Store
                    </Link>
                </div>
            </div>
        </section>
    );
}
