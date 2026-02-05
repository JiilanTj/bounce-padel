import PublicLayout from '@/Layouts/PublicLayout';
import { WebsiteSettings } from '@/Pages/Welcome';
import { Link } from '@inertiajs/react';

type Facility = {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    image_path: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
};

type Props = {
    facilities: Facility[];
    settings: WebsiteSettings | null;
};

export default function Facilities({ facilities, settings }: Props) {
    return (
        <PublicLayout title="Fasilitas - Bounce Padel" settings={settings}>
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
                            ✨ Fasilitas Premium
                        </span>
                        <h1 className="font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                            Fasilitas
                            <span className="block text-primary">
                                Bounce Padel
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
                            Nikmati berbagai fasilitas premium untuk kenyamanan
                            dan pengalaman bermain padel terbaik. Dari lapangan
                            berkualitas hingga layanan pendukung lengkap.
                        </p>
                    </div>
                </div>
            </section>

            {/* Facilities Grid */}
            <section className="bg-background-dark py-16 md:py-20">
                <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
                    {facilities.length === 0 ? (
                        <div className="rounded-2xl border border-landing-border bg-surface-dark p-12 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                                <span className="material-symbols-outlined text-3xl text-gray-400">
                                    home_work
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                Tidak ada fasilitas ditemukan
                            </h3>
                            <p className="mt-2 text-gray-400">
                                Fasilitas akan segera tersedia
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-4">
                            {facilities.map((facility) => (
                                <div
                                    key={facility.id}
                                    className="group overflow-hidden rounded-2xl border border-landing-border bg-surface-dark transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
                                >
                                    {/* Image/Icon Section */}
                                    <div className="relative h-48 overflow-hidden">
                                        {facility.image_path ? (
                                            <img
                                                src={facility.image_path}
                                                alt={facility.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                                {facility.icon ? (
                                                    <span className="material-symbols-outlined text-6xl text-primary/50">
                                                        {facility.icon}
                                                    </span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-6xl text-primary/50">
                                                        home
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/80 via-transparent to-transparent" />

                                        {/* Status Badge */}
                                        {facility.status === 'active' && (
                                            <div className="absolute right-4 top-4">
                                                <span className="rounded-full bg-green-500/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                                                    Tersedia
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white">
                                                    {facility.name}
                                                </h3>

                                                {facility.description && (
                                                    <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                                                        {facility.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Sort Order Badge */}
                                            {facility.sort_order > 0 && (
                                                <span className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                                    {facility.sort_order}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Call to Action */}
                    <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 p-8 text-center md:p-12">
                        <h3 className="text-2xl font-bold text-white md:text-3xl">
                            Siap untuk Bermain?
                        </h3>
                        <p className="mx-auto mt-3 max-w-xl text-gray-400">
                            Booking lapangan padel kami sekarang dan nikmati
                            pengalaman bermain terbaik dengan fasilitas lengkap.
                        </p>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Link
                                href="/lapangan"
                                className="flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-bold text-black transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
                            >
                                <span>Booking Lapangan</span>
                                <span className="material-symbols-outlined text-xl">
                                    sports_tennis
                                </span>
                            </Link>
                            <Link
                                href="/kontak"
                                className="flex items-center justify-center gap-2 rounded-full border-2 border-primary/50 px-8 py-3.5 font-bold text-white transition-all hover:bg-primary/10"
                            >
                                <span>Hubungi Kami</span>
                                <span className="material-symbols-outlined text-xl">
                                    phone
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
