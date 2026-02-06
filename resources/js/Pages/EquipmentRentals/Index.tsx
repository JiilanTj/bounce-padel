import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { formatCurrency } from '@/utils/currency';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

type User = {
    id: number;
    name: string;
    email: string;
};

type Product = {
    id: number;
    name: string;
    sku: string | null;
    price_rent: number;
};

type OrderItem = {
    id: number;
    quantity: number;
    price: number;
    subtotal: number;
    notes: string | null;
    item: Product;
};

type Order = {
    id: number;
    user_id: number;
    status: string;
    total_amount: number;
    created_at: string;
    user: User;
    items: OrderItem[];
};

type Props = PageProps & {
    rentals: {
        data: Order[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search: string | null;
        status: string | null;
        date: string | null;
    };
};

export default function Index({ rentals, filters }: Props) {
    const { flash } = usePage<PageProps>().props;

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(
        filters.status || 'all',
    );
    const [selectedDate, setSelectedDate] = useState(filters.date || '');
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        rentalId: number | null;
    }>({ isOpen: false, rentalId: null });
    const [returnModal, setReturnModal] = useState<{
        isOpen: boolean;
        rentalId: number | null;
        action: 'completed' | 'cancelled' | null;
        notes: string;
    }>({ isOpen: false, rentalId: null, action: null, notes: '' });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        router.get(
            route('equipment-rentals.index'),
            {
                search: searchQuery || undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                date: selectedDate || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleDelete = (id: number) => {
        setDeleteModal({ isOpen: true, rentalId: id });
    };

    const confirmDelete = () => {
        if (deleteModal.rentalId) {
            router.delete(
                route('equipment-rentals.destroy', deleteModal.rentalId),
                {
                    onFinish: () => {
                        setDeleteModal({ isOpen: false, rentalId: null });
                    },
                },
            );
        }
    };

    const handleReturn = (id: number, action: 'completed' | 'cancelled') => {
        setReturnModal({ isOpen: true, rentalId: id, action, notes: '' });
    };

    const confirmReturn = () => {
        if (returnModal.rentalId && returnModal.action) {
            router.put(
                route('equipment-rentals.update', returnModal.rentalId),
                { status: returnModal.action, return_notes: returnModal.notes },
                {
                    onFinish: () => {
                        setReturnModal({
                            isOpen: false,
                            rentalId: null,
                            action: null,
                            notes: '',
                        });
                    },
                },
            );
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            processing: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };

        const labels: Record<string, string> = {
            processing: 'RENTING',
            completed: 'RETURNED',
            cancelled: 'CANCELLED',
        };

        return (
            <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}
            >
                {labels[status] || status.toUpperCase()}
            </span>
        );
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(date);
    };

    const extractDuration = (notes: string | null) => {
        if (!notes) return '-';
        const match = notes.match(/Rental: (\d+) hours/);
        return match ? `${match[1]} jam` : '-';
    };

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-xl font-semibold text-gray-900">
                    Equipment Rental
                </h1>
            }
        >
            <Head title="Equipment Rental" />

            {/* Filters & Actions */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <form onSubmit={handleSearch} className="flex-1 sm:max-w-md">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Search Customer
                    </label>
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Customer name..."
                            className="block w-full rounded-lg border-gray-300 pl-10 pr-4 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                </form>

                <div className="flex flex-wrap items-end gap-3">
                    {/* Status Filter */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                setTimeout(applyFilters, 0);
                            }}
                            className="rounded-lg border-gray-300 py-2 pl-3 pr-10 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="processing">Renting</option>
                            <option value="completed">Returned</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                setTimeout(applyFilters, 0);
                            }}
                            className="rounded-lg border-gray-300 py-2 pl-3 pr-4 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* Add Button */}
                    <Link
                        href={route('equipment-rentals.create')}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <PlusIcon className="mr-2 h-5 w-5" />
                        New Rental
                    </Link>
                </div>
            </div>

            {/* Rentals Table */}
            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Equipment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {rentals.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-8 text-center text-gray-500"
                                    >
                                        No rentals found.
                                    </td>
                                </tr>
                            ) : (
                                rentals.data.map((rental) => (
                                    <tr
                                        key={rental.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {rental.user.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {rental.user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {rental.items
                                                    .map(
                                                        (item) =>
                                                            `${item.item.name} (${item.quantity}x)`,
                                                    )
                                                    .join(', ')}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                            {extractDuration(
                                                rental.items[0]?.notes,
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            {formatCurrency(
                                                rental.total_amount,
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                            {formatDateTime(rental.created_at)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {getStatusBadge(rental.status)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                            <Link
                                                href={route(
                                                    'equipment-rentals.show',
                                                    rental.id,
                                                )}
                                                className="mr-3 text-blue-600 hover:text-blue-900"
                                            >
                                                View
                                            </Link>
                                            {rental.status === 'processing' && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            handleReturn(
                                                                rental.id,
                                                                'completed',
                                                            )
                                                        }
                                                        className="mr-3 text-green-600 hover:text-green-900"
                                                    >
                                                        Return
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleReturn(
                                                                rental.id,
                                                                'cancelled',
                                                            )
                                                        }
                                                        className="mr-3 text-orange-600 hover:text-orange-900"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() =>
                                                    handleDelete(rental.id)
                                                }
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {rentals.last_page > 1 && (
                    <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing{' '}
                                {(rentals.current_page - 1) * rentals.per_page +
                                    1}{' '}
                                to{' '}
                                {Math.min(
                                    rentals.current_page * rentals.per_page,
                                    rentals.total,
                                )}{' '}
                                of {rentals.total} results
                            </div>
                            <div className="flex gap-1">
                                {Array.from(
                                    { length: rentals.last_page },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => {
                                            router.get(
                                                route(
                                                    'equipment-rentals.index',
                                                ),
                                                {
                                                    page,
                                                    search:
                                                        searchQuery ||
                                                        undefined,
                                                    status:
                                                        selectedStatus !== 'all'
                                                            ? selectedStatus
                                                            : undefined,
                                                    date:
                                                        selectedDate ||
                                                        undefined,
                                                },
                                                { preserveState: true },
                                            );
                                        }}
                                        className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                                            rentals.current_page === page
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                        } border border-gray-300`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={() =>
                                setDeleteModal({
                                    isOpen: false,
                                    rentalId: null,
                                })
                            }
                        />
                        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <TrashIcon
                                            className="h-6 w-6 text-red-600"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                        <h3 className="text-lg font-semibold leading-6 text-gray-900">
                                            Delete Rental
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete
                                                this rental? Equipment will be
                                                returned to stock.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                >
                                    Delete
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setDeleteModal({
                                            isOpen: false,
                                            rentalId: null,
                                        })
                                    }
                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Return Confirmation Modal */}
            {returnModal.isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={() =>
                                setReturnModal({
                                    isOpen: false,
                                    rentalId: null,
                                    action: null,
                                    notes: '',
                                })
                            }
                        />
                        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                <div className="mt-3 text-center sm:text-left">
                                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                                        {returnModal.action === 'completed'
                                            ? 'Return Equipment'
                                            : 'Cancel Rental'}
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            {returnModal.action === 'completed'
                                                ? 'Mark this rental as returned? Equipment will be added back to stock.'
                                                : 'Cancel this rental? Equipment will be returned to stock.'}
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Notes{' '}
                                            {returnModal.action === 'completed'
                                                ? '(Kondisi pengembalian)'
                                                : '(Alasan pembatalan)'}
                                        </label>
                                        <textarea
                                            value={returnModal.notes}
                                            onChange={(e) =>
                                                setReturnModal({
                                                    ...returnModal,
                                                    notes: e.target.value,
                                                })
                                            }
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            placeholder={
                                                returnModal.action ===
                                                'completed'
                                                    ? 'Contoh: Dikembalikan dalam keadaan baik / rusak pada bagian...'
                                                    : 'Contoh: Customer membatalkan rental...'
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    type="button"
                                    onClick={confirmReturn}
                                    className={`inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                                        returnModal.action === 'completed'
                                            ? 'bg-green-600 hover:bg-green-500'
                                            : 'bg-orange-600 hover:bg-orange-500'
                                    }`}
                                >
                                    {returnModal.action === 'completed'
                                        ? 'Return'
                                        : 'Cancel Rental'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setReturnModal({
                                            isOpen: false,
                                            rentalId: null,
                                            action: null,
                                            notes: '',
                                        })
                                    }
                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
