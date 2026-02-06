import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { formatCurrency } from '@/utils/currency';
import {
    MagnifyingGlassIcon,
    MinusIcon,
    PlusIcon,
    ShoppingCartIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
}

interface MenuItem {
    id: number;
    menu_id: number;
    category_id: number;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_available: boolean;
    category: Category | null;
}

interface Menu {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    items: MenuItem[];
}

interface Table {
    id: number;
    number: string;
    qr_code: string;
}

interface CartItem extends MenuItem {
    quantity: number;
}

interface Props extends PageProps {
    menus: Menu[];
    categories: Category[];
    tables: Table[];
}

export default function Index({ menus, categories, tables }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedMenu, setSelectedMenu] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [selectedTable, setSelectedTable] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    // Get all items from all menus
    const allItems = menus.flatMap((menu) => menu.items);

    // Filter items
    const filteredItems = allItems.filter((item) => {
        const matchCategory =
            selectedCategory === 'all' ||
            item.category_id === parseInt(selectedCategory);
        const matchMenu =
            selectedMenu === 'all' || item.menu_id === parseInt(selectedMenu);
        const matchSearch =
            search === '' ||
            item.name.toLowerCase().includes(search.toLowerCase());
        return matchCategory && matchMenu && matchSearch && item.is_available;
    });

    const addToCart = (item: MenuItem) => {
        const existingItem = cart.find((cartItem) => cartItem.id === item.id);

        if (existingItem) {
            setCart(
                cart.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem,
                ),
            );
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
        toast.success(`${item.name} ditambahkan ke keranjang`);
    };

    const updateQuantity = (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }

        setCart(
            cart.map((item) =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item,
            ),
        );
    };

    const removeFromCart = (itemId: number) => {
        setCart(cart.filter((item) => item.id !== itemId));
    };

    const getTotalAmount = () => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const getTotalItems = () => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cart.length === 0) {
            toast.error('Keranjang masih kosong');
            return;
        }

        if (!customerName.trim()) {
            toast.error('Masukkan nama pelanggan');
            return;
        }

        if (!selectedTable) {
            toast.error('Pilih meja');
            return;
        }

        setSubmitting(true);

        try {
            await router.post(
                route('pos.store'),
                {
                    table_id: selectedTable,
                    customer_name: customerName,
                    items: cart.map((item) => ({
                        id: item.id,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Pesanan berhasil dibuat!');
                        setCart([]);
                        setCustomerName('');
                        setSelectedTable('');
                    },
                    onError: () => {
                        toast.error('Gagal membuat pesanan');
                    },
                    onFinish: () => {
                        setSubmitting(false);
                    },
                },
            );
        } catch (error) {
            toast.error('Gagal membuat pesanan');
            setSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-xl font-semibold text-gray-900">
                    Point of Sale - Cafe & Resto
                </h1>
            }
        >
            <Head title="POS - Cafe & Resto" />

            {/* Customer Info & Filters */}
            <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Customer Name */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Nama Pelanggan
                    </label>
                    <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nama pelanggan..."
                        className="block w-full rounded-lg border-gray-300 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                {/* Table Selection */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Pilih Meja
                    </label>
                    <select
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="">Pilih meja...</option>
                        {tables.map((table) => (
                            <option key={table.id} value={table.id}>
                                {table.number}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Search */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Cari Menu
                    </label>
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari menu..."
                            className="block w-full rounded-lg border-gray-300 pl-10 pr-4 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Cart Summary */}
                <div className="flex items-end">
                    <div className="w-full rounded-lg bg-blue-50 px-4 py-2 text-center">
                        <div className="text-xs font-medium text-gray-600">
                            Total Keranjang
                        </div>
                        <div className="mt-1 flex items-center justify-center gap-2">
                            <ShoppingCartIcon className="h-5 w-5 text-blue-600" />
                            <span className="text-lg font-bold text-gray-900">
                                {formatCurrency(getTotalAmount())}
                            </span>
                            {cart.length > 0 && (
                                <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                                    {getTotalItems()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category & Menu Filters */}
            <div className="mb-4 overflow-hidden bg-white shadow sm:rounded-lg">
                <div className="p-4">
                    <div className="mb-3">
                        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500">
                            Kategori
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    selectedCategory === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Semua
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() =>
                                        setSelectedCategory(
                                            category.id.toString(),
                                        )
                                    }
                                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                        selectedCategory ===
                                        category.id.toString()
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500">
                            Menu
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedMenu('all')}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    selectedMenu === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Semua
                            </button>
                            {menus.map((menu) => (
                                <button
                                    key={menu.id}
                                    onClick={() =>
                                        setSelectedMenu(menu.id.toString())
                                    }
                                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                        selectedMenu === menu.id.toString()
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {menu.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Menu Items - 2/3 width */}
                <div className="lg:col-span-2">
                    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                            <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500">
                                Menu Items ({filteredItems.length})
                            </h2>
                        </div>
                        <div className="p-4">
                            {filteredItems.length === 0 ? (
                                <div className="py-12 text-center text-gray-500">
                                    Tidak ada menu yang tersedia
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {filteredItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => addToCart(item)}
                                            className="group rounded-lg border border-gray-200 bg-white p-3 text-left transition-all hover:border-blue-500 hover:shadow-md"
                                        >
                                            {item.image_url && (
                                                <div className="mb-2 aspect-square overflow-hidden rounded-md bg-gray-100">
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                </div>
                                            )}
                                            <h3 className="mb-1 text-sm font-medium text-gray-900">
                                                {item.name}
                                            </h3>
                                            {item.category && (
                                                <p className="mb-2 text-xs text-gray-500">
                                                    {item.category.name}
                                                </p>
                                            )}
                                            <p className="text-sm font-bold text-blue-600">
                                                {formatCurrency(item.price)}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Shopping Cart - 1/3 width */}
                <div className="lg:col-span-1">
                    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500">
                                    Keranjang
                                </h2>
                                {cart.length > 0 && (
                                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                                        {getTotalItems()} items
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-4">
                            {cart.length === 0 ? (
                                <div className="py-8 text-center">
                                    <ShoppingCartIcon className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                                    <p className="text-sm text-gray-500">
                                        Keranjang kosong
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 max-h-96 space-y-3 overflow-y-auto">
                                        {cart.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-lg border border-gray-200 p-3"
                                            >
                                                <div className="mb-2 flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-500">
                                                            {formatCurrency(
                                                                item.price,
                                                            )}{' '}
                                                            / item
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            removeFromCart(
                                                                item.id,
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.id,
                                                                    item.quantity -
                                                                        1,
                                                                )
                                                            }
                                                            className="rounded bg-gray-100 p-1 hover:bg-gray-200"
                                                        >
                                                            <MinusIcon className="h-3 w-3" />
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-medium">
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
                                                            className="rounded bg-gray-100 p-1 hover:bg-gray-200"
                                                        >
                                                            <PlusIcon className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {formatCurrency(
                                                            item.price *
                                                                item.quantity,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total */}
                                    <div className="mb-4 border-t border-gray-200 pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">
                                                Subtotal
                                            </span>
                                            <span className="text-sm text-gray-900">
                                                {formatCurrency(
                                                    getTotalAmount(),
                                                )}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
                                            <span className="text-base font-bold text-gray-900">
                                                Total
                                            </span>
                                            <span className="text-xl font-bold text-blue-600">
                                                {formatCurrency(
                                                    getTotalAmount(),
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
                                    >
                                        {submitting
                                            ? 'Memproses...'
                                            : 'Buat Pesanan'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
