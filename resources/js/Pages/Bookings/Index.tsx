import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type User = {
    id: number;
    name: string;
    email: string;
};

type Court = {
    id: number;
    name: string;
    type: 'indoor' | 'outdoor';
    price_per_hour: number;
    operating_hours: OperatingHour[];
};

type OperatingHour = {
    id: number;
    court_id: number;
    day_of_week: number; // 0=Sun, 1=Mon, ..., 6=Sat
    open_time: string;
    close_time: string;
    is_closed: boolean;
};

type TodayBooking = {
    id: number;
    court_id: number;
    start_time: string;
    end_time: string;
    status: string;
    total_price: number;
    user: User;
};

type Booking = {
    id: number;
    user_id: number;
    court_id: number;
    start_time: string;
    end_time: string;
    status:
        | 'pending'
        | 'confirmed'
        | 'paid'
        | 'cancelled'
        | 'completed'
        | 'no_show';
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
    };
    courts: Court[];
    todayBookings: TodayBooking[];
    overviewDate: string;
    filters: {
        search: string | null;
        status: string | null;
        date: string | null;
        court_id: string | null;
    };
};

function CourtAvailabilityTable({
    courts,
    todayBookings,
    overviewDate,
}: {
    courts: Court[];
    todayBookings: TodayBooking[];
    overviewDate: string;
}) {
    const date = new Date(overviewDate);
    const dayOfWeek = date.getDay(); // 0=Sun ... 6=Sat

    const formattedDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);

    // Generate hourly time slots from 06:00 to 23:00
    const timeSlots = useMemo(() => {
        const slots: string[] = [];
        for (let h = 6; h <= 22; h++) {
            slots.push(`${h.toString().padStart(2, '0')}:00`);
        }
        return slots;
    }, []);

    // Check if a court has operating hours for this day
    const getOperatingHours = (court: Court) => {
        return court.operating_hours?.find(
            (oh) => oh.day_of_week === dayOfWeek && !oh.is_closed,
        );
    };

    // Check if a specific slot is booked for a court - return booking info
    const getSlotBooking = (
        courtId: number,
        slotTime: string,
    ): TodayBooking | null => {
        const slotStart = new Date(`${overviewDate}T${slotTime}:00`);
        const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

        return (
            todayBookings.find((b) => {
                if (b.court_id !== courtId) return false;
                const bStart = new Date(b.start_time);
                const bEnd = new Date(b.end_time);
                return slotStart < bEnd && slotEnd > bStart;
            }) || null
        );
    };

    // Check if slot is within operating hours
    const isWithinOperatingHours = (court: Court, slotTime: string) => {
        const oh = getOperatingHours(court);
        if (!oh) return false;
        return (
            slotTime >= oh.open_time.slice(0, 5) &&
            slotTime < oh.close_time.slice(0, 5)
        );
    };

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Ketersediaan Court
                    </h3>
                    <p className="text-sm text-gray-500">{formattedDate}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-3 w-3 rounded border border-green-300 bg-green-100" />
                        Available
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-3 w-3 rounded border border-red-300 bg-red-100" />
                        Booked
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-3 w-3 rounded border border-gray-200 bg-gray-100" />
                        Closed
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Court
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Info
                            </th>
                            {timeSlots.map((slot) => (
                                <th
                                    key={slot}
                                    className="px-1 py-3 text-center text-xs font-medium text-gray-500"
                                >
                                    {slot}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {courts.map((court) => {
                            const oh = getOperatingHours(court);
                            return (
                                <tr key={court.id} className="hover:bg-gray-50">
                                    <td className="sticky left-0 z-10 whitespace-nowrap bg-white px-4 py-3">
                                        <div className="font-medium text-gray-900">
                                            {court.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {court.type}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <div className="text-xs font-semibold text-green-700">
                                            {formatCurrency(
                                                court.price_per_hour,
                                            )}
                                            /jam
                                        </div>
                                        {oh ? (
                                            <div className="text-xs text-gray-500">
                                                {oh.open_time.slice(0, 5)} -{' '}
                                                {oh.close_time.slice(0, 5)}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-red-500">
                                                Tutup hari ini
                                            </div>
                                        )}
                                    </td>
                                    {timeSlots.map((slot) => {
                                        const withinHours =
                                            isWithinOperatingHours(court, slot);
                                        const booking = withinHours
                                            ? getSlotBooking(court.id, slot)
                                            : null;

                                        let cellClass =
                                            'bg-gray-50 border-gray-200'; // closed
                                        if (withinHours && !booking) {
                                            cellClass =
                                                'bg-green-50 border-green-200';
                                        } else if (booking) {
                                            cellClass =
                                                'bg-red-100 border-red-300';
                                        }

                                        const formatTime = (
                                            dateStr: string,
                                        ) => {
                                            const d = new Date(dateStr);
                                            return d.toTimeString().slice(0, 5);
                                        };

                                        const tooltipContent = !withinHours
                                            ? 'Tutup'
                                            : booking
                                              ? `${booking.user?.name || 'Customer'}\n${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}\n${formatCurrency(booking.total_price)}\nStatus: ${booking.status}`
                                              : 'Available';

                                        return (
                                            <td
                                                key={slot}
                                                className="px-0.5 py-3"
                                            >
                                                <div
                                                    className={`group relative mx-auto h-6 w-8 cursor-pointer rounded border ${cellClass} transition-all hover:scale-110`}
                                                    title={tooltipContent}
                                                >
                                                    {booking && (
                                                        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-48 -translate-x-1/2 rounded-lg bg-gray-900 p-2 text-xs text-white shadow-lg group-hover:block">
                                                            <div className="font-semibold">
                                                                {booking.user
                                                                    ?.name ||
                                                                    'Customer'}
                                                            </div>
                                                            <div className="text-gray-300">
                                                                {
                                                                    booking.user
                                                                        ?.email
                                                                }
                                                            </div>
                                                            <div className="mt-1 text-gray-300">
                                                                {formatTime(
                                                                    booking.start_time,
                                                                )}{' '}
                                                                -{' '}
                                                                {formatTime(
                                                                    booking.end_time,
                                                                )}
                                                            </div>
                                                            <div className="font-semibold text-green-400">
                                                                {formatCurrency(
                                                                    booking.total_price,
                                                                )}
                                                            </div>
                                                            <div className="mt-1">
                                                                <span
                                                                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                                                        booking.status ===
                                                                        'confirmed'
                                                                            ? 'bg-blue-500'
                                                                            : booking.status ===
                                                                                'paid'
                                                                              ? 'bg-green-500'
                                                                              : 'bg-yellow-500'
                                                                    }`}
                                                                >
                                                                    {booking.status.toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {courts.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                    Belum ada court yang tersedia.
                </div>
            )}
        </div>
    );
}

export default function Index({
    courts,
    todayBookings,
    overviewDate,
    filters,
}: Props) {
    const { flash } = usePage<PageProps>().props;

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(
        filters.status || 'all',
    );
    const [selectedDate, setSelectedDate] = useState(filters.date || '');
    const [selectedCourt, setSelectedCourt] = useState(
        filters.court_id || 'all',
    );

    // Show flash messages
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
            route('bookings.index'),
            {
                search: searchQuery || undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                date: selectedDate || undefined,
                court_id: selectedCourt !== 'all' ? selectedCourt : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-xl font-semibold text-gray-900">
                    Court Bookings
                </h1>
            }
        >
            <Head title="Court Bookings" />

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
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="paid">Paid</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no_show">No Show</option>
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

                    {/* Court Filter */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Court
                        </label>
                        <select
                            value={selectedCourt}
                            onChange={(e) => {
                                setSelectedCourt(e.target.value);
                                setTimeout(applyFilters, 0);
                            }}
                            className="rounded-lg border-gray-300 py-2 pl-3 pr-10 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="all">All Courts</option>
                            {courts.map((court) => (
                                <option key={court.id} value={court.id}>
                                    {court.name} ({court.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Add Button */}
                    <Link
                        href={route('bookings.create')}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <PlusIcon className="mr-2 h-5 w-5" />
                        New Booking
                    </Link>
                </div>
            </div>

            {/* Court Availability Table */}
            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                <CourtAvailabilityTable
                    courts={courts}
                    todayBookings={todayBookings}
                    overviewDate={overviewDate}
                />
            </div>
        </AuthenticatedLayout>
    );
}
