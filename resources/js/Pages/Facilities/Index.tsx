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
import { CheckCircle, Home, XCircle } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import FacilityForm from './Components/FacilityForm';

type Facility = {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    image_path: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
    created_at: string;
    updated_at: string;
};

interface FacilitiesIndexProps extends PageProps {
    facilities: {
        data: Facility[];
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
    };
}

export default function Index() {
    const { facilities, filters, stats } =
        usePage<FacilitiesIndexProps>().props;
    const { flash } = usePage<PageProps>().props;

    // State
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(
        filters.status || 'all',
    );
    const [showModal, setShowModal] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
        null,
    );
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        facility: Facility | null;
    }>({ show: false, facility: null });
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
            route('facilities.index'),
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
            route('facilities.index'),
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
            route('facilities.index'),
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
        setSelectedFacility(null);
        setShowModal(true);
    };

    const openEditModal = (facility: Facility) => {
        setSelectedFacility(facility);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedFacility(null);
    };

    // Delete facility
    const handleDelete = () => {
        if (!deleteModal.facility) return;

        setDeleting(true);
        router.delete(route('facilities.destroy', deleteModal.facility.id), {
            onSuccess: () => {
                setDeleteModal({ show: false, facility: null });
                toast.success('Facility deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete facility');
            },
            onFinish: () => {
                setDeleting(false);
            },
        });
    };

    // Stats cards data
    const statsCards = [
        {
            title: 'Total Facilities',
            value: stats.total.toString(),
            icon: Home,
            color: 'blue' as const,
            description: 'All facilities',
        },
        {
            title: 'Active',
            value: stats.active.toString(),
            icon: CheckCircle,
            color: 'green' as const,
            description: 'Active facilities',
        },
        {
            title: 'Inactive',
            value: stats.inactive.toString(),
            icon: XCircle,
            color: 'red' as const,
            description: 'Inactive facilities',
        },
    ];

    // Table columns
    const columns = [
        {
            key: 'name',
            label: 'Facility',
            sortable: true,
            render: (facility: Facility) => (
                <div className="flex items-center gap-3">
                    {facility.image_path ? (
                        <img
                            src={facility.image_path}
                            alt={facility.name}
                            className="h-10 w-10 rounded-lg object-cover"
                        />
                    ) : facility.icon ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                            <span className="material-symbols-outlined text-lg text-gray-600">
                                {facility.icon}
                            </span>
                        </div>
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                            <Home className="h-5 w-5 text-gray-400" />
                        </div>
                    )}
                    <div>
                        <div className="font-medium text-gray-900">
                            {facility.name}
                        </div>
                        {facility.description && (
                            <div className="line-clamp-1 text-sm text-gray-500">
                                {facility.description}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (facility: Facility) => (
                <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        facility.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                >
                    {facility.status === 'active' ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'sort_order',
            label: 'Order',
            sortable: true,
            className: 'text-center',
            render: (facility: Facility) => (
                <span className="text-sm text-gray-900">
                    {facility.sort_order}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'text-right',
            render: (facility: Facility) => (
                <div className="flex items-center justify-end space-x-2">
                    <button
                        onClick={() => openEditModal(facility)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600"
                        title="Edit"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() =>
                            setDeleteModal({
                                show: true,
                                facility,
                            })
                        }
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600"
                        title="Delete"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Facilities" />

            <div className="mx-auto max-w-7xl space-y-8 p-6 pt-0">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Facility Management
                    </h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {statsCards.map((stat, index) => (
                        <StatCard
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                            description={stat.description}
                        />
                    ))}
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:flex-row sm:items-center sm:justify-between">
                    <form
                        onSubmit={handleSearch}
                        className="flex-1 sm:max-w-md"
                    >
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search facilities..."
                                className="block w-full rounded-lg border-gray-300 pl-10 pr-4 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                    </form>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleStatusFilter('all')}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                selectedStatus === 'all'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => handleStatusFilter('active')}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                selectedStatus === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => handleStatusFilter('inactive')}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                selectedStatus === 'inactive'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Inactive
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Facility
                        </button>
                    </div>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    data={facilities.data}
                    onSort={handleSort}
                    sortBy={filters.sort_by}
                    sortOrder={filters.sort_order}
                    emptyMessage="No facilities found"
                    emptyDescription="Get started by adding a new facility"
                />

                {/* Pagination */}
                <Pagination
                    currentPage={facilities.current_page}
                    lastPage={facilities.last_page}
                    perPage={facilities.per_page}
                    from={facilities.from}
                    to={facilities.to}
                    total={facilities.total}
                    links={facilities.links}
                />

                {/* Facility Form Modal */}
                <FacilityForm
                    show={showModal}
                    onClose={closeModal}
                    facility={selectedFacility}
                />

                {/* Delete Confirmation Modal */}
                <ConfirmationModal
                    show={deleteModal.show}
                    onClose={() =>
                        setDeleteModal({ show: false, facility: null })
                    }
                    onConfirm={handleDelete}
                    title="Delete Facility"
                    message={`Are you sure you want to delete "${deleteModal.facility?.name}"? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="danger"
                    loading={deleting}
                />
            </div>
        </AuthenticatedLayout>
    );
}
