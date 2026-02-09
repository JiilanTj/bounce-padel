import ConfirmationModal from '@/Components/ConfirmationModal';
import Pagination from '@/Components/Pagination';
import StatCard from '@/Components/StatCard';
import Table from '@/Components/Table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { formatCurrency } from '@/utils/currency';
import {
    MagnifyingGlassIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    BeakerIcon,
    CheckCircle,
    DollarSign,
    Package,
    Snowflake,
    Sun,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import IngredientForm from './Components/IngredientForm';

type Category = {
    id: number;
    name: string;
};

type Ingredient = {
    id: number;
    name: string;
    sku?: string | null;
    description?: string | null;
    unit: string;
    unit_type: string;
    current_stock: number | string;
    min_stock: number | string;
    max_stock: number | string;
    unit_price: number | string;
    supplier_name?: string | null;
    supplier_contact?: string | null;
    expiry_days?: number | null;
    storage_location: string;
    is_active: boolean;
    category?: Category | null;
    is_low_stock: boolean;
    created_at: string;
    updated_at: string;
};

interface IngredientsIndexProps extends PageProps {
    ingredients: {
        data: Ingredient[];
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
        category_id: string | null;
        storage_location: string | null;
        low_stock: string | null;
        is_active: string | null;
        sort_by: string;
        sort_order: 'asc' | 'desc';
    };
    stats: {
        total: number;
        active: number;
        low_stock: number;
        total_value: number;
    };
    categories: Category[];
}

export default function Index() {
    const { ingredients, filters, stats, categories } =
        usePage<IngredientsIndexProps>().props;
    const { flash, auth } = usePage<PageProps>().props;

    // State
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(
        filters.category_id || 'all',
    );
    const [selectedStorage, setSelectedStorage] = useState(
        filters.storage_location || 'all',
    );
    const [lowStockOnly, setLowStockOnly] = useState(filters.low_stock === '1');
    const [showModal, setShowModal] = useState(false);
    const [selectedIngredient, setSelectedIngredient] =
        useState<Ingredient | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        ingredient: Ingredient | null;
    }>({ show: false, ingredient: null });
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

    // Search handler
    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.get(
            route('ingredients.index'),
            {
                search: searchQuery || undefined,
                category_id:
                    selectedCategory !== 'all' ? selectedCategory : undefined,
                storage_location:
                    selectedStorage !== 'all' ? selectedStorage : undefined,
                low_stock: lowStockOnly ? '1' : undefined,
            },
            { preserveState: true },
        );
    };

    // Filter handler
    const handleFilter = () => {
        router.get(
            route('ingredients.index'),
            {
                search: searchQuery || undefined,
                category_id:
                    selectedCategory !== 'all' ? selectedCategory : undefined,
                storage_location:
                    selectedStorage !== 'all' ? selectedStorage : undefined,
                low_stock: lowStockOnly ? '1' : undefined,
            },
            { preserveState: true },
        );
    };

    // Modal handlers
    const openCreateModal = () => {
        setSelectedIngredient(null);
        setShowModal(true);
    };

    const openEditModal = (ingredient: Ingredient) => {
        setSelectedIngredient(ingredient);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedIngredient(null);
    };

    // Delete handlers
    const openDeleteModal = (ingredient: Ingredient) => {
        setDeleteModal({ show: true, ingredient });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ show: false, ingredient: null });
    };

    const handleDelete = () => {
        if (!deleteModal.ingredient) return;

        setDeleting(true);
        router.delete(route('ingredients.destroy', deleteModal.ingredient.id), {
            onSuccess: () => {
                closeDeleteModal();
                toast.success('Ingredient deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete ingredient');
            },
            onFinish: () => {
                setDeleting(false);
            },
        });
    };

    // Get storage location badge
    const getStorageBadge = (location: string) => {
        const badges: Record<string, { color: string; icon: React.ReactNode }> =
            {
                dry: {
                    color: 'bg-amber-100 text-amber-800',
                    icon: <Sun className="h-4 w-4" />,
                },
                chiller: {
                    color: 'bg-blue-100 text-blue-800',
                    icon: <Snowflake className="h-4 w-4" />,
                },
                freezer: {
                    color: 'bg-cyan-100 text-cyan-800',
                    icon: <Snowflake className="h-4 w-4" />,
                },
                shelf: {
                    color: 'bg-gray-100 text-gray-800',
                    icon: <Package className="h-4 w-4" />,
                },
            };

        const badge = badges[location] || badges.dry;

        return (
            <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}
            >
                {badge.icon}
                <span className="capitalize">{location}</span>
            </span>
        );
    };

    // Get low stock badge
    const getStockBadge = (ingredient: Ingredient) => {
        if (ingredient.is_low_stock) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    Low Stock
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                <CheckCircle className="h-4 w-4" />
                In Stock
            </span>
        );
    };

    const canManage = ['owner', 'admin'].includes(auth.user.role);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Ingredients Management
                </h2>
            }
        >
            <Head title="Ingredients Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Ingredients"
                            value={stats.total}
                            icon={BeakerIcon}
                            color="blue"
                        />
                        <StatCard
                            title="Active"
                            value={stats.active}
                            icon={CheckCircle}
                            color="green"
                        />
                        <StatCard
                            title="Low Stock"
                            value={stats.low_stock}
                            icon={AlertTriangle}
                            color="red"
                        />
                        <StatCard
                            title="Total Value"
                            value={formatCurrency(stats.total_value)}
                            icon={DollarSign}
                            color="purple"
                        />
                    </div>

                    {/* Filters & Search */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Search */}
                        <form
                            onSubmit={handleSearch}
                            className="flex-1 sm:max-w-md"
                        >
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search by name, SKU..."
                                    className="block w-full rounded-lg border-gray-300 pl-10 pr-4 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </form>

                        {/* Filters & Add Button */}
                        <div className="flex items-center gap-3">
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    handleFilter();
                                }}
                                className="rounded-lg border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="all">All Categories</option>
                                {categories.map((cat) => (
                                    <option
                                        key={cat.id}
                                        value={cat.id.toString()}
                                    >
                                        {cat.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedStorage}
                                onChange={(e) => {
                                    setSelectedStorage(e.target.value);
                                    handleFilter();
                                }}
                                className="rounded-lg border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="all">All Storage</option>
                                <option value="dry">Dry</option>
                                <option value="chiller">Chiller</option>
                                <option value="freezer">Freezer</option>
                                <option value="shelf">Shelf</option>
                            </select>

                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={lowStockOnly}
                                    onChange={(e) => {
                                        setLowStockOnly(e.target.checked);
                                        setTimeout(() => handleFilter(), 0);
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                Low Stock Only
                            </label>

                            {canManage && (
                                <button
                                    onClick={openCreateModal}
                                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <PlusIcon className="mr-2 h-5 w-5" />
                                    Add Ingredient
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <Table
                        columns={[
                            {
                                key: 'name',
                                label: 'Name / SKU',
                                sortable: true,
                                render: (item: Ingredient) => (
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900">
                                                {item.name}
                                            </span>
                                            {!item.is_active && (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        {item.sku && (
                                            <div className="text-sm text-gray-500">
                                                SKU: {item.sku}
                                            </div>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: 'category',
                                label: 'Category',
                                sortable: false,
                                render: (item: Ingredient) => (
                                    <span className="text-sm text-gray-500">
                                        {item.category?.name || '-'}
                                    </span>
                                ),
                            },
                            {
                                key: 'stock',
                                label: 'Stock',
                                sortable: true,
                                render: (item: Ingredient) => (
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {Number(item.current_stock).toFixed(
                                                3,
                                            )}{' '}
                                            {item.unit}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Min:{' '}
                                            {Number(item.min_stock).toFixed(3)}
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: 'unit_price',
                                label: 'Unit Price',
                                sortable: true,
                                render: (item: Ingredient) => (
                                    <span className="text-sm text-gray-900">
                                        {formatCurrency(
                                            Number(item.unit_price),
                                        )}
                                    </span>
                                ),
                            },
                            {
                                key: 'storage_location',
                                label: 'Storage',
                                sortable: true,
                                render: (item: Ingredient) =>
                                    getStorageBadge(item.storage_location),
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                sortable: false,
                                render: (item: Ingredient) =>
                                    getStockBadge(item),
                            },
                            {
                                key: 'actions',
                                label: 'Actions',
                                sortable: false,
                                className: 'text-right',
                                render: (item: Ingredient) =>
                                    canManage && (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    openEditModal(item)
                                                }
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    openDeleteModal(item)
                                                }
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ),
                            },
                        ]}
                        data={ingredients.data}
                        emptyMessage="No ingredients found"
                        emptyDescription="Get started by adding a new ingredient"
                    />

                    {/* Pagination */}
                    <Pagination
                        currentPage={ingredients.current_page}
                        lastPage={ingredients.last_page}
                        perPage={ingredients.per_page}
                        from={ingredients.from}
                        to={ingredients.to}
                        total={ingredients.total}
                        links={ingredients.links}
                    />
                </div>
            </div>

            {/* Create/Edit Modal */}
            <IngredientForm
                show={showModal}
                onClose={closeModal}
                ingredient={selectedIngredient}
                categories={categories}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={deleteModal.show}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title="Delete Ingredient"
                message={`Are you sure you want to delete "${deleteModal.ingredient?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </AuthenticatedLayout>
    );
}
