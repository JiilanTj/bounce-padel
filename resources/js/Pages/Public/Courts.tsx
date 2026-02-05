import PublicLayout from '@/Layouts/PublicLayout';
import { WebsiteSettings } from '@/Pages/Welcome';
import { formatCurrency } from '@/utils/currency';
import { Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Court = {
    id: number;
    name: string;
    type: 'indoor' | 'outdoor';
    surface: string;
    status: string;
    price_per_hour: number;
    image_path?: string | null;
};

type Props = {
    courts: Court[];
    filters: {
        search: string | null;
        type: string | null;
    };
    settings: WebsiteSettings | null;
};

export default function Courts({ courts, filters, settings }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route('public.courts.index'),
            {
                search: searchQuery || undefined,
                type: selectedType !== 'all' ? selectedType : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleTypeFilter = (type: string) => {
        setSelectedType(type);
        router.get(
            route('public.courts.index'),
            {
                search: searchQuery || undefined,
                type: type !== 'all' ? type : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <PublicLayout title="Lapangan - Bounce Padel" settings={settings}>
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
                            🎾 Pilih Lapangan Favorit
                        </span>
                        <h1 className="font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                            Lapangan Padel
                            <span className="block text-primary">Premium</span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
                            Booking lapangan padel berkualitas tinggi dengan
                            mudah. Pilih dari koleksi lapangan indoor & outdoor
                            kami.
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
                                    placeholder="Cari lapangan..."
                                    className="block w-full rounded-full border-landing-border bg-background-dark py-3 pl-12 pr-4 text-white placeholder-gray-500 transition-colors focus:border-primary focus:ring-primary"
                                />
                            </div>
                        </form>

                        {/* Type Filter */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleTypeFilter('all')}
                                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                                    selectedType === 'all'
                                        ? 'bg-primary text-black'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => handleTypeFilter('indoor')}
                                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                                    selectedType === 'indoor'
                                        ? 'bg-primary text-black'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                            >
                                Indoor
                            </button>
                            <button
                                onClick={() => handleTypeFilter('outdoor')}
                                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                                    selectedType === 'outdoor'
                                        ? 'bg-primary text-black'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                            >
                                Outdoor
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Courts Grid */}
            <section className="bg-background-dark py-16 md:py-20">
                <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
                    {courts.length === 0 ? (
                        <div className="rounded-2xl border border-landing-border bg-surface-dark p-12 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                                <span className="material-symbols-outlined text-3xl text-gray-400">
                                    sports_tennis
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                Tidak ada lapangan ditemukan
                            </h3>
                            <p className="mt-2 text-gray-400">
                                Coba ubah filter pencarian Anda
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {courts.map((court) => (
                                <div
                                    key={court.id}
                                    className="group overflow-hidden rounded-2xl border border-landing-border bg-surface-dark transition-all hover:border-primary/50"
                                >
                                    {/* Image */}
                                    <div className="relative h-56 overflow-hidden">
                                        {court.image_path ? (
                                            <img
                                                src={court.image_path}
                                                alt={court.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                                <span className="material-symbols-outlined text-6xl text-primary/50">
                                                    sports_tennis
                                                </span>
                                            </div>
                                        )}

                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/80 via-transparent to-transparent" />

                                        {/* Type Badge */}
                                        <div className="absolute right-4 top-4">
                                            <span
                                                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                                                    court.type === 'indoor'
                                                        ? 'bg-indigo-500/90 text-white'
                                                        : 'bg-sky-500/90 text-white'
                                                }`}
                                            >
                                                {court.type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-white">
                                            {court.name}
                                        </h3>
                                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                                            <span className="material-symbols-outlined text-lg text-primary">
                                                grass
                                            </span>
                                            {court.surface}
                                        </div>

                                        {/* Price */}
                                        <div className="mt-4 flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-primary">
                                                {formatCurrency(
                                                    court.price_per_hour,
                                                )}
                                            </span>
                                            <span className="text-sm text-gray-400">
                                                /jam
                                            </span>
                                        </div>

                                        {/* Book Button */}
                                        <Link
                                            href={route(
                                                'public.courts.show',
                                                court.id,
                                            )}
                                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-black transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
                                        >
                                            <span>Booking Sekarang</span>
                                            <span className="material-symbols-outlined text-xl">
                                                arrow_forward
                                            </span>
                                        </Link>
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
