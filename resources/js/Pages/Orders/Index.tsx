import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface MenuItem {
    id: number;
    name: string;
    price: number;
}

interface OrderItem {
    id: number;
    order_id: number;
    menu_item_id: number;
    quantity: number;
    price: number;
    menu_item: MenuItem;
}

interface Table {
    id: number;
    number: string;
}

interface Order {
    id: number;
    table_id: number;
    customer_name: string;
    type: string;
    status: string;
    total_amount: number;
    created_at: string;
    table: Table;
    items: OrderItem[];
}

interface Stats {
    total: number;
    new: number;
    processing: number;
    ready: number;
    total_revenue: number;
}

interface Props extends PageProps {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        sort_by?: string;
        sort_order?: string;
    };
    stats: Stats;
}

const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-green-100 text-green-800',
    delivered: 'bg-purple-100 text-purple-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    paid: 'bg-emerald-100 text-emerald-800',
};

const statusLabels = {
    new: 'Baru',
    processing: 'Diproses',
    ready: 'Siap',
    delivered: 'Diantar',
    completed: 'Selesai',
    cancelled: 'Batal',
    paid: 'Lunas',
};

export default function Index({ orders, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('orders.index'),
            { search, status: selectedStatus },
            { preserveState: true },
        );
    };

    const handleStatusFilter = (status: string) => {
        setSelectedStatus(status);
        router.get(
            route('orders.index'),
            { search, status: status || undefined },
            { preserveState: true },
        );
    };

    const handleUpdateStatus = (orderId: number, newStatus: string) => {
        router.patch(
            route('orders.update-status', orderId),
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Success message will be shown from backend
                },
            },
        );
    };

    const toggleOrderDetails = (orderId: number) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Pesanan Cafe & Resto
                </h2>
            }
        >
            <Head title="Pesanan Cafe & Resto" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Total Pesanan
                            </div>
                            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {stats.total}
                            </div>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-4 shadow dark:bg-blue-900/20">
                            <div className="text-sm text-blue-600 dark:text-blue-400">
                                Pesanan Baru
                            </div>
                            <div className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">
                                {stats.new}
                            </div>
                        </div>
                        <div className="rounded-lg bg-yellow-50 p-4 shadow dark:bg-yellow-900/20">
                            <div className="text-sm text-yellow-600 dark:text-yellow-400">
                                Diproses
                            </div>
                            <div className="mt-1 text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                                {stats.processing}
                            </div>
                        </div>
                        <div className="rounded-lg bg-green-50 p-4 shadow dark:bg-green-900/20">
                            <div className="text-sm text-green-600 dark:text-green-400">
                                Siap Diantar
                            </div>
                            <div className="mt-1 text-2xl font-bold text-green-700 dark:text-green-300">
                                {stats.ready}
                            </div>
                        </div>
                        <div className="rounded-lg bg-emerald-50 p-4 shadow dark:bg-emerald-900/20">
                            <div className="text-sm text-emerald-600 dark:text-emerald-400">
                                Total Pendapatan
                            </div>
                            <div className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                {formatCurrency(stats.total_revenue)}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Cari nama customer atau meja..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                />
                                <button
                                    type="submit"
                                    className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
                                >
                                    Cari
                                </button>
                            </div>
                        </form>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleStatusFilter('')}
                                className={`rounded-md px-4 py-2 ${
                                    selectedStatus === ''
                                        ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                            >
                                Semua
                            </button>
                            {Object.entries(statusLabels).map(
                                ([status, label]) => (
                                    <button
                                        key={status}
                                        onClick={() =>
                                            handleStatusFilter(status)
                                        }
                                        className={`rounded-md px-4 py-2 ${
                                            selectedStatus === status
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-4">
                        {orders.data.length === 0 ? (
                            <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Tidak ada pesanan
                                </p>
                            </div>
                        ) : (
                            orders.data.map((order) => (
                                <div
                                    key={order.id}
                                    className="rounded-lg bg-white shadow dark:bg-gray-800"
                                >
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                        Order #{order.id}
                                                    </h3>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                            statusColors[
                                                                order.status as keyof typeof statusColors
                                                            ]
                                                        }`}
                                                    >
                                                        {
                                                            statusLabels[
                                                                order.status as keyof typeof statusLabels
                                                            ]
                                                        }
                                                    </span>
                                                </div>
                                                <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <p>
                                                        <span className="font-medium">
                                                            Customer:
                                                        </span>{' '}
                                                        {order.customer_name}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">
                                                            Meja:
                                                        </span>{' '}
                                                        {order.table.number}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">
                                                            Waktu:
                                                        </span>{' '}
                                                        {new Date(
                                                            order.created_at,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">
                                                            Total Item:
                                                        </span>{' '}
                                                        {order.items.reduce(
                                                            (sum, item) =>
                                                                sum +
                                                                item.quantity,
                                                            0,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(
                                                        order.total_amount,
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        toggleOrderDetails(
                                                            order.id,
                                                        )
                                                    }
                                                    className="mt-2 text-sm text-primary hover:underline"
                                                >
                                                    {expandedOrder === order.id
                                                        ? 'Tutup Detail'
                                                        : 'Lihat Detail'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        {expandedOrder === order.id && (
                                            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                                                <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                                                    Item Pesanan:
                                                </h4>
                                                <div className="space-y-2">
                                                    {order.items.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex justify-between text-sm"
                                                        >
                                                            <div className="text-gray-700 dark:text-gray-300">
                                                                {
                                                                    item
                                                                        .menu_item
                                                                        .name
                                                                }{' '}
                                                                x{' '}
                                                                {item.quantity}
                                                            </div>
                                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                                {formatCurrency(
                                                                    item.price *
                                                                        item.quantity,
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Status Actions */}
                                        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                                            {order.status === 'new' && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateStatus(
                                                                order.id,
                                                                'processing',
                                                            )
                                                        }
                                                        className="rounded-md bg-yellow-500 px-4 py-2 text-sm text-white hover:bg-yellow-600"
                                                    >
                                                        Mulai Proses
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateStatus(
                                                                order.id,
                                                                'cancelled',
                                                            )
                                                        }
                                                        className="rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                                                    >
                                                        Batalkan
                                                    </button>
                                                </>
                                            )}
                                            {order.status === 'processing' && (
                                                <button
                                                    onClick={() =>
                                                        handleUpdateStatus(
                                                            order.id,
                                                            'ready',
                                                        )
                                                    }
                                                    className="rounded-md bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
                                                >
                                                    Siap Diantar
                                                </button>
                                            )}
                                            {order.status === 'ready' && (
                                                <button
                                                    onClick={() =>
                                                        handleUpdateStatus(
                                                            order.id,
                                                            'delivered',
                                                        )
                                                    }
                                                    className="rounded-md bg-purple-500 px-4 py-2 text-sm text-white hover:bg-purple-600"
                                                >
                                                    Sudah Diantar
                                                </button>
                                            )}
                                            {order.status === 'delivered' && (
                                                <button
                                                    onClick={() =>
                                                        handleUpdateStatus(
                                                            order.id,
                                                            'completed',
                                                        )
                                                    }
                                                    className="rounded-md bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600"
                                                >
                                                    Selesai
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {orders.last_page > 1 && (
                        <div className="mt-6 flex items-center justify-between rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Halaman {orders.current_page} dari{' '}
                                {orders.last_page}
                            </div>
                            <div className="flex gap-2">
                                {orders.current_page > 1 && (
                                    <button
                                        onClick={() =>
                                            router.get(
                                                route('orders.index', {
                                                    page:
                                                        orders.current_page - 1,
                                                    search,
                                                    status: selectedStatus,
                                                }),
                                            )
                                        }
                                        className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                                    >
                                        Sebelumnya
                                    </button>
                                )}
                                {orders.current_page < orders.last_page && (
                                    <button
                                        onClick={() =>
                                            router.get(
                                                route('orders.index', {
                                                    page:
                                                        orders.current_page + 1,
                                                    search,
                                                    status: selectedStatus,
                                                }),
                                            )
                                        }
                                        className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
                                    >
                                        Selanjutnya
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
