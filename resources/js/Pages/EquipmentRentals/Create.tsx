import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Product = {
    id: number;
    name: string;
    sku: string | null;
    price_rent: number;
    stock_rent: number;
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
    const [rentalDuration, setRentalDuration] = useState(1);
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
            if (existing.quantity < product.stock_rent) {
                setCart(
                    cart.map((item) =>
                        item.product_id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item,
                    ),
                );
            }
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
        const item = cart.find((i) => i.product_id === productId);
        if (!item) return;

        if (quantity <= 0) {
            setCart(cart.filter((item) => item.product_id !== productId));
        } else if (quantity <= item.product.stock_rent) {
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
            (sum, item) =>
                sum + item.product.price_rent * item.quantity * rentalDuration,
            0,
        );
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        if (!customerName.trim())
            newErrors.customer = 'Customer name is required';
        if (!customerEmail.trim())
            newErrors.customer = 'Customer email is required';
        if (!customerPhone.trim())
            newErrors.customer = 'Customer phone is required';
        if (cart.length === 0) newErrors.cart = 'Add at least one item';
        if (rentalDuration < 1)
            newErrors.duration = 'Rental duration must be at least 1 hour';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        router.post(route('equipment-rentals.store'), {
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            rental_duration: rentalDuration,
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
                    <h1 className="text-xl font-semibold text-gray-900">
                        New Equipment Rental
                    </h1>
                    <Link
                        href={route('equipment-rentals.index')}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Back to Rentals
                    </Link>
                </div>
            }
        >
            <Head title="New Equipment Rental" />

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left: Products */}
                    <div className="lg:col-span-2">
                        <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                            <div className="border-b border-gray-200 p-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Equipment
                                    </h3>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            placeholder="Search equipment..."
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
                                        onClick={() => addToCart(product)}
                                        disabled={product.stock_rent <= 0}
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
                                                    product.price_rent,
                                                )}
                                                /jam
                                            </p>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-600">
                                            Stock: {product.stock_rent}
                                        </div>
                                    </button>
                                ))}

                                {filteredProducts.length === 0 && (
                                    <div className="col-span-full py-8 text-center text-gray-500">
                                        No equipment available for rent
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
                                                setCustomerName(e.target.value)
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
                                                setCustomerEmail(e.target.value)
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
                                                setCustomerPhone(e.target.value)
                                            }
                                            className="w-full rounded-lg border-gray-300"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rental Duration */}
                        <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                    Rental Duration
                                </h3>

                                {errors.duration && (
                                    <p className="mb-4 text-sm text-red-600">
                                        {errors.duration}
                                    </p>
                                )}

                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        min={1}
                                        value={rentalDuration}
                                        onChange={(e) =>
                                            setRentalDuration(
                                                parseInt(e.target.value) || 1,
                                            )
                                        }
                                        className="w-24 rounded-lg border-gray-300"
                                    />
                                    <span className="text-gray-600">jam</span>
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
                                    <p className="text-gray-500">
                                        No items in cart
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <div
                                                key={item.product_id}
                                                className="flex items-center justify-between border-b border-gray-100 pb-4"
                                            >
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">
                                                        {item.product.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        {formatCurrency(
                                                            item.product
                                                                .price_rent,
                                                        )}
                                                        /jam × {rentalDuration}{' '}
                                                        jam
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
                                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center">
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
                                                                .stock_rent
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
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
                                                        className="ml-2 text-red-500 hover:text-red-700"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex justify-between text-lg font-semibold">
                                                <span>Total:</span>
                                                <span className="text-green-600">
                                                    {formatCurrency(
                                                        calculateTotal(),
                                                    )}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">
                                                {cart.reduce(
                                                    (sum, item) =>
                                                        sum + item.quantity,
                                                    0,
                                                )}{' '}
                                                item × {rentalDuration} jam
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                            <div className="p-6">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border-gray-300"
                                    placeholder="Additional notes..."
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={cart.length === 0}
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Start Rental
                        </button>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
