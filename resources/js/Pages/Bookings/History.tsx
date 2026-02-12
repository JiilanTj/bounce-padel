import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { printReceipt } from '@/utils/printReceipt';
import {
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    PrinterIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

type User = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
};

type Court = {
    id: number;
    name: string;
    type: 'indoor' | 'outdoor';
};

type Booking = {
    id: number;
    user_id: number;
    court_id: number;
    start_time: string;
    end_time: string;
    status: string;
    total_price: number;
    notes: string | null;
    created_at: string;
    user: User;
    court: Court;
};

type Props = PageProps & {
    bookings: {
        data: Booking[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    filters: {
        search: string | null;
        status: string | null;
        date: string | null;
    };
};

export default function History({ bookings, filters }: Props) {
    const { flash, auth } = usePage<PageProps>().props;
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(
        filters.status || 'all',
    );
    const [selectedDate, setSelectedDate] = useState(filters.date || '');

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
            route('bookings.history'),
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

    const formatDateTime = (dateStr: string) => {
        // Parse UTC date string and display in local time
        return new Date(dateStr).toLocaleString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('bookings.index')}
                        className="rounded-full p-1 hover:bg-gray-100"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Booking History
                    </h1>
                </div>
            }
        >
            <Head title="Booking History" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Filters */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <form
                        onSubmit={handleSearch}
                        className="flex-1 sm:max-w-md"
                    >
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
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="no_show">No Show</option>
                            </select>
                        </div>

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
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Booking ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Court
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Total Price
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {bookings.data.length > 0 ? (
                                    bookings.data.map((booking) => (
                                        <tr
                                            key={booking.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                #{booking.id}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {booking.user?.name ||
                                                        'Unknown'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {booking.user?.email}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {booking.court?.name}
                                                </div>
                                                <div className="text-xs capitalize text-gray-500">
                                                    {booking.court?.type}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                <div>
                                                    {formatDateTime(
                                                        booking.start_time,
                                                    )}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                        booking.status ===
                                                        'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : booking.status ===
                                                                'cancelled'
                                                              ? 'bg-red-100 text-red-800'
                                                              : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {booking.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                {formatCurrency(
                                                    booking.total_price,
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                                                <div className="flex justify-center gap-3">
                                                    <Link
                                                        href={route(
                                                            'bookings.edit',
                                                            booking.id,
                                                        )}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Edit Booking"
                                                    >
                                                        <PencilSquareIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            printReceipt(
                                                                booking,
                                                                auth.user.name,
                                                            )
                                                        }
                                                        className="text-gray-600 hover:text-gray-900"
                                                        title="Print Receipt"
                                                    >
                                                        <PrinterIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-sm text-gray-500"
                                        >
                                            No past bookings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {bookings.data.length > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing{' '}
                            <span className="font-medium">
                                {(bookings.current_page - 1) *
                                    bookings.per_page +
                                    1}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">
                                {Math.min(
                                    bookings.current_page * bookings.per_page,
                                    bookings.total,
                                )}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium">
                                {bookings.total}
                            </span>{' '}
                            results
                        </div>
                        <div className="flex gap-1">
                            {bookings.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                                        link.active
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : !link.url
                                              ? 'cursor-default bg-gray-100 text-gray-400'
                                              : ''
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    preserveState
                                    preserveScroll
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
