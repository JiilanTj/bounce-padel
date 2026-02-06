import PublicLayout from '@/Layouts/PublicLayout';
import { WebsiteSettings } from '@/Pages/Welcome';
import { formatCurrency } from '@/utils/currency';
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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

type CartItem = MenuItem & {
    quantity: number;
};

type Props = {
    menus: Menu[];
    categories: Category[];
    settings: WebsiteSettings | null;
};

export default function CafeResto({ menus, categories, settings }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedMenu, setSelectedMenu] = useState<string>('all');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [validating, setValidating] = useState(false);
    const [scanningQr, setScanningQr] = useState(false);
    const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cafe_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cafe_cart', JSON.stringify(cart));
    }, [cart]);

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

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cafe_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item: MenuItem) => {
        const existing = cart.find((c) => c.id === item.id);
        if (existing) {
            setCart(
                cart.map((c) =>
                    c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
                ),
            );
            toast.success(`${item.name} ditambahkan ke keranjang`);
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
            toast.success(`${item.name} ditambahkan ke keranjang`);
        }
    };

    const removeFromCart = (itemId: number) => {
        setCart(cart.filter((c) => c.id !== itemId));
    };

    const updateQuantity = (itemId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            setCart(
                cart.map((c) => (c.id === itemId ? { ...c, quantity } : c)),
            );
        }
    };

    const getTotalPrice = () => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const getTotalQuantity = () => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    const startQrScanner = async () => {
        setScanningQr(true);
        const qrCodeScanner = new Html5Qrcode('qr-reader');
        setHtml5QrCode(qrCodeScanner);

        try {
            await qrCodeScanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    qrCodeScanner.stop();
                    setScanningQr(false);
                    setQrCode(decodedText);
                    handleValidateQr(decodedText);
                },
                () => {
                    // Error callback - ignore
                },
            );
        } catch (err) {
            toast.error('Gagal mengakses kamera');
            setScanningQr(false);
        }
    };

    const stopQrScanner = () => {
        if (html5QrCode) {
            html5QrCode
                .stop()
                .then(() => {
                    setScanningQr(false);
                })
                .catch(() => {
                    setScanningQr(false);
                });
        }
    };

    const handleValidateQr = async (code?: string) => {
        const qrToValidate = code || qrCode;

        if (!qrToValidate.trim()) {
            toast.error('Masukkan kode QR meja');
            return;
        }

        if (!customerName.trim()) {
            toast.error('Masukkan nama Anda');
            return;
        }

        setValidating(true);

        try {
            const response = await fetch(route('validate.table.qr'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({ qr_code: qrToValidate }),
            });

            const data = await response.json();

            if (data.valid) {
                toast.success(
                    `Pesanan berhasil! Meja ${data.table.number} - ${customerName}`,
                );
                // TODO: Send order to backend
                console.log('Order:', {
                    table: data.table,
                    customer: customerName,
                    items: cart,
                    total: getTotalPrice(),
                });
                setCart([]);
                setShowCart(false);
                setCustomerName('');
                setQrCode('');
            } else {
                toast.error(data.message || 'Kode QR tidak valid');
            }
        } catch (error) {
            toast.error('Gagal memvalidasi kode QR');
        } finally {
            setValidating(false);
        }
    };

    return (
        <PublicLayout title="Cafe & Resto - Bounce Padel" settings={settings}>
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
                            🍽️ Cafe & Restaurant
                        </span>
                        <h1 className="font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                            Cafe &
                            <span className="block text-primary">Resto</span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
                            Nikmati berbagai pilihan makanan dan minuman segar
                            setelah bermain padel. Tempat sempurna untuk
                            bersantai bersama teman.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filter Section */}
            <section className="border-b border-landing-border bg-surface-dark py-6">
                <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedMenu('all')}
                                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                                    selectedMenu === 'all'
                                        ? 'bg-primary text-black'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
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
                                    className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                                        selectedMenu === menu.id.toString()
                                            ? 'bg-primary text-black'
                                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                    }`}
                                >
                                    {menu.name}
                                </button>
                            ))}
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                                    selectedCategory === 'all'
                                        ? 'bg-primary text-black'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                            >
                                Semua Kategori
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() =>
                                        setSelectedCategory(cat.id.toString())
                                    }
                                    className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                                        selectedCategory === cat.id.toString()
                                            ? 'bg-primary text-black'
                                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* Cart Button */}
                        <button
                            onClick={() => setShowCart(true)}
                            className="relative flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-semibold text-black transition-all hover:bg-primary/90"
                        >
                            <span className="material-symbols-outlined text-xl">
                                shopping_cart
                            </span>
                            {getTotalQuantity() > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">
                                    {getTotalQuantity()}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </section>

            {/* Menu Items Grid */}
            <section className="bg-background-dark py-16 md:py-20">
                <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
                    {filteredItems.length === 0 ? (
                        <div className="rounded-2xl border border-landing-border bg-surface-dark p-12 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                                <span className="material-symbols-outlined text-3xl text-gray-400">
                                    restaurant
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                Tidak ada menu ditemukan
                            </h3>
                            <p className="mt-2 text-gray-400">
                                Coba ubah filter pencarian Anda
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="group overflow-hidden rounded-2xl border border-landing-border bg-surface-dark transition-all hover:border-primary/50"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 overflow-hidden bg-gray-800">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                                <span className="material-symbols-outlined text-6xl text-primary/50">
                                                    restaurant
                                                </span>
                                            </div>
                                        )}

                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/80 via-transparent to-transparent" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="mb-2">
                                            <span className="rounded-lg bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                                                {item.category?.name ||
                                                    'Lainnya'}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white">
                                            {item.name}
                                        </h3>

                                        {item.description && (
                                            <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                                                {item.description}
                                            </p>
                                        )}

                                        {/* Price */}
                                        <div className="mt-4 flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-primary">
                                                {formatCurrency(item.price)}
                                            </span>
                                        </div>

                                        {/* Order Button */}
                                        <button
                                            onClick={() => addToCart(item)}
                                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 font-semibold text-black transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                add_shopping_cart
                                            </span>
                                            Tambah
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Cart Modal */}
            {showCart && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-4">
                    <div className="h-[90vh] w-full overflow-hidden rounded-t-3xl border border-landing-border bg-surface-dark md:h-auto md:max-w-2xl md:rounded-3xl">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-landing-border p-6">
                            <h3 className="text-2xl font-bold text-white">
                                Keranjang Pesanan
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCart(false);
                                    if (scanningQr) stopQrScanner();
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                <span className="material-symbols-outlined">
                                    close
                                </span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-[calc(90vh-200px)] overflow-y-auto p-6 md:max-h-[60vh]">
                            {cart.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
                                        <span className="material-symbols-outlined text-4xl text-gray-400">
                                            shopping_cart
                                        </span>
                                    </div>
                                    <p className="text-gray-400">
                                        Keranjang Anda masih kosong
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Cart Items */}
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex gap-4 rounded-xl border border-landing-border bg-background-dark p-4"
                                            >
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-white">
                                                        {item.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-400">
                                                        {formatCurrency(
                                                            item.price,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.quantity -
                                                                    1,
                                                            )
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center text-white">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.quantity +
                                                                    1,
                                                            )
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            removeFromCart(
                                                                item.id,
                                                            )
                                                        }
                                                        className="ml-2 text-red-400 hover:text-red-300"
                                                    >
                                                        <span className="material-symbols-outlined">
                                                            delete
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total */}
                                    <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-semibold text-white">
                                                Total
                                            </span>
                                            <span className="text-2xl font-bold text-primary">
                                                {formatCurrency(
                                                    getTotalPrice(),
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="mt-6">
                                        <label
                                            htmlFor="customer_name"
                                            className="block text-sm font-medium text-gray-300"
                                        >
                                            Nama Anda
                                        </label>
                                        <input
                                            id="customer_name"
                                            type="text"
                                            value={customerName}
                                            onChange={(e) =>
                                                setCustomerName(e.target.value)
                                            }
                                            placeholder="Masukkan nama Anda"
                                            className="mt-2 block w-full rounded-lg border-landing-border bg-background-dark px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:ring-primary"
                                        />
                                    </div>

                                    {/* QR Code Section */}
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-300">
                                            Kode Meja
                                        </label>

                                        {scanningQr ? (
                                            <div className="mt-2">
                                                <div
                                                    id="qr-reader"
                                                    className="overflow-hidden rounded-lg"
                                                ></div>
                                                <button
                                                    onClick={stopQrScanner}
                                                    className="mt-3 w-full rounded-lg bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
                                                >
                                                    Batal Scan
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <input
                                                    id="qr_code"
                                                    type="text"
                                                    value={qrCode}
                                                    onChange={(e) =>
                                                        setQrCode(
                                                            e.target.value.toUpperCase(),
                                                        )
                                                    }
                                                    placeholder="QR-TABLE-001"
                                                    className="mt-2 block w-full rounded-lg border-landing-border bg-background-dark px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:ring-primary"
                                                />
                                                <button
                                                    onClick={startQrScanner}
                                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2 font-medium text-primary hover:bg-primary/20"
                                                >
                                                    <span className="material-symbols-outlined">
                                                        qr_code_scanner
                                                    </span>
                                                    Pindai QR Code
                                                </button>
                                            </>
                                        )}

                                        <p className="mt-2 text-xs text-gray-500">
                                            Scan QR code di meja atau masukkan
                                            kode manual
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        onClick={() => handleValidateQr()}
                                        disabled={validating || scanningQr}
                                        className="mt-6 w-full rounded-full bg-primary px-6 py-4 font-bold text-black transition-all hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {validating
                                            ? 'Memproses...'
                                            : 'Pesan Sekarang'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
