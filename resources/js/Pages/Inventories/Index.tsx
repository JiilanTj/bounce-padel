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
    Archive,
    CheckCircle,
    DollarSign,
    PackageX,
    Wrench,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import InventoryForm from './Components/InventoryForm';

type Inventory = {
    id: number;
    name: string;
    image_path?: string | null;
    price: number;
    quantity: number;
    owner_name: string;
    status: 'functional' | 'damaged' | 'lost' | 'maintenance' | 'retired';
    sku?: string | null;
    description?: string | null;
    location?: string | null;
    category?: string | null;
    purchase_date?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
};

interface InventoriesIndexProps extends PageProps {
    inventories: {
        data: Inventory[];
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
        status: string | null;
        category: string | null;
        sort_by: string;
        sort_order: 'asc' | 'desc';
    };
    stats: {
        total: number;
        functional: number;
        damaged: number;
        lost: number;
        maintenance: number;
        total_value: number;
    };
}

export default function Index() {
    const { inventories, filters, stats } =
        usePage<InventoriesIndexProps>().props;
    const { flash, auth } = usePage<PageProps>().props;

    // State
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(
        filters.status || 'all',
    );
    const [selectedCategory, setSelectedCategory] = useState(
        filters.category || 'all',
    );
    const [showModal, setShowModal] = useState(false);
    const [selectedInventory, setSelectedInventory] =
        useState<Inventory | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        inventory: Inventory | null;
    }>({ show: false, inventory: null });
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
            route('inventories.index'),
            {
                search: searchQuery || undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                category:
                    selectedCategory !== 'all' ? selectedCategory : undefined,
            },
            { preserveState: true },
        );
    };

    // Filter handler
    const handleFilter = (status: string, category: string) => {
        router.get(
            route('inventories.index'),
            {
                search: searchQuery || undefined,
                status: status !== 'all' ? status : undefined,
                category: category !== 'all' ? category : undefined,
            },
            { preserveState: true },
        );
    };

    // Modal handlers
    const openCreateModal = () => {
        setSelectedInventory(null);
        setShowModal(true);
    };

    const openEditModal = (inventory: Inventory) => {
        setSelectedInventory(inventory);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedInventory(null);
    };

    // Delete handlers
    const openDeleteModal = (inventory: Inventory) => {
        setDeleteModal({ show: true, inventory });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ show: false, inventory: null });
    };

    const handleDelete = () => {
        if (!deleteModal.inventory) return;

        setDeleting(true);
        router.delete(route('inventories.destroy', deleteModal.inventory.id), {
            onSuccess: () => {
                closeDeleteModal();
                toast.success('Inventory item deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete inventory item');
            },
            onFinish: () => {
                setDeleting(false);
            },
        });
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; icon: React.ReactNode }> =
            {
                functional: {
                    color: 'bg-green-100 text-green-800',
                    icon: <CheckCircle className="h-4 w-4" />,
                },
                damaged: {
                    color: 'bg-red-100 text-red-800',
                    icon: <AlertTriangle className="h-4 w-4" />,
                },
                lost: {
                    color: 'bg-gray-100 text-gray-800',
                    icon: <PackageX className="h-4 w-4" />,
                },
                maintenance: {
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: <Wrench className="h-4 w-4" />,
                },
                retired: {
                    color: 'bg-purple-100 text-purple-800',
                    icon: <Archive className="h-4 w-4" />,
                },
            };

        const badge = badges[status] || badges.functional;

        return (
            <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}
            >
                {badge.icon}
                <span className="capitalize">{status}</span>
            </span>
        );
    };

    const canManage = ['owner', 'admin'].includes(auth.user.role);

    // Get unique categories from inventory data
    const uniqueCategories = Array.from(
        new Set(
            inventories.data
                .map((item) => item.category)
                .filter((cat) => cat != null),
        ),
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Inventory Management
                </h2>
            }
        >
            <Head title="Inventory Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <StatCard
                            title="Total Items"
                            value={stats.total}
                            icon={Archive}
                            color="blue"
                        />
                        <StatCard
                            title="Functional"
                            value={stats.functional}
                            icon={CheckCircle}
                            color="green"
                        />
                        <StatCard
                            title="Damaged"
                            value={stats.damaged}
                            icon={AlertTriangle}
                            color="red"
                        />
                        <StatCard
                            title="Maintenance"
                            value={stats.maintenance}
                            icon={Wrench}
                            color="orange"
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
                                    placeholder="Search by name, SKU, or owner..."
                                    className="block w-full rounded-lg border-gray-300 pl-10 pr-4 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </form>

                        {/* Filters & Add Button */}
                        <div className="flex items-center gap-3">
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    handleFilter(
                                        e.target.value,
                                        selectedCategory,
                                    );
                                }}
                                className="rounded-lg border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="functional">Functional</option>
                                <option value="damaged">Damaged</option>
                                <option value="lost">Lost</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="retired">Retired</option>
                            </select>

                            {uniqueCategories.length > 0 && (
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        handleFilter(
                                            selectedStatus,
                                            e.target.value,
                                        );
                                    }}
                                    className="rounded-lg border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="all">All Categories</option>
                                    {uniqueCategories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {canManage && (
                                <button
                                    onClick={openCreateModal}
                                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <PlusIcon className="mr-2 h-5 w-5" />
                                    Add Inventory Item
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <Table
                        columns={[
                            {
                                key: 'image',
                                label: 'Image',
                                sortable: false,
                                render: (item: Inventory) =>
                                    item.image_path ? (
                                        <img
                                            src={item.image_path}
                                            alt={item.name}
                                            className="h-12 w-12 rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-200 text-gray-400">
                                            <Archive className="h-6 w-6" />
                                        </div>
                                    ),
                            },
                            {
                                key: 'name',
                                label: 'Name / SKU',
                                sortable: true,
                                render: (item: Inventory) => (
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {item.name}
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
                                key: 'owner_name',
                                label: 'Owner',
                                sortable: true,
                                render: (item: Inventory) => (
                                    <span className="text-sm text-gray-900">
                                        {item.owner_name}
                                    </span>
                                ),
                            },
                            {
                                key: 'category',
                                label: 'Category',
                                sortable: false,
                                render: (item: Inventory) => (
                                    <span className="text-sm text-gray-500">
                                        {item.category || '-'}
                                    </span>
                                ),
                            },
                            {
                                key: 'quantity',
                                label: 'Quantity',
                                sortable: true,
                                render: (item: Inventory) => (
                                    <span className="text-sm text-gray-900">
                                        {item.quantity}
                                    </span>
                                ),
                            },
                            {
                                key: 'price',
                                label: 'Price',
                                sortable: true,
                                render: (item: Inventory) => (
                                    <span className="text-sm text-gray-900">
                                        {formatCurrency(item.price)}
                                    </span>
                                ),
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                sortable: true,
                                render: (item: Inventory) =>
                                    getStatusBadge(item.status),
                            },
                            {
                                key: 'actions',
                                label: 'Actions',
                                sortable: false,
                                className: 'text-right',
                                render: (item: Inventory) =>
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
                        data={inventories.data}
                        emptyMessage="No inventory items found"
                        emptyDescription="Get started by adding a new inventory item"
                    />

                    {/* Pagination */}
                    <Pagination
                        currentPage={inventories.current_page}
                        lastPage={inventories.last_page}
                        perPage={inventories.per_page}
                        from={inventories.from}
                        to={inventories.to}
                        total={inventories.total}
                        links={inventories.links}
                    />
                </div>
            </div>

            {/* Create/Edit Modal */}
            <InventoryForm
                show={showModal}
                onClose={closeModal}
                inventory={selectedInventory}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={deleteModal.show}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title="Delete Inventory Item"
                message={`Are you sure you want to delete "${deleteModal.inventory?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </AuthenticatedLayout>
    );
}
