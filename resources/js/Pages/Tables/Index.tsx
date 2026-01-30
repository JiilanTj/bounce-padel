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
    QrCodeIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle, Clock, Layers, XCircle } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import TableForm from './Components/TableForm';

type TableData = {
    id: number;
    number: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
    qr_code: string;
};

interface TablesIndexProps extends PageProps {
    tables: {
        data: TableData[];
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
        available: number;
        occupied: number;
        reserved: number;
    };
}

export default function Index() {
    const { tables, filters, stats } = usePage<TablesIndexProps>().props;
    const { flash } = usePage<PageProps>().props;

    // State
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(
        filters.status || 'all',
    );
    const [showModal, setShowModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        table: TableData | null;
    }>({ show: false, table: null });
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
            route('tables.index'),
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
            route('tables.index'),
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
            route('tables.index'),
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
        setSelectedTable(null);
        setShowModal(true);
    };

    const openEditModal = (table: TableData) => {
        setSelectedTable(table);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedTable(null);
    };

    // Delete table
    const handleDelete = () => {
        if (!deleteModal.table) return;

        setDeleting(true);
        router.delete(route('tables.destroy', deleteModal.table.id), {
            onFinish: () => {
                setDeleting(false);
                setDeleteModal({ show: false, table: null });
            },
        });
    };

    // Table columns configuration
    const columns = [
        {
            key: 'number',
            label: 'Table',
            sortable: true,
            render: (table: TableData) => (
                <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                        <Layers className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                            Table {table.number}
                        </p>
                        <p className="text-xs text-gray-500">
                            Capacity: {table.capacity} people
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (table: TableData) => (
                <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        table.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : table.status === 'occupied'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                    }`}
                >
                    {table.status === 'available'
                        ? 'Available'
                        : table.status === 'occupied'
                          ? 'Occupied'
                          : 'Reserved'}
                </span>
            ),
        },
        {
            key: 'qr_code',
            label: 'QR Code',
            sortable: false,
            render: (table: TableData) => (
                <div className="flex items-center">
                    <QrCodeIcon className="mr-2 h-5 w-5 text-gray-400" />
                    <span className="font-mono text-xs text-gray-600">
                        {table.qr_code}
                    </span>
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'text-right',
            render: (table: TableData) => (
                <div className="flex items-center justify-end space-x-2">
                    <button
                        onClick={() => openEditModal(table)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600"
                        title="Edit"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() =>
                            setDeleteModal({
                                show: true,
                                table,
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
                    Table Management
                </h1>
            }
        >
            <Head title="Tables" />

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Tables"
                    value={stats.total}
                    icon={Layers}
                    description="All tables"
                    color="blue"
                />
                <StatCard
                    title="Available"
                    value={stats.available}
                    icon={CheckCircle}
                    description="Ready for customers"
                    color="green"
                />
                <StatCard
                    title="Occupied"
                    value={stats.occupied}
                    icon={XCircle}
                    description="Currently in use"
                    color="red"
                />
                <StatCard
                    title="Reserved"
                    value={stats.reserved}
                    icon={Clock}
                    description="Booked ahead"
                    color="orange"
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
                            placeholder="Search tables..."
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
                    Add Table
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
                            All Tables
                            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900">
                                {stats.total}
                            </span>
                        </button>
                        <button
                            onClick={() => handleStatusFilter('available')}
                            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                                selectedStatus === 'available'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Available
                            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900">
                                {stats.available}
                            </span>
                        </button>
                        <button
                            onClick={() => handleStatusFilter('occupied')}
                            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                                selectedStatus === 'occupied'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Occupied
                            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900">
                                {stats.occupied}
                            </span>
                        </button>
                        <button
                            onClick={() => handleStatusFilter('reserved')}
                            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                                selectedStatus === 'reserved'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Reserved
                            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900">
                                {stats.reserved}
                            </span>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={tables.data}
                onSort={handleSort}
                sortBy={filters.sort_by}
                sortOrder={filters.sort_order}
                emptyMessage="No tables found"
                emptyDescription="Get started by adding a new table"
            />

            {/* Pagination */}
            <Pagination
                currentPage={tables.current_page}
                lastPage={tables.last_page}
                perPage={tables.per_page}
                from={tables.from}
                to={tables.to}
                total={tables.total}
                links={tables.links}
            />

            {/* Table Form Modal */}
            <TableForm
                show={showModal}
                onClose={closeModal}
                table={selectedTable}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, table: null })}
                onConfirm={handleDelete}
                title="Delete Table"
                message={`Are you sure you want to delete Table ${deleteModal.table?.number}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </AuthenticatedLayout>
    );
}
