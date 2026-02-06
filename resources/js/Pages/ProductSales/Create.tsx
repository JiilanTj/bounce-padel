import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Product = {
    id: number;
    name: string;
    sku: string | null;
    price_buy: number;
    stock_buy: number;
    image_path: string | null;
    category: {
        id: number;
        name: string;
    };
};

type Category = {
    id: number;
    name: string;
};

type Props = PageProps & {
    products: Product[];
    categories: Category[];
};

type CartItem = {
    product_id: number;
    product: Product;
    quantity: number;
    notes: string;
};

export default function Create({ products, categories }: Props) {
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [notes, setNotes] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const filteredProducts = products.filter((p) => {
        const matchCategory =
            selectedCategory === 'all' ||
            p.category.id === parseInt(selectedCategory);
        const matchSearch =
            searchQuery === '' ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchCategory && matchSearch;
    });

    const addToCart = (product: Product) => {
        const existing = cart.find((item) => item.product_id === product.id);
        if (existing) {
            setCart(
                cart.map((item) =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                ),
            );
        } else {
            setCart([
                ...cart,
                {
                    product_id: product.id,
                    product,
                    quantity: 1,
                    notes: '',
                },
            ]);
        }
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            setCart(cart.filter((item) => item.product_id !== productId));
        } else {
            setCart(
                cart.map((item) =>
                    item.product_id === productId
                        ? { ...item, quantity }
                        : item,
                ),
            );
        }
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter((item) => item.product_id !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce(
            (sum, item) => sum + item.product.price_buy * item.quantity,
            0,
        );
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!customerName || !customerEmail || !customerPhone) {
            setErrors({ customer: 'Please fill in all customer information' });
            return;
        }

        if (cart.length === 0) {
            setErrors({ cart: 'Please add at least one product to the cart' });
            return;
        }

        router.post(route('product-sales.store'), {
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            items: cart.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
                notes: item.notes,
            })),
            notes,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        New Product Sale
                    </h2>
                    <Link
                        href={route('product-sales.index')}
                        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                        ← Back to Sales
                    </Link>
                </div>
            }
        >
            <Head title="New Product Sale" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Left: Products */}
                            <div className="lg:col-span-2">
                                <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                                    <div className="border-b border-gray-200 p-6">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Products
                                            </h3>
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) =>
                                                        setSearchQuery(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Search products..."
                                                    className="rounded-lg border-gray-300 text-sm"
                                                />
                                                <select
                                                    value={selectedCategory}
                                                    onChange={(e) =>
                                                        setSelectedCategory(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="rounded-lg border-gray-300 text-sm"
                                                >
                                                    <option value="all">
                                                        All Categories
                                                    </option>
                                                    {categories.map((cat) => (
                                                        <option
                                                            key={cat.id}
                                                            value={cat.id}
                                                        >
                                                            {cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-3">
                                        {filteredProducts.map((product) => (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={() =>
                                                    addToCart(product)
                                                }
                                                disabled={
                                                    product.stock_buy <= 0
                                                }
                                                className="flex flex-col rounded-lg border border-gray-300 p-4 transition hover:border-blue-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {product.image_path && (
                                                    <img
                                                        src={product.image_path}
                                                        alt={product.name}
                                                        className="mb-3 h-32 w-full rounded-md object-cover"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">
                                                        {product.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {product.category.name}
                                                    </p>
                                                    <p className="mt-2 text-sm font-semibold text-green-600">
                                                        {formatCurrency(
                                                            product.price_buy,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="mt-2 text-xs text-gray-600">
                                                    Stock: {product.stock_buy}
                                                </div>
                                            </button>
                                        ))}

                                        {filteredProducts.length === 0 && (
                                            <div className="col-span-full py-8 text-center text-gray-500">
                                                No products available
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Customer & Cart */}
                            <div className="space-y-6">
                                {/* Customer Info */}
                                <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                            Customer Information
                                        </h3>

                                        {errors.customer && (
                                            <p className="mb-4 text-sm text-red-600">
                                                {errors.customer}
                                            </p>
                                        )}

                                        <div className="space-y-4">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={customerName}
                                                    onChange={(e) =>
                                                        setCustomerName(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border-gray-300"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    value={customerEmail}
                                                    onChange={(e) =>
                                                        setCustomerEmail(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border-gray-300"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Phone *
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={customerPhone}
                                                    onChange={(e) =>
                                                        setCustomerPhone(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border-gray-300"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cart */}
                                <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                            Cart
                                        </h3>

                                        {errors.cart && (
                                            <p className="mb-4 text-sm text-red-600">
                                                {errors.cart}
                                            </p>
                                        )}

                                        {cart.length === 0 ? (
                                            <p className="text-center text-sm text-gray-500">
                                                Cart is empty
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {cart.map((item) => (
                                                    <div
                                                        key={item.product_id}
                                                        className="flex items-center justify-between border-b border-gray-200 pb-3"
                                                    >
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                {
                                                                    item.product
                                                                        .name
                                                                }
                                                            </h4>
                                                            <p className="text-xs text-gray-500">
                                                                {formatCurrency(
                                                                    item.product
                                                                        .price_buy,
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.product_id,
                                                                        item.quantity -
                                                                            1,
                                                                    )
                                                                }
                                                                className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="w-8 text-center text-sm">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.product_id,
                                                                        item.quantity +
                                                                            1,
                                                                    )
                                                                }
                                                                disabled={
                                                                    item.quantity >=
                                                                    item.product
                                                                        .stock_buy
                                                                }
                                                                className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300 disabled:opacity-50"
                                                            >
                                                                +
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeFromCart(
                                                                        item.product_id,
                                                                    )
                                                                }
                                                                className="ml-2 text-red-600 hover:text-red-800"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="border-t border-gray-300 pt-3">
                                                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                                                        <span>Total:</span>
                                                        <span>
                                                            {formatCurrency(
                                                                calculateTotal(),
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-6">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Notes (Optional)
                                            </label>
                                            <textarea
                                                value={notes}
                                                onChange={(e) =>
                                                    setNotes(e.target.value)
                                                }
                                                rows={3}
                                                className="w-full rounded-lg border-gray-300"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={cart.length === 0}
                                            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                        >
                                            Complete Sale
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
