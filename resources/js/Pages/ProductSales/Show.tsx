import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';

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
    price_buy: number;
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
    user: User;
    items: OrderItem[];
};

type Props = PageProps & {
    sale: Order;
};

export default function Show({ sale }: Props) {
    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            paid: 'bg-green-100 text-green-800',
            new: 'bg-blue-100 text-blue-800',
            cancelled: 'bg-red-100 text-red-800',
        };

        return (
            <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}
            >
                {status.toUpperCase()}
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Sale Details
                    </h1>
                    <Link
                        href={route('product-sales.index')}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Back to Sales
                    </Link>
                </div>
            }
        >
            <Head title={`Sale #${sale.id}`} />

            <div className="space-y-6">
                {/* Order Information */}
                <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Order Information
                        </h3>
                    </div>
                    <div className="px-6 py-4">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Order ID
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    #{sale.id}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Status
                                </dt>
                                <dd className="mt-1">
                                    {getStatusBadge(sale.status)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Order Date
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {formatDateTime(sale.created_at)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Total Amount
                                </dt>
                                <dd className="mt-1 text-lg font-semibold text-gray-900">
                                    {formatCurrency(sale.total_amount)}
                                </dd>
                            </div>
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
                                    {sale.user.name}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Email
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {sale.user.email}
                                </dd>
                            </div>
                            {sale.user.phone && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Phone
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {sale.user.phone}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>

                {/* Order Items */}
                <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Order Items
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        SKU
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Price
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
                                {sale.items.map((item) => (
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
                                                            Note: {item.notes}
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
                                        {formatCurrency(sale.total_amount)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
