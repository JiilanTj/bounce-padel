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
import { ChefHat, DollarSign, List, Utensils } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import MenuItemForm from './Components/MenuItemForm';

type Menu = {
    id: number;
    name: string;
};

type MenuItem = {
    id: number;
    menu_id: number;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_available: boolean;
    menu?: Menu;
};

interface MenuItemsIndexProps extends PageProps {
    menuItems: {
        data: MenuItem[];
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
    menus: Menu[];
    filters: {
        search: string | null;
        menu_id: string | null;
        sort_by: string;
        sort_order: 'asc' | 'desc';
    };
    stats: {
        total: number;
        by_menu: Record<number, number>;
        avg_price: number;
    };
}

export default function Index() {
    const { menuItems, menus, filters, stats } =
        usePage<MenuItemsIndexProps>().props;
    const { flash } = usePage<PageProps>().props;

    // State
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedMenu, setSelectedMenu] = useState(filters.menu_id || 'all');
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        item: MenuItem | null;
    }>({ show: false, item: null });
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
            route('menu-items.index'),
            {
                search: searchQuery || undefined,
                menu_id: selectedMenu !== 'all' ? selectedMenu : undefined,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Menu filter
    const handleMenuFilter = (menuId: string) => {
        setSelectedMenu(menuId);
        router.get(
            route('menu-items.index'),
            {
                search: searchQuery || undefined,
                menu_id: menuId !== 'all' ? menuId : undefined,
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
            route('menu-items.index'),
            {
                search: searchQuery || undefined,
                menu_id: selectedMenu !== 'all' ? selectedMenu : undefined,
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
        setSelectedItem(null);
        setShowModal(true);
    };

    const openEditModal = (item: MenuItem) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
    };

    // Delete item
    const handleDelete = () => {
        if (!deleteModal.item) return;

        setDeleting(true);
        router.delete(route('menu-items.destroy', deleteModal.item.id), {
            onFinish: () => {
                setDeleting(false);
                setDeleteModal({ show: false, item: null });
            },
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Table columns configuration
    const columns = [
        {
            key: 'name',
            label: 'Item',
            sortable: true,
            render: (item: MenuItem) => (
                <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
                        <Utensils className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                            {item.name}
                        </p>
                        {item.description && (
                            <p className="text-xs text-gray-500">
                                {item.description}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'menu',
            label: 'Menu',
            sortable: false,
            render: (item: MenuItem) => (
                <p className="text-sm text-gray-600">
                    {item.menu?.name || '-'}
                </p>
            ),
        },
        {
            key: 'price',
            label: 'Price',
            sortable: true,
            className: 'text-right',
            render: (item: MenuItem) => (
                <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.price)}
                </p>
            ),
        },
        {
            key: 'is_available',
            label: 'Available',
            sortable: true,
            render: (item: MenuItem) => (
                <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.is_available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                >
                    {item.is_available ? 'Yes' : 'No'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'text-right',
            render: (item: MenuItem) => (
                <div className="flex items-center justify-end space-x-2">
                    <button
                        onClick={() => openEditModal(item)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600"
                        title="Edit"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() =>
                            setDeleteModal({
                                show: true,
                                item,
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
                    Menu Items
                </h1>
            }
        >
            <Head title="Menu Items" />

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Total Items"
                    value={stats.total}
                    icon={List}
                    description="All menu items"
                    color="blue"
                />
                <StatCard
                    title="Average Price"
                    value={formatCurrency(stats.avg_price || 0)}
                    icon={DollarSign}
                    description="Across all items"
                    color="green"
                />
                <StatCard
                    title="Menus"
                    value={menus.length}
                    icon={ChefHat}
                    description="Total menus"
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
                            placeholder="Search menu items..."
                            className="block w-full rounded-lg border-gray-300 pl-10 pr-4 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                </form>

                {/* Menu Filter & Add Button */}
                <div className="flex items-center gap-3">
                    <select
                        value={selectedMenu}
                        onChange={(e) => handleMenuFilter(e.target.value)}
                        className="rounded-lg border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="all">All Menus</option>
                        {menus.map((menu) => (
                            <option key={menu.id} value={menu.id}>
                                {menu.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <PlusIcon className="mr-2 h-5 w-5" />
                        Add Item
                    </button>
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={menuItems.data}
                onSort={handleSort}
                sortBy={filters.sort_by}
                sortOrder={filters.sort_order}
                emptyMessage="No menu items found"
                emptyDescription="Get started by adding a new menu item"
            />

            {/* Pagination */}
            <Pagination
                currentPage={menuItems.current_page}
                lastPage={menuItems.last_page}
                perPage={menuItems.per_page}
                from={menuItems.from}
                to={menuItems.to}
                total={menuItems.total}
                links={menuItems.links}
            />

            {/* Menu Item Form Modal */}
            <MenuItemForm
                show={showModal}
                onClose={closeModal}
                menuItem={selectedItem}
                menus={menus}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, item: null })}
                onConfirm={handleDelete}
                title="Delete Menu Item"
                message={`Are you sure you want to delete "${deleteModal.item?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </AuthenticatedLayout>
    );
}
