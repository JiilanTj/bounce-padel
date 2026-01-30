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
import { Activity, AlertCircle, CheckCircle, CircleDot } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import CourtForm from './Components/CourtForm';

type OperatingHour = {
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_closed: boolean;
};

type Court = {
    id: number;
    name: string;
    type: 'indoor' | 'outdoor';
    surface: string;
    status: 'active' | 'maintenance' | 'closed';
    price_per_hour: number;
    operating_hours?: OperatingHour[];
    image_path?: string | null;
    image_url?: string | null;
};

interface CourtsIndexProps extends PageProps {
    courts: {
        data: Court[];
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
        type: string | null;
        sort_by: string;
        sort_order: 'asc' | 'desc';
    };
    stats: {
        total: number;
        active: number;
        maintenance: number;
        closed: number;
    };
}

export default function Index() {
    const { courts, filters, stats } = usePage<CourtsIndexProps>().props;
    const { flash } = usePage<PageProps>().props;

    // State
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(
        filters.status || 'all',
    );
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [showModal, setShowModal] = useState(false);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        court: Court | null;
    }>({ show: false, court: null });
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
            route('courts.index'),
            {
                search: searchQuery || undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
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

    // Status filter
    const handleStatusFilter = (status: string) => {
        setSelectedStatus(status);
        router.get(
            route('courts.index'),
            {
                search: searchQuery || undefined,
                status: status !== 'all' ? status : undefined,
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
            route('courts.index'),
            {
                search: searchQuery || undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
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
            route('courts.index'),
            {
                search: searchQuery || undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
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
        setSelectedCourt(null);
        setShowModal(true);
    };

    const openEditModal = (court: Court) => {
        setSelectedCourt(court);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCourt(null);
    };

    // Delete court
    const handleDelete = () => {
        if (!deleteModal.court) return;

        setDeleting(true);
        router.delete(route('courts.destroy', deleteModal.court.id), {
            onFinish: () => {
                setDeleting(false);
                setDeleteModal({ show: false, court: null });
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
            label: 'Court',
            sortable: true,
            render: (court: Court) => (
                <div className="flex items-center">
                    {court.image_path ? (
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                            <img
                                src={court.image_path}
                                alt={court.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                            <CircleDot className="h-5 w-5" />
                        </div>
                    )}
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                            {court.name}
                        </p>
                        <p className="text-xs text-gray-500">{court.surface}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'type',
            label: 'Type',
            sortable: true,
            render: (court: Court) => (
                <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        court.type === 'indoor'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-sky-100 text-sky-800'
                    }`}
                >
                    {court.type === 'indoor' ? 'Indoor' : 'Outdoor'}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (court: Court) => (
                <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        court.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : court.status === 'maintenance'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                    }`}
                >
                    {court.status === 'active'
                        ? 'Active'
                        : court.status === 'maintenance'
                          ? 'Maintenance'
                          : 'Closed'}
                </span>
            ),
        },
        {
            key: 'price_per_hour',
            label: 'Price/Hour',
            sortable: true,
            className: 'text-right',
            render: (court: Court) => (
                <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(court.price_per_hour)}
                </p>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'text-right',
            render: (court: Court) => (
                <div className="flex items-center justify-end space-x-2">
                    <button
                        onClick={() => openEditModal(court)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600"
                        title="Edit"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() =>
                            setDeleteModal({
                                show: true,
                                court,
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
                    Court Management
                </h1>
            }
        >
            <Head title="Courts" />

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Courts"
                    value={stats.total}
                    icon={CircleDot}
                    description="All courts"
                    color="blue"
                />
                <StatCard
                    title="Active Courts"
                    value={stats.active}
                    icon={CheckCircle}
                    description="Ready for booking"
                    color="green"
                />
                <StatCard
                    title="Under Maintenance"
                    value={stats.maintenance}
                    icon={Activity}
                    description="Being serviced"
                    color="orange"
                />
                <StatCard
                    title="Closed Courts"
                    value={stats.closed}
                    icon={AlertCircle}
                    description="Not available"
                    color="red"
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
                            placeholder="Search courts..."
                            className="block w-full rounded-lg border-gray-300 pl-10 pr-4 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                </form>

                {/* Type Filter & Add Button */}
                <div className="flex items-center gap-3">
                    <select
                        value={selectedType}
                        onChange={(e) => handleTypeFilter(e.target.value)}
                        className="rounded-lg border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="all">All Types</option>
                        <option value="indoor">Indoor</option>
                        <option value="outdoor">Outdoor</option>
                    </select>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <PlusIcon className="mr-2 h-5 w-5" />
                        Add Court
                    </button>
                </div>
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
                            All Courts
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
                            onClick={() => handleStatusFilter('maintenance')}
                            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                                selectedStatus === 'maintenance'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Maintenance
                            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900">
                                {stats.maintenance}
                            </span>
                        </button>
                        <button
                            onClick={() => handleStatusFilter('closed')}
                            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                                selectedStatus === 'closed'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Closed
                            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900">
                                {stats.closed}
                            </span>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={courts.data}
                onSort={handleSort}
                sortBy={filters.sort_by}
                sortOrder={filters.sort_order}
                emptyMessage="No courts found"
                emptyDescription="Get started by adding a new court"
            />

            {/* Pagination */}
            <Pagination
                currentPage={courts.current_page}
                lastPage={courts.last_page}
                perPage={courts.per_page}
                from={courts.from}
                to={courts.to}
                total={courts.total}
                links={courts.links}
            />

            {/* Court Form Modal */}
            <CourtForm
                show={showModal}
                onClose={closeModal}
                court={selectedCourt}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, court: null })}
                onConfirm={handleDelete}
                title="Delete Court"
                message={`Are you sure you want to delete "${deleteModal.court?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </AuthenticatedLayout>
    );
}
