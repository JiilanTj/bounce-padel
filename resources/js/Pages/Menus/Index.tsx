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
import { BookOpen, CheckCircle, List, XCircle } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import MenuForm from './Components/MenuForm';

type Menu = {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    items_count?: number;
};

interface MenusIndexProps extends PageProps {
    menus: {
        data: Menu[];
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
        sort_by: string;
        sort_order: 'asc' | 'desc';
    };
    stats: {
        total: number;
        active: number;
        inactive: number;
        total_items: number;
    };
}

export default function Index() {
    const { menus, filters, stats } = usePage<MenusIndexProps>().props;
    const { flash } = usePage<PageProps>().props;

    // State
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(
        filters.status || 'all',
    );
    const [showModal, setShowModal] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        menu: Menu | null;
    }>({ show: false, menu: null });
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
            route('menus.index'),
            {
                search: searchQuery || undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Status filter
    const handleStatusFilter = (status: string) => {
        setSelectedStatus(status);
        router.get(
            route('menus.index'),
            {
                search: searchQuery || undefined,
                status: status !== 'all' ? status : undefined,
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
            route('menus.index'),
            {
                search: searchQuery || undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
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
        setSelectedMenu(null);
        setShowModal(true);
    };

    const openEditModal = (menu: Menu) => {
        setSelectedMenu(menu);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedMenu(null);
    };

    // Delete menu
    const handleDelete = () => {
        if (!deleteModal.menu) return;

        setDeleting(true);
        router.delete(route('menus.destroy', deleteModal.menu.id), {
            onFinish: () => {
                setDeleting(false);
                setDeleteModal({ show: false, menu: null });
            },
        });
    };

    // Table columns configuration
    const columns = [
        {
            key: 'name',
            label: 'Menu',
            sortable: true,
            render: (menu: Menu) => (
                <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                            {menu.name}
                        </p>
                        {menu.description && (
                            <p className="text-xs text-gray-500">
                                {menu.description}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            sortable: true,
            render: (menu: Menu) => (
                <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        menu.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                >
                    {menu.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'items_count',
            label: 'Items',
            sortable: false,
            render: (menu: Menu) => (
                <p className="text-sm text-gray-600">
                    {menu.items_count || 0} items
                </p>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'text-right',
            render: (menu: Menu) => (
                <div className="flex items-center justify-end space-x-2">
                    <button
                        onClick={() => openEditModal(menu)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600"
                        title="Edit"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() =>
                            setDeleteModal({
                                show: true,
                                menu,
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
                    Menu Management
                </h1>
            }
        >
            <Head title="Menus" />

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Menus"
                    value={stats.total}
                    icon={BookOpen}
                    description="All F&B menus"
                    color="blue"
                />
                <StatCard
                    title="Active Menus"
                    value={stats.active}
                    icon={CheckCircle}
                    description="Currently available"
                    color="green"
                />
                <StatCard
                    title="Inactive Menus"
                    value={stats.inactive}
                    icon={XCircle}
                    description="Not available"
                    color="red"
                />
                <StatCard
                    title="Total Items"
                    value={stats.total_items}
                    icon={List}
                    description="Across all menus"
                    color="purple"
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
                            placeholder="Search menus..."
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
                    Add Menu
                </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => handleStatusFilter('all')}
                            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                                selectedStatus === 'all'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            All Menus
                            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900">
                                {stats.total}
                            </span>
                        </button>
                        <button
                            onClick={() => handleStatusFilter('active')}
                            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                                selectedStatus === 'active'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Active
                            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900">
                                {stats.active}
                            </span>
                        </button>
                        <button
                            onClick={() => handleStatusFilter('inactive')}
                            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                                selectedStatus === 'inactive'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Inactive
                            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900">
                                {stats.inactive}
                            </span>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={menus.data}
                onSort={handleSort}
                sortBy={filters.sort_by}
                sortOrder={filters.sort_order}
                emptyMessage="No menus found"
                emptyDescription="Get started by creating a new menu"
            />

            {/* Pagination */}
            <Pagination
                currentPage={menus.current_page}
                lastPage={menus.last_page}
                perPage={menus.per_page}
                from={menus.from}
                to={menus.to}
                total={menus.total}
                links={menus.links}
            />

            {/* Menu Form Modal */}
            <MenuForm
                show={showModal}
                onClose={closeModal}
                menu={selectedMenu}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, menu: null })}
                onConfirm={handleDelete}
                title="Delete Menu"
                message={`Are you sure you want to delete "${deleteModal.menu?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </AuthenticatedLayout>
    );
}
