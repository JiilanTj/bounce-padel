import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    PencilSquareIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import CategoryForm from './Components/CategoryForm';

type Category = {
    id: number;
    name: string;
    type: 'product' | 'menu';
    slug: string;
};

type Props = PageProps & {
    categories: {
        data: Category[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
};

export default function Index({ auth, categories }: Props) {
    const { delete: destroy } = useForm();
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null,
    );

    const openCreateModal = () => {
        setSelectedCategory(null);
        setShowModal(true);
    };

    const openEditModal = (category: Category) => {
        setSelectedCategory(category);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCategory(null);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            destroy(route('categories.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            // @ts-expect-error - User type mismatch in Auth
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Category Management
                </h2>
            }
        >
            <Head title="Categories" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Categories List
                                </h3>
                                {/* Only Admin/Owner can add categories usually, but for now allow based on role checks in sidebar or here if strict */}
                                <button
                                    onClick={openCreateModal}
                                    className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <PlusIcon className="mr-2 h-5 w-5" />
                                    Add Category
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
                                                Name
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                            >
                                                Type
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
                                        {categories.data.length > 0 ? (
                                            categories.data.map((category) => (
                                                <tr key={category.id}>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="font-medium text-gray-900">
                                                            {category.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            /{category.slug}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${category.type === 'product' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                                                        >
                                                            {category.type ===
                                                            'product'
                                                                ? 'Product'
                                                                : 'Menu (F&B)'}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-3">
                                                            <button
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        category,
                                                                    )
                                                                }
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                <PencilSquareIcon className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        category.id,
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
                                                    colSpan={3}
                                                    className="px-6 py-4 text-center text-gray-500"
                                                >
                                                    No categories found. Start
                                                    by adding one.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination would go here */}
                        </div>
                    </div>
                </div>
            </div>

            <CategoryForm
                show={showModal}
                onClose={closeModal}
                category={selectedCategory}
            />
        </AuthenticatedLayout>
    );
}
