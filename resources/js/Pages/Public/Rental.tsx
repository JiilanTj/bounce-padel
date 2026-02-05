import PublicLayout from '@/Layouts/PublicLayout';
import { WebsiteSettings } from '@/Pages/Welcome';
import { formatCurrency } from '@/utils/currency';
import { router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Category = {
    id: number;
    name: string;
    type: 'product' | 'menu';
};

type Product = {
    id: number;
    category_id: number;
    name: string;
    sku: string | null;
    description: string | null;
    price_rent: number;
    stock_rent: number;
    image_path?: string | null;
    type: 'rent';
    category?: Category;
};

type Props = {
    products: Product[];
    categories: Category[];
    filters: {
        search: string | null;
        category_id: string | null;
    };
    settings: WebsiteSettings | null;
};

export default function Rental({
    products,
    categories,
    filters,
    settings,
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(
        filters.category_id || 'all',
    );

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route('public.rental'),
            {
                search: searchQuery || undefined,
                category_id:
                    selectedCategory !== 'all' ? selectedCategory : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleCategoryFilter = (categoryId: string) => {
        setSelectedCategory(categoryId);
        router.get(
            route('public.rental'),
            {
                search: searchQuery || undefined,
                category_id: categoryId !== 'all' ? categoryId : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <PublicLayout title="Rental Alat - Bounce Padel" settings={settings}>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-background-dark py-20 md:py-28">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2315BD49' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />
                </div>

                <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
                    <div className="text-center">
                        <span className="mb-4 inline-block rounded-full bg-primary/20 px-4 py-2 text-sm font-medium text-primary">
                            🏸 Sewa Peralatan Padel
                        </span>
                        <h1 className="font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                            Rental
                            <span className="block text-primary">
                                Peralatan
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
                            Sewa peralatan padel berkualitas tinggi untuk
                            permainan yang lebih optimal. Semua alat tersedia
                            dalam kondisi prima.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filters Section */}
            <section className="border-b border-landing-border bg-surface-dark py-6">
                <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* Search */}
                        <form
                            onSubmit={handleSearch}
                            className="flex-1 md:max-w-md"
                        >
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    search
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Cari peralatan..."
                                    className="block w-full rounded-full border-landing-border bg-background-dark py-3 pl-12 pr-4 text-white placeholder-gray-500 transition-colors focus:border-primary focus:ring-primary"
                                />
                            </div>
                        </form>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleCategoryFilter('all')}
                                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                                    selectedCategory === 'all'
                                        ? 'bg-primary text-black'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                            >
                                Semua
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() =>
                                        handleCategoryFilter(
                                            category.id.toString(),
                                        )
                                    }
                                    className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                                        selectedCategory ===
                                        category.id.toString()
                                            ? 'bg-primary text-black'
                                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="bg-background-dark py-16 md:py-20">
                <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
                    {products.length === 0 ? (
                        <div className="rounded-2xl border border-landing-border bg-surface-dark p-12 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                                <span className="material-symbols-outlined text-3xl text-gray-400">
                                    sports_tennis
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                Tidak ada peralatan ditemukan
                            </h3>
                            <p className="mt-2 text-gray-400">
                                Coba ubah filter pencarian Anda
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="group overflow-hidden rounded-2xl border border-landing-border bg-surface-dark transition-all hover:border-primary/50"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 overflow-hidden bg-gray-800">
                                        {product.image_path ? (
                                            <img
                                                src={product.image_path}
                                                alt={product.name}
                                                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                                <span className="material-symbols-outlined text-6xl text-primary/50">
                                                    sports_handball
                                                </span>
                                            </div>
                                        )}

                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/80 via-transparent to-transparent" />

                                        {/* Stock Badge */}
                                        <div className="absolute right-4 top-4">
                                            <span className="rounded-full bg-orange-500/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                                                Stock: {product.stock_rent}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="mb-2">
                                            <span className="rounded-lg bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                                                {product.category?.name}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white">
                                            {product.name}
                                        </h3>

                                        {product.description && (
                                            <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                                                {product.description}
                                            </p>
                                        )}

                                        {/* Price */}
                                        <div className="mt-4 flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-primary">
                                                {formatCurrency(
                                                    product.price_rent,
                                                )}
                                            </span>
                                            <span className="text-sm text-gray-400">
                                                /hari
                                            </span>
                                        </div>

                                        {/* Rent Button */}
                                        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-black transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25">
                                            <span>Sewa Sekarang</span>
                                            <span className="material-symbols-outlined text-xl">
                                                shopping_cart
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
