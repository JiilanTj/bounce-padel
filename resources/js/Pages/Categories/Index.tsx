import ConfirmationModal from '@/Components/ConfirmationModal';
import Pagination from '@/Components/Pagination';
import StatCard from '@/Components/StatCard';
import Table from '@/Components/Table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    MagnifyingGlassIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { Head, router, usePage } from '@inertiajs/react';
import { FolderOpen, Package, Tag } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import CategoryForm from './Components/CategoryForm';

type Category = {
    id: number;
    name: string;
    type: 'product' | 'menu';
    slug: string;
    products_count?: number;
    menu_items_count?: number;
};

interface CategoriesIndexProps extends PageProps {
    categories: {
        data: Category[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search: string | null;
        type: string | null;
        sort_by: string;
        sort_order: 'asc' | 'desc';
    };
    stats: {
        total: number;
        product_categories: number;
        menu_categories: number;
    };
}

export default function Index() {
    const { categories, filters, stats } =
        usePage<CategoriesIndexProps>().props;
    const { flash } = usePage<PageProps>().props;

    // State
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null,
    );
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        category: Category | null;
    }>({ show: false, category: null });
    const [deleting, setDeleting] = useState(false);

    // Show flash messages as toast
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Debounced search
    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.get(
            route('categories.index'),
            {
                search: searchQuery || undefined,
                type: selectedType !== 'all' ? selectedType : undefined,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Type filter
    const handleTypeFilter = (type: string) => {
        setSelectedType(type);
        router.get(
            route('categories.index'),
            {
                search: searchQuery || undefined,
                type: type !== 'all' ? type : undefined,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Sorting
    const handleSort = (column: string) => {
        const newOrder =
            filters.sort_by === column && filters.sort_order === 'asc'
                ? 'desc'
                : 'asc';

        router.get(
            route('categories.index'),
            {
                search: searchQuery || undefined,
                type: selectedType !== 'all' ? selectedType : undefined,
                sort_by: column,
                sort_order: newOrder,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Modal handlers
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

    // Delete category
    const handleDelete = () => {
        if (!deleteModal.category) return;

        setDeleting(true);
        router.delete(route('categories.destroy', deleteModal.category.id), {
            onFinish: () => {
                setDeleting(false);
                setDeleteModal({ show: false, category: null });
            },
        });
    };

    // Table columns configuration
    const columns = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            render: (category: Category) => (
                <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <Tag className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                            {category.name}
                        </p>
                        <p className="text-xs text-gray-500">{category.slug}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'type',
            label: 'Type',
            sortable: true,
            render: (category: Category) => (
                <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        category.type === 'product'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                    }`}
                >
                    {category.type === 'product' ? 'Product' : 'Menu'}
                </span>
            ),
        },
        {
            key: 'items_count',
            label: 'Items',
            sortable: false,
            render: (category: Category) => (
                <p className="text-sm text-gray-600">
                    {category.type === 'product'
                        ? category.products_count || 0
                        : category.menu_items_count || 0}{' '}
                    items
                </p>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'text-right',
            render: (category: Category) => (
                <div className="flex items-center justify-end space-x-2">
                    <button
                        onClick={() => openEditModal(category)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600"
                        title="Edit"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() =>
                            setDeleteModal({
                                show: true,
                                category,
                            })
                        }
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-xl font-semibold text-gray-900">
                    Category Management
                </h1>
            }
        >
            <Head title="Categories" />

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Total Categories"
                    value={stats.total}
                    icon={FolderOpen}
                    description="All categories"
                    color="blue"
                />
                <StatCard
                    title="Product Categories"
                    value={stats.product_categories}
                    icon={Package}
                    description="For inventory items"
                    color="purple"
                />
                <StatCard
                    title="Menu Categories"
                    value={stats.menu_categories}
                    icon={Tag}
                    description="For F&B items"
                    color="green"
                />
            </div>

            {/* Filters & Actions */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1 sm:max-w-md">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search categories..."
                            className="block w-full rounded-lg border-gray-300 pl-10 pr-4 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                </form>

                {/* Add Button */}
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <PlusIcon className="mr-2 h-5 w-5" />
                    Add Category
                </button>
            </div>

            {/* Type Filter Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => handleTypeFilter('all')}
                            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                                selectedType === 'all'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            All Categories
                            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900">
                                {stats.total}
                            </span>
                        </button>
                        <button
                            onClick={() => handleTypeFilter('product')}
                            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                                selectedType === 'product'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Product
                            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900">
                                {stats.product_categories}
                            </span>
                        </button>
                        <button
                            onClick={() => handleTypeFilter('menu')}
                            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                                selectedType === 'menu'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Menu
                            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900">
                                {stats.menu_categories}
                            </span>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={categories.data}
                onSort={handleSort}
                sortBy={filters.sort_by}
                sortOrder={filters.sort_order}
                emptyMessage="No categories found"
                emptyDescription="Get started by creating a new category"
            />

            {/* Pagination */}
            <Pagination
                currentPage={categories.current_page}
                lastPage={categories.last_page}
                perPage={categories.per_page}
                from={categories.from}
                to={categories.to}
                total={categories.total}
                links={categories.links}
            />

            {/* Category Form Modal */}
            <CategoryForm
                show={showModal}
                onClose={closeModal}
                category={selectedCategory}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, category: null })}
                onConfirm={handleDelete}
                title="Delete Category"
                message={`Are you sure you want to delete "${deleteModal.category?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </AuthenticatedLayout>
    );
}
