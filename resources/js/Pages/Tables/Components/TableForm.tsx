import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';

type TableData = {
    id: number;
    number: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
    qr_code: string;
};

type Props = {
    show: boolean;
    onClose: () => void;
    table: TableData | null;
};

export default function TableForm({ show, onClose, table }: Props) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        number: '',
        capacity: 2,
        status: 'available' as 'available' | 'occupied' | 'reserved',
    });

    useEffect(() => {
        if (table) {
            setData({
                number: table.number,
                capacity: table.capacity,
                status: table.status,
            });
        } else {
            reset();
        }
    }, [table, setData, reset]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (table) {
            put(route('tables.update', table.id), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(route('tables.store'), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    {table ? 'Edit Table' : 'Add New Table'}
                </h2>

                <div className="mt-6 space-y-4">
                    {/* Table Number */}
                    <div>
                        <label
                            htmlFor="number"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Table Number
                        </label>
                        <input
                            type="text"
                            id="number"
                            value={data.number}
                            onChange={(e) => setData('number', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="e.g., 1, A1, VIP-1"
                            required
                        />
                        {errors.number && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.number}
                            </p>
                        )}
                    </div>

                    {/* Capacity */}
                    <div>
                        <label
                            htmlFor="capacity"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Capacity (People)
                        </label>
                        <input
                            type="number"
                            id="capacity"
                            value={data.capacity}
                            onChange={(e) =>
                                setData('capacity', parseInt(e.target.value))
                            }
                            min="1"
                            max="20"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                        />
                        {errors.capacity && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.capacity}
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label
                            htmlFor="status"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Status
                        </label>
                        <select
                            id="status"
                            value={data.status}
                            onChange={(e) =>
                                setData(
                                    'status',
                                    e.target.value as
                                        | 'available'
                                        | 'occupied'
                                        | 'reserved',
                                )
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="reserved">Reserved</option>
                        </select>
                        {errors.status && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.status}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {processing
                            ? 'Saving...'
                            : table
                              ? 'Update Table'
                              : 'Create Table'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
