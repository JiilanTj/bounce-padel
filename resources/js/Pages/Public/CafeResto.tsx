import PublicLayout from '@/Layouts/PublicLayout';
import { WebsiteSettings } from '@/Pages/Welcome';
import { formatCurrency } from '@/utils/currency';
import { useState } from 'react';

type Category = {
    id: number;
    name: string;
};

type MenuItem = {
    id: number;
    menu_id: number;
    category_id: number;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_available: boolean;
    category: Category | null;
};

type Menu = {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    items: MenuItem[];
};

type Props = {
    menus: Menu[];
    categories: Category[];
    settings: WebsiteSettings | null;
};

export default function CafeResto({ menus, categories, settings }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedMenu, setSelectedMenu] = useState<string>('all');

    // Get all items from all menus
    const allItems = menus.flatMap((menu) => menu.items);

    // Filter items
    const filteredItems = allItems.filter((item) => {
        const matchCategory =
            selectedCategory === 'all' ||
            item.category_id === parseInt(selectedCategory);
        const matchMenu =
            selectedMenu === 'all' || item.menu_id === parseInt(selectedMenu);
        return matchCategory && matchMenu;
    });

    // Group items by category for display
    const groupedItems = filteredItems.reduce(
        (acc, item) => {
            const categoryName = item.category?.name || 'Lainnya';
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(item);
            return acc;
        },
        {} as Record<string, MenuItem[]>,
    );

    const generateWhatsAppURL = (item: MenuItem) => {
        if (!settings?.phone_number) return '#';

        const phoneNumber = settings.phone_number.replace(/[\s\-()]/g, '');

        const message = `Halo Bounce Padel!

Saya ingin memesan:

🍽️ *${item.name}*
💰 *Harga:* ${formatCurrency(item.price)}
${item.description ? `📝 *Deskripsi:* ${item.description}` : ''}

Mohon informasi ketersediaan dan cara pemesanan. Terima kasih!`;

        return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    };

    return (
        <PublicLayout title="Cafe & Resto - Bounce Padel" settings={settings}>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-background-dark via-[#1a3d24] to-background-dark py-20">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
                <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
                    <div className="text-center">
                        <span className="mb-4 inline-block rounded-full bg-primary/20 px-4 py-2 text-sm font-medium text-primary">
                            🍽️ Cafe & Restaurant
                        </span>
                        <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                            Nikmati Hidangan Lezat
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-gray-300">
                            Setelah bermain padel, nikmati berbagai pilihan
                            makanan dan minuman segar di cafe kami. Tempat
                            sempurna untuk bersantai bersama teman.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filter Section */}
            <section className="border-b border-landing-border bg-background-dark/95 py-6 backdrop-blur-md">
                <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedMenu('all')}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                    selectedMenu === 'all'
                                        ? 'bg-primary text-white'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                            >
                                Semua Menu
                            </button>
                            {menus.map((menu) => (
                                <button
                                    key={menu.id}
                                    onClick={() =>
                                        setSelectedMenu(menu.id.toString())
                                    }
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                        selectedMenu === menu.id.toString()
                                            ? 'bg-primary text-white'
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                    }`}
                                >
                                    {menu.name}
                                </button>
                            ))}
                        </div>

                        <select
                            value={selectedCategory}
                            onChange={(e) =>
                                setSelectedCategory(e.target.value)
                            }
                            className="rounded-lg border-white/20 bg-white/10 px-4 py-2 text-sm text-white focus:border-primary focus:ring-primary"
                        >
                            <option value="all" className="bg-gray-800">
                                Semua Kategori
                            </option>
                            {categories.map((cat) => (
                                <option
                                    key={cat.id}
                                    value={cat.id}
                                    className="bg-gray-800"
                                >
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            {/* Menu Items Grid */}
            <section className="bg-background-dark py-16">
                <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
                    {Object.keys(groupedItems).length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-xl text-gray-400">
                                Belum ada menu tersedia saat ini.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {Object.entries(groupedItems).map(
                                ([categoryName, items]) => (
                                    <div key={categoryName}>
                                        <h2 className="mb-6 text-2xl font-bold text-white">
                                            {categoryName}
                                        </h2>
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="group overflow-hidden rounded-2xl border border-landing-border bg-gradient-to-br from-white/5 to-white/0 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                                                >
                                                    {/* Image */}
                                                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-800">
                                                        {item.image_url ? (
                                                            <img
                                                                src={
                                                                    item.image_url
                                                                }
                                                                alt={item.name}
                                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <span className="text-6xl">
                                                                    🍽️
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-5">
                                                        <h3 className="mb-2 text-lg font-semibold text-white">
                                                            {item.name}
                                                        </h3>
                                                        {item.description && (
                                                            <p className="mb-4 line-clamp-2 text-sm text-gray-400">
                                                                {
                                                                    item.description
                                                                }
                                                            </p>
                                                        )}
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xl font-bold text-primary">
                                                                {formatCurrency(
                                                                    item.price,
                                                                )}
                                                            </span>
                                                            <a
                                                                href={generateWhatsAppURL(
                                                                    item,
                                                                )}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/80"
                                                            >
                                                                Pesan
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="border-t border-landing-border bg-gradient-to-br from-primary/20 to-background-dark py-16">
                <div className="mx-auto max-w-[1280px] px-6 text-center lg:px-10">
                    <h2 className="mb-4 text-3xl font-bold text-white">
                        Ingin Reservasi Meja?
                    </h2>
                    <p className="mb-8 text-gray-300">
                        Hubungi kami untuk reservasi meja atau pemesanan dalam
                        jumlah besar
                    </p>
                    {settings?.phone_number && (
                        <a
                            href={`https://wa.me/${settings.phone_number.replace(/[\s\-()]/g, '')}?text=${encodeURIComponent('Halo Bounce Padel! Saya ingin melakukan reservasi meja di cafe.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-white transition-colors hover:bg-primary/80"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Hubungi via WhatsApp
                        </a>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
