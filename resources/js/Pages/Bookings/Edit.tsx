import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEvent, useCallback, useEffect, useState } from 'react';

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
    price_per_hour: number;
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
    user: User;
    court: Court;
};

type TimeSlot = {
    start_time: string;
    end_time: string;
    available: boolean;
};

type Props = PageProps & {
    booking: Booking;
    courts: Court[];
};

export default function Edit({ booking, courts }: Props) {
    const startDate = new Date(booking.start_time);
    const endDate = new Date(booking.end_time);

    const { data, setData, put, processing, errors } = useForm<{
        customer_name: string;
        customer_email: string;
        customer_phone: string;
        court_id: string;
        date: string;
        start_time: string;
        end_time: string;
        status: Booking['status'];
        notes: string;
        time?: string; // Server-side validation error
    }>({
        customer_name: booking.user.name,
        customer_email: booking.user.email,
        customer_phone: booking.user.phone || '',
        court_id: booking.court_id.toString(),
        date: startDate.toISOString().split('T')[0],
        start_time: startDate.toTimeString().slice(0, 5),
        end_time: endDate.toTimeString().slice(0, 5),
        status: booking.status,
        notes: booking.notes || '',
    });

    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [totalPrice, setTotalPrice] = useState(booking.total_price);
    const [selectedSlots, setSelectedSlots] = useState<number[]>([]);

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
            }
        } catch (error) {
            console.error('Error loading slots:', error);
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
            setSelectedSlots([]);
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
        }
    }, [data.start_time, data.end_time, selectedCourt, calculatePrice]);

    const handleSlotClick = (index: number) => {
        const slot = availableSlots[index];
        
        // Can't select unavailable slots
        if (!slot.available) return;

        let newSelectedSlots: number[];

        if (selectedSlots.length === 0) {
            // First selection
            newSelectedSlots = [index];
        } else if (selectedSlots.includes(index)) {
            // Deselect if already selected
            newSelectedSlots = selectedSlots.filter(i => i !== index);
        } else {
            // Add to selection - create range from min to max
            const allSlots = [...selectedSlots, index].sort((a, b) => a - b);
            const minIndex = allSlots[0];
            const maxIndex = allSlots[allSlots.length - 1];
            
            // Create continuous range and check if all are available
            newSelectedSlots = [];
            for (let i = minIndex; i <= maxIndex; i++) {
                if (!availableSlots[i]?.available) {
                    // If any slot in range is unavailable, just select the clicked one
                    newSelectedSlots = [index];
                    break;
                }
                newSelectedSlots.push(i);
            }
        }

        setSelectedSlots(newSelectedSlots);

        // Update start and end times based on selection
        if (newSelectedSlots.length > 0) {
            const sortedSlots = newSelectedSlots.sort((a, b) => a - b);
            const firstSlot = availableSlots[sortedSlots[0]];
            const lastSlot = availableSlots[sortedSlots[sortedSlots.length - 1]];
            
            setData('start_time', firstSlot.start_time);
            setData('end_time', lastSlot.end_time);
        } else {
            setData('start_time', '');
            setData('end_time', '');
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Combine date and time for submission
        const startDateTime = `${data.date} ${data.start_time}`;
        const endDateTime = `${data.date} ${data.end_time}`;

        // Submit with transformed data using router.put
        router.put(route('bookings.update', booking.id), {
            ...data,
            start_time: startDateTime,
            end_time: endDateTime,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Edit Booking #{booking.id}
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
            <Head title="Edit Booking" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-6">
                                {/* Customer Information */}
                                <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Customer Information
                                    </h3>
                                    
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.customer_name}
                                            onChange={(e) =>
                                                setData('customer_name', e.target.value)
                                            }
                                            className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            placeholder="e.g. John Doe"
                                            required
                                        />
                                        {errors.customer_name && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors.customer_name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={data.customer_email}
                                            onChange={(e) =>
                                                setData('customer_email', e.target.value)
                                            }
                                            className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            placeholder="e.g. john@example.com"
                                            required
                                        />
                                        {errors.customer_email && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors.customer_email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.customer_phone}
                                            onChange={(e) =>
                                                setData('customer_phone', e.target.value)
                                            }
                                            className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            placeholder="e.g. 08123456789"
                                            required
                                        />
                                        {errors.customer_phone && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors.customer_phone}
                                            </p>
                                        )}
                                    </div>
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
                                        className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                    {errors.date && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.date}
                                        </p>
                                    )}
                                </div>

                                {/* Time Slots */}
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
                                                    (slot, index) => {
                                                        const isSelected = selectedSlots.includes(index);
                                                        
                                                        return (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                disabled={
                                                                    !slot.available
                                                                }
                                                                onClick={() => handleSlotClick(index)}
                                                                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                                                    isSelected
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
                                                        );
                                                    }
                                                )}
                                            </div>
                                        ) : null}
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

                                {/* Status */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Status *
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) =>
                                            setData(
                                                'status',
                                                e.target
                                                    .value as Booking['status'],
                                            )
                                        }
                                        className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        required
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">
                                            Confirmed
                                        </option>
                                        <option value="paid">Paid</option>
                                        <option value="completed">
                                            Completed
                                        </option>
                                        <option value="cancelled">
                                            Cancelled
                                        </option>
                                        <option value="no_show">No Show</option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.status}
                                        </p>
                                    )}
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
                                            ? 'Updating...'
                                            : 'Update Booking'}
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
