export default function Stats() {
    const stats = [
        { value: '12', label: 'Lapangan Indoor' },
        { value: '4', label: 'Suite VIP' },
        { value: '24/7', label: 'Akses' },
        { value: '500+', label: 'Anggota' },
    ];

    return (
        <div className="w-full border-b border-landing-border bg-surface-dark">
            <div className="mx-auto max-w-[1280px] px-6 py-12">
                <div className="grid grid-cols-2 gap-8 divide-x divide-white/10 text-center md:grid-cols-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-white md:text-4xl">
                                {stat.value}
                            </span>
                            <span className="text-sm uppercase tracking-wide text-text-dim">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
