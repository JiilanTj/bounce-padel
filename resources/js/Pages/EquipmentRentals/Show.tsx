import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

type User = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
};

type Product = {
    id: number;
    name: string;
    sku: string | null;
    price_rent: number;
    image_path: string | null;
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
    return_notes: string | null;
    user: User;
    items: OrderItem[];
};

type Props = PageProps & {
    rental: Order;
};

export default function Show({ rental }: Props) {
    const [returnModal, setReturnModal] = useState<{
        isOpen: boolean;
        action: 'completed' | 'cancelled' | null;
        notes: string;
    }>({ isOpen: false, action: null, notes: '' });

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
                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}
            >
                {labels[status] || status.toUpperCase()}
            </span>
        );
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'long',
            timeStyle: 'medium',
        }).format(date);
    };

    const extractDuration = (notes: string | null) => {
        if (!notes) return '-';
        const match = notes.match(/Rental: (\d+) hours/);
        return match ? `${match[1]} jam` : '-';
    };

    const handleReturn = (action: 'completed' | 'cancelled') => {
        setReturnModal({ isOpen: true, action, notes: '' });
    };

    const confirmReturn = () => {
        if (returnModal.action) {
            router.put(route('equipment-rentals.update', rental.id), {
                status: returnModal.action,
                return_notes: returnModal.notes,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Rental Details
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
            <Head title={`Rental #${rental.id}`} />

            <div className="space-y-6">
                {/* Rental Information */}
                <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Rental Information
                        </h3>
                        {rental.status === 'processing' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleReturn('completed')}
                                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                >
                                    Return Equipment
                                </button>
                                <button
                                    onClick={() => handleReturn('cancelled')}
                                    className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                                >
                                    Cancel Rental
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="px-6 py-4">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Rental ID
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    #{rental.id}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Status
                                </dt>
                                <dd className="mt-1">
                                    {getStatusBadge(rental.status)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Rental Date
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {formatDateTime(rental.created_at)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Duration
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {extractDuration(rental.items[0]?.notes)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Total Amount
                                </dt>
                                <dd className="mt-1 text-lg font-semibold text-gray-900">
                                    {formatCurrency(rental.total_amount)}
                                </dd>
                            </div>
                            {rental.return_notes && (
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Return Notes
                                    </dt>
                                    <dd className="mt-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-900">
                                        {rental.return_notes}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>

                {/* Customer Information */}
                <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Customer Information
                        </h3>
                    </div>
                    <div className="px-6 py-4">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Name
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {rental.user.name}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Email
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {rental.user.email}
                                </dd>
                            </div>
                            {rental.user.phone && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Phone
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {rental.user.phone}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>

                {/* Equipment Items */}
                <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Equipment Rented
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Equipment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        SKU
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Price/Unit
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {rental.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {item.item.image_path && (
                                                    <img
                                                        src={
                                                            item.item.image_path
                                                        }
                                                        alt={item.item.name}
                                                        className="mr-4 h-12 w-12 rounded-md object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.item.name}
                                                    </div>
                                                    {item.notes && (
                                                        <div className="text-xs text-gray-500">
                                                            {item.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {item.item.sku || '-'}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                                            {formatCurrency(item.price)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-900">
                                            {item.quantity}x
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                                            {formatCurrency(item.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-4 text-right text-sm font-semibold text-gray-900"
                                    >
                                        Total:
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-base font-bold text-gray-900">
                                        {formatCurrency(rental.total_amount)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {/* Return Confirmation Modal */}
            {returnModal.isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={() =>
                                setReturnModal({
                                    isOpen: false,
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
