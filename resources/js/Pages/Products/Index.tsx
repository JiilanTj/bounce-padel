import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    PencilSquareIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import ProductForm from './Components/ProductForm';

type Category = {
    id: number;
    name: string;
    type: 'product' | 'menu';
};

type Product = {
    id: number;
    category_id: number;
    name: string;
    sku: string | null;
    description: string | null;
    price_buy: number;
    price_rent: number;
    stock_buy: number;
    stock_rent: number;
    image_url: string | null;
    category?: Category;
};

type Props = PageProps & {
    products: {
        data: Product[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    categories: Category[];
};

export default function Index({ auth, products, categories }: Props) {
    const { delete: destroy } = useForm();
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );

    const openCreateModal = () => {
        setSelectedProduct(null);
        setShowModal(true);
    };

    const openEditModal = (product: Product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            destroy(route('products.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AuthenticatedLayout
            // @ts-expect-error - User type mismatch
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Product Management
                </h2>
            }
        >
            <Head title="Products" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Products Inventory
                                </h3>
                                <button
                                    onClick={openCreateModal}
                                    className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <PlusIcon className="mr-2 h-5 w-5" />
                                    Add Product
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                            >
                                                Product
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                            >
                                                Category
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                                            >
                                                Price (Buy / Rent)
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                                            >
                                                Stock (Buy / Rent)
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {products.data.length > 0 ? (
                                            products.data.map((product) => (
                                                <tr key={product.id}>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="font-medium text-gray-900">
                                                            {product.name}
                                                        </div>
                                                        {product.sku && (
                                                            <div className="text-xs text-gray-500">
                                                                SKU:{' '}
                                                                {product.sku}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {product.category
                                                            ?.name || '-'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                                                        <div>
                                                            Buy:{' '}
                                                            {formatCurrency(
                                                                product.price_buy,
                                                            )}
                                                        </div>
                                                        <div>
                                                            Rent:{' '}
                                                            {formatCurrency(
                                                                product.price_rent,
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                        <div
                                                            className={
                                                                product.stock_buy <
                                                                5
                                                                    ? 'font-medium text-red-600'
                                                                    : 'text-gray-900'
                                                            }
                                                        >
                                                            Buy:{' '}
                                                            {product.stock_buy}
                                                        </div>
                                                        <div
                                                            className={
                                                                product.stock_rent <
                                                                5
                                                                    ? 'font-medium text-red-600'
                                                                    : 'text-gray-900'
                                                            }
                                                        >
                                                            Rent:{' '}
                                                            {product.stock_rent}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-3">
                                                            <button
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        product,
                                                                    )
                                                                }
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                <PencilSquareIcon className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        product.id,
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-6 py-4 text-center text-gray-500"
                                                >
                                                    No products found. Start by
                                                    adding one.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ProductForm
                show={showModal}
                onClose={closeModal}
                product={selectedProduct}
                categories={categories}
            />
        </AuthenticatedLayout>
    );
}
