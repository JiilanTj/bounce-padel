import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useCallback, useEffect, useState } from 'react';

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
};

type TimeSlot = {
    start_time: string;
    end_time: string;
    available: boolean;
};

type Props = PageProps & {
    courts: Court[];
    users: User[];
};

export default function Create({ courts, users }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        user_id: string;
        court_id: string;
        date: string;
        start_time: string;
        end_time: string;
        notes: string;
        time?: string; // Server-side validation error
    }>({
        user_id: '',
        court_id: '',
        date: '',
        start_time: '',
        end_time: '',
        notes: '',
    });

    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [totalPrice, setTotalPrice] = useState(0);

    const loadAvailableSlots = useCallback(async () => {
        setLoadingSlots(true);
        try {
            const response = await fetch(
                `/api/bookings/available-slots?court_id=${data.court_id}&date=${data.date}`,
            );
            const result = await response.json();

            if (result.available) {
                setAvailableSlots(result.slots);
            } else {
                setAvailableSlots([]);
                alert(result.message);
            }
        } catch (error) {
            console.error('Error loading slots:', error);
            alert('Failed to load available time slots');
        } finally {
            setLoadingSlots(false);
        }
    }, [data.court_id, data.date]);

    const calculatePrice = useCallback(() => {
        if (!data.start_time || !data.end_time || !selectedCourt) return;

        const start = new Date(`${data.date} ${data.start_time}`);
        const end = new Date(`${data.date} ${data.end_time}`);
        const diffMs = end.getTime() - start.getTime();
        const hours = Math.ceil(diffMs / (1000 * 60 * 60));

        setTotalPrice(hours * selectedCourt.price_per_hour);
    }, [data.date, data.start_time, data.end_time, selectedCourt]);

    // Load available slots when court and date are selected
    useEffect(() => {
        if (data.court_id && data.date) {
            loadAvailableSlots();
        } else {
            setAvailableSlots([]);
        }
    }, [data.court_id, data.date, loadAvailableSlots]);

    // Update selected court
    useEffect(() => {
        if (data.court_id) {
            const court = courts.find((c) => c.id === parseInt(data.court_id));
            setSelectedCourt(court || null);
        } else {
            setSelectedCourt(null);
        }
    }, [data.court_id, courts]);

    // Calculate price when times change
    useEffect(() => {
        if (data.start_time && data.end_time && selectedCourt) {
            calculatePrice();
        } else {
            setTotalPrice(0);
        }
    }, [data.start_time, data.end_time, selectedCourt, calculatePrice]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Combine date and time
        const startDateTime = `${data.date} ${data.start_time}`;
        const endDateTime = `${data.date} ${data.end_time}`;

        // Update form data with combined datetime before submission
        setData({
            ...data,
            start_time: startDateTime,
            end_time: endDateTime,
        });

        // Submit after state update
        setTimeout(() => {
            post(route('bookings.store'));
        }, 0);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Create New Booking
                    </h2>
                    <Link
                        href={route('bookings.index')}
                        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                        ← Back to Bookings
                    </Link>
                </div>
            }
        >
            <Head title="Create Booking" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-6">
                                {/* Customer Selection */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Customer *
                                    </label>
                                    <select
                                        value={data.user_id}
                                        onChange={(e) =>
                                            setData('user_id', e.target.value)
                                        }
                                        className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        required
                                    >
                                        <option value="">
                                            Select Customer
                                        </option>
                                        {users.map((user) => (
                                            <option
                                                key={user.id}
                                                value={user.id}
                                            >
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.user_id && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.user_id}
                                        </p>
                                    )}
                                </div>

                                {/* Court Selection */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Court *
                                    </label>
                                    <select
                                        value={data.court_id}
                                        onChange={(e) =>
                                            setData('court_id', e.target.value)
                                        }
                                        className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        required
                                    >
                                        <option value="">Select Court</option>
                                        {courts.map((court) => (
                                            <option
                                                key={court.id}
                                                value={court.id}
                                            >
                                                {court.name} ({court.type}) -{' '}
                                                {formatCurrency(
                                                    court.price_per_hour,
                                                )}
                                                /jam
                                            </option>
                                        ))}
                                    </select>
                                    {errors.court_id && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.court_id}
                                        </p>
                                    )}
                                </div>

                                {/* Date Selection */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={(e) =>
                                            setData('date', e.target.value)
                                        }
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                        className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                    {errors.date && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.date}
                                        </p>
                                    )}
                                </div>

                                {/* Time Slots (only show when court and date selected) */}
                                {data.court_id && data.date && (
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Available Time Slots
                                        </label>

                                        {loadingSlots ? (
                                            <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-600 dark:bg-gray-700">
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    Loading slots...
                                                </p>
                                            </div>
                                        ) : availableSlots.length > 0 ? (
                                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                                                {availableSlots.map(
                                                    (slot, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            disabled={
                                                                !slot.available
                                                            }
                                                            onClick={() => {
                                                                setData(
                                                                    'start_time',
                                                                    slot.start_time,
                                                                );
                                                                setData(
                                                                    'end_time',
                                                                    slot.end_time,
                                                                );
                                                            }}
                                                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                                                data.start_time ===
                                                                slot.start_time
                                                                    ? 'border-primary bg-primary text-black'
                                                                    : slot.available
                                                                      ? 'border-gray-300 bg-white text-gray-700 hover:border-primary dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                                                      : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800'
                                                            }`}
                                                        >
                                                            {slot.start_time}
                                                            {!slot.available && (
                                                                <span className="ml-1 text-xs">
                                                                    ✕
                                                                </span>
                                                            )}
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-600 dark:bg-gray-700">
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    No available slots for this
                                                    date. Court may be closed or
                                                    fully booked.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Manual Time Input */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Start Time *
                                        </label>
                                        <input
                                            type="time"
                                            value={data.start_time}
                                            onChange={(e) =>
                                                setData(
                                                    'start_time',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        {errors.start_time && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors.start_time}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            End Time *
                                        </label>
                                        <input
                                            type="time"
                                            value={data.end_time}
                                            onChange={(e) =>
                                                setData(
                                                    'end_time',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        {errors.end_time && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors.end_time}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Price Display */}
                                {totalPrice > 0 && (
                                    <div className="rounded-lg bg-primary/10 p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Total Price
                                            </span>
                                            <span className="text-2xl font-bold text-primary">
                                                {formatCurrency(totalPrice)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Notes
                                    </label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData('notes', e.target.value)
                                        }
                                        rows={4}
                                        className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="Additional notes or special requests..."
                                    />
                                    {errors.notes && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.notes}
                                        </p>
                                    )}
                                </div>

                                {/* Time error */}
                                {errors.time && (
                                    <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.time}
                                        </p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-lg bg-primary px-6 py-3 font-semibold text-black transition hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {processing
                                            ? 'Creating...'
                                            : 'Create Booking'}
                                    </button>
                                    <Link
                                        href={route('bookings.index')}
                                        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
