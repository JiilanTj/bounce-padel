import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { printOrderReceipt } from '@/utils/printOrderReceipt';
import { printTableReceipt } from '@/utils/printTableReceipt';
import { PrinterIcon } from '@heroicons/react/24/outline';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface MenuItem {
    id: number;
    name: string;
    price: number;
}

interface OrderItem {
    id: number;
    order_id: number;
    item_id: number;
    quantity: number;
    price: number;
    subtotal: number;
    item: MenuItem;
}

interface Table {
    id: number;
    number: string;
}

interface Order {
    id: number;
    table_id: number | null;
    customer_name: string;
    type: string;
    status: string;
    total_amount: number;
    created_at: string;
    table: Table | null;
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

export default function Index({
    orders,
    filters,
    stats,
    tables,
}: Props & { tables: Table[] }) {
    const { auth } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const [lastOrderCount, setLastOrderCount] = useState(stats.new);
    const [printModal, setPrintModal] = useState<{
        isOpen: boolean;
        tableId: string;
        startTime: string;
        endTime: string;
        loading: boolean;
    }>({
        isOpen: false,
        tableId: '',
        startTime: '',
        endTime: '',
        loading: false,
    });
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio('/bell.mp3');
    }, []);

    // Real-time polling for new orders
    useEffect(() => {
        const interval = setInterval(() => {
            // Silently fetch latest stats
            fetch(route('orders.stats'), {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    const newOrderCount = data.new;

                    // If there are more new orders than before
                    if (newOrderCount > lastOrderCount) {
                        // Play bell sound
                        if (audioRef.current) {
                            audioRef.current.play().catch(() => {
                                // Ignore audio play errors (e.g., user hasn't interacted with page)
                            });
                        }

                        // Show toast notification
                        toast.success(
                            `Ada ${newOrderCount - lastOrderCount} pesanan baru!`,
                            {
                                duration: 5000,
                            },
                        );

                        // Update last count
                        setLastOrderCount(newOrderCount);

                        // Refresh the page data
                        router.reload({ only: ['orders', 'stats'] });
                    }
                })
                .catch(() => {
                    // Silently fail
                });
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [lastOrderCount]);

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

    const handlePrintReceipt = async () => {
        if (
            !printModal.tableId ||
            !printModal.startTime ||
            !printModal.endTime
        ) {
            toast.error('Mohon lengkapi semua field');
            return;
        }

        setPrintModal((prev) => ({ ...prev, loading: true }));

        try {
            const response = await fetch(
                `/orders/table-receipt?table_id=${printModal.tableId}&start_time=${printModal.startTime}&end_time=${printModal.endTime}`,
            );
            const data = await response.json();

            if (data.orders && data.orders.length > 0) {
                printTableReceipt(
                    data.orders,
                    data.table.number,
                    printModal.startTime,
                    printModal.endTime,
                    auth.user.name,
                );
                setPrintModal((prev) => ({ ...prev, isOpen: false }));
            } else {
                toast.error('Tidak ada pesanan pada rentang waktu tersebut');
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengambil data pesanan');
        } finally {
            setPrintModal((prev) => ({ ...prev, loading: false }));
        }
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

                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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

                            <button
                                onClick={() =>
                                    setPrintModal((prev) => ({
                                        ...prev,
                                        isOpen: true,
                                    }))
                                }
                                className="inline-flex items-center rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                            >
                                <PrinterIcon className="mr-2 h-5 w-5" />
                                Print Receipt Meja
                            </button>
                        </div>
                    </div>

                    {/* Print Modal */}
                    {printModal.isOpen && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
                                <div
                                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                                    onClick={() =>
                                        setPrintModal((prev) => ({
                                            ...prev,
                                            isOpen: false,
                                        }))
                                    }
                                />
                                <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                        <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">
                                            Print Receipt Meja
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Pilih Meja
                                                </label>
                                                <select
                                                    value={printModal.tableId}
                                                    onChange={(e) =>
                                                        setPrintModal(
                                                            (prev) => ({
                                                                ...prev,
                                                                tableId:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                >
                                                    <option value="">
                                                        -- Pilih Meja --
                                                    </option>
                                                    {tables.map((table) => (
                                                        <option
                                                            key={table.id}
                                                            value={table.id}
                                                        >
                                                            {table.number}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Waktu Mulai
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        value={
                                                            printModal.startTime
                                                        }
                                                        onChange={(e) =>
                                                            setPrintModal(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    startTime:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Waktu Selesai
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        value={
                                                            printModal.endTime
                                                        }
                                                        onChange={(e) =>
                                                            setPrintModal(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    endTime:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        <button
                                            type="button"
                                            disabled={printModal.loading}
                                            onClick={handlePrintReceipt}
                                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto"
                                        >
                                            {printModal.loading
                                                ? 'Processing...'
                                                : 'Print Receipt'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPrintModal((prev) => ({
                                                    ...prev,
                                                    isOpen: false,
                                                }))
                                            }
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                                                            Tipe:
                                                        </span>{' '}
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${order.type === 'pos' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}
                                                        >
                                                            {order.type ===
                                                            'pos'
                                                                ? 'POS'
                                                                : 'Dining'}
                                                        </span>
                                                    </p>
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
                                                        {order.table?.number ||
                                                            '-'}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">
                                                            Waktu:
                                                        </span>{' '}
                                                        {new Date(
                                                            order.created_at,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                            { timeZone: 'UTC' },
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
                                                <div className="mt-2 flex flex-col items-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            toggleOrderDetails(
                                                                order.id,
                                                            )
                                                        }
                                                        className="text-sm text-primary hover:underline"
                                                    >
                                                        {expandedOrder ===
                                                        order.id
                                                            ? 'Tutup Detail'
                                                            : 'Lihat Detail'}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            printOrderReceipt(
                                                                order,
                                                                auth.user.name,
                                                            )
                                                        }
                                                        className="text-gray-600 hover:text-gray-900"
                                                        title="Print Receipt"
                                                    >
                                                        <PrinterIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
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
                                                                {item.item.name}{' '}
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
