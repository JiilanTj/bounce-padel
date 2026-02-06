import PublicLayout from '@/Layouts/PublicLayout';

export interface WebsiteSettings {
    phone_number: string | null;
    email: string | null;
    location: string | null;
    location_link: string | null;
    facebook_link: string | null;
    instagram_link: string | null;
    twitter_link: string | null;
    opening_hours: string | null;
    operating_days: string | null;
    holiday_notes: string | null;
}

type Props = {
    settings: WebsiteSettings | null;
};

export default function Contact({ settings }: Props) {
    return (
        <PublicLayout title="Kontak - Bounce Padel" settings={settings}>
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
                            📞 Hubungi Kami
                        </span>
                        <h1 className="font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                            Kontak
                            <span className="block text-primary">Kami</span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
                            Siap melayani Anda 24/7. Hubungi kami untuk booking
                            lapangan, rental alat, atau pertanyaan seputar
                            Bounce Padel.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="bg-background-dark py-16 md:py-20">
                <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Contact Details */}
                        <div className="rounded-2xl border border-landing-border bg-surface-dark p-8">
                            <h2 className="mb-8 text-2xl font-bold text-white">
                                Informasi Kontak
                            </h2>

                            <div className="space-y-6">
                                {/* Phone */}
                                {settings?.phone_number && (
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                                            <span className="material-symbols-outlined text-xl text-primary">
                                                call
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">
                                                Telepon
                                            </h3>
                                            <a
                                                href={`tel:${settings.phone_number}`}
                                                className="text-gray-400 transition-colors hover:text-primary"
                                            >
                                                {settings.phone_number}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Email */}
                                {settings?.email && (
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                                            <span className="material-symbols-outlined text-xl text-primary">
                                                email
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">
                                                Email
                                            </h3>
                                            <a
                                                href={`mailto:${settings.email}`}
                                                className="text-gray-400 transition-colors hover:text-primary"
                                            >
                                                {settings.email}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Location */}
                                {settings?.location && (
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                                            <span className="material-symbols-outlined text-xl text-primary">
                                                location_on
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">
                                                Alamat
                                            </h3>
                                            {settings?.location_link ? (
                                                <a
                                                    href={
                                                        settings.location_link
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-400 transition-colors hover:text-primary"
                                                >
                                                    {settings.location}
                                                </a>
                                            ) : (
                                                <p className="text-gray-400">
                                                    {settings.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Social Media */}
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                                        <span className="material-symbols-outlined text-xl text-primary">
                                            share
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">
                                            Media Sosial
                                        </h3>
                                        <div className="mt-2 flex gap-3">
                                            {settings?.facebook_link && (
                                                <a
                                                    href={
                                                        settings.facebook_link
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
                                                >
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                    </svg>
                                                </a>
                                            )}
                                            {settings?.instagram_link && (
                                                <a
                                                    href={
                                                        settings.instagram_link
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-600 text-white transition-colors hover:bg-pink-700"
                                                >
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                    </svg>
                                                </a>
                                            )}
                                            {settings?.twitter_link && (
                                                <a
                                                    href={settings.twitter_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white transition-colors hover:bg-sky-600"
                                                >
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* WhatsApp CTA */}
                            <div className="mt-8 rounded-xl bg-green-500/20 p-6">
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-3xl text-green-400">
                                        chat
                                    </span>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white">
                                            Chat langsung dengan kami
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            Respon cepat untuk booking &
                                            informasi
                                        </p>
                                    </div>
                                    <a
                                        href={`https://wa.me/${settings?.phone_number?.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-lg bg-green-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-600"
                                    >
                                        Chat WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Google Maps */}
                        <div className="overflow-hidden rounded-2xl border border-landing-border bg-surface-dark">
                            <div className="p-6 pb-0">
                                <h2 className="mb-4 text-2xl font-bold text-white">
                                    Lokasi Kami
                                </h2>
                            </div>

                            {settings?.location_link ? (
                                <div className="h-96 w-full">
                                    <iframe
                                        src={
                                            settings.location_link.includes(
                                                'embed',
                                            )
                                                ? settings.location_link
                                                : `https://maps.google.com/maps?q=${encodeURIComponent(settings.location || 'Bounce Padel')}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                                        }
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Lokasi Bounce Padel"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-96 items-center justify-center bg-gray-800">
                                    <div className="text-center">
                                        <span className="material-symbols-outlined mb-4 text-5xl text-gray-600">
                                            location_on
                                        </span>
                                        <p className="text-gray-400">
                                            Peta lokasi akan ditampilkan di sini
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Operating Hours */}
                    {(settings?.opening_hours ||
                        settings?.operating_days ||
                        settings?.holiday_notes) && (
                        <div className="mt-12">
                            <h2 className="mb-8 text-center text-2xl font-bold text-white">
                                Jam Operasional
                            </h2>

                            <div className="mx-auto max-w-4xl">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {settings?.opening_hours && (
                                        <div className="group rounded-2xl border border-landing-border bg-surface-dark p-8 text-center transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                                            <div className="mb-4 flex justify-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 transition-transform group-hover:scale-110">
                                                    <span className="material-symbols-outlined text-3xl text-primary">
                                                        schedule
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 className="mb-2 text-lg font-semibold text-white">
                                                Jam Buka
                                            </h3>
                                            <p className="text-xl font-bold text-primary">
                                                {settings.opening_hours}
                                            </p>
                                        </div>
                                    )}

                                    {settings?.operating_days && (
                                        <div className="group rounded-2xl border border-landing-border bg-surface-dark p-8 text-center transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                                            <div className="mb-4 flex justify-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 transition-transform group-hover:scale-110">
                                                    <span className="material-symbols-outlined text-3xl text-primary">
                                                        calendar_month
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 className="mb-2 text-lg font-semibold text-white">
                                                Hari Operasional
                                            </h3>
                                            <p className="text-xl font-bold text-primary">
                                                {settings.operating_days}
                                            </p>
                                        </div>
                                    )}

                                    {settings?.holiday_notes && (
                                        <div className="group rounded-2xl border border-landing-border bg-surface-dark p-8 text-center transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 md:col-span-2">
                                            <div className="mb-4 flex justify-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 transition-transform group-hover:scale-110">
                                                    <span className="material-symbols-outlined text-3xl text-primary">
                                                        info
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 className="mb-2 text-lg font-semibold text-white">
                                                Catatan Khusus
                                            </h3>
                                            <p className="text-lg text-gray-300">
                                                {settings.holiday_notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
