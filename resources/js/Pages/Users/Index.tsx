import ConfirmationModal from '@/Components/ConfirmationModal';
import Pagination from '@/Components/Pagination';
import RoleBadge from '@/Components/RoleBadge';
import StatCard from '@/Components/StatCard';
import Table from '@/Components/Table';
import UserAvatar from '@/Components/UserAvatar';
import UserFormModal from '@/Components/UserFormModal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import {
    EyeIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Activity, UserCheck, UserPlus, Users } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UsersIndexProps extends PageProps {
    users: {
        data: User[];
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
        role: string | null;
        sort_by: string;
        sort_order: 'asc' | 'desc';
    };
    stats: {
        total: number;
        by_role: {
            owner: number;
            admin: number;
            kasir: number;
            pelayan: number;
            user: number;
        };
        recent: number;
        active_today: number;
    };
    availableRoles: Record<string, string>;
}

export default function Index() {
    const { users, filters, availableRoles, stats } =
        usePage<UsersIndexProps>().props;
    const { flash } = usePage<PageProps>().props;

    // State
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
    const [createModal, setCreateModal] = useState(false);
    const [editModal, setEditModal] = useState<{
        show: boolean;
        user: User | null;
    }>({ show: false, user: null });
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        user: User | null;
    }>({ show: false, user: null });
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
            route('users.index'),
            {
                search: searchQuery || undefined,
                role: selectedRole !== 'all' ? selectedRole : undefined,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Role filter
    const handleRoleFilter = (role: string) => {
        setSelectedRole(role);
        router.get(
            route('users.index'),
            {
                search: searchQuery || undefined,
                role: role !== 'all' ? role : undefined,
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
            route('users.index'),
            {
                search: searchQuery || undefined,
                role: selectedRole !== 'all' ? selectedRole : undefined,
                sort_by: column,
                sort_order: newOrder,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Delete user
    const handleDelete = () => {
        if (!deleteModal.user) return;

        setDeleting(true);
        router.delete(route('users.destroy', deleteModal.user.id), {
            onFinish: () => {
                setDeleting(false);
                setDeleteModal({ show: false, user: null });
            },
        });
    };

    // Table columns configuration
    const columns = [
        {
            key: 'user',
            label: 'User',
            sortable: true,
            render: (user: User) => (
                <div className="flex items-center">
                    <UserAvatar name={user.name} role={user.role} size="sm" />
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                            {user.name}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
            render: (user: User) => (
                <p className="text-sm text-gray-600">{user.email}</p>
            ),
        },
        {
            key: 'role',
            label: 'Role',
            sortable: true,
            render: (user: User) => <RoleBadge role={user.role} />,
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (user: User) => (
                <p className="text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    })}
                </p>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'text-right',
            render: (user: User) => (
                <div className="flex items-center justify-end space-x-2">
                    <Link
                        href={route('users.show', user.id)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        title="View"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() =>
                            setEditModal({
                                show: true,
                                user,
                            })
                        }
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600"
                        title="Edit"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() =>
                            setDeleteModal({
                                show: true,
                                user,
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
                    User Management
                </h1>
            }
        >
            <Head title="User Management" />

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={stats.total}
                    icon={Users}
                    description="All registered users"
                    color="blue"
                />
                <StatCard
                    title="Admins & Staff"
                    value={
                        stats.by_role.admin +
                        stats.by_role.kasir +
                        stats.by_role.pelayan
                    }
                    icon={UserCheck}
                    description={`${stats.by_role.admin} admins, ${stats.by_role.kasir} kasir, ${stats.by_role.pelayan} pelayan`}
                    color="purple"
                />
                <StatCard
                    title="New This Month"
                    value={stats.recent}
                    icon={UserPlus}
                    description="Registered in last 30 days"
                    color="green"
                />
                <StatCard
                    title="Active Today"
                    value={stats.active_today}
                    icon={Activity}
                    description="Users active today"
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
                            placeholder="Search by name or email..."
                            className="w-full rounded-xl border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </form>

                {/* Role Filter & Create Button */}
                <div className="flex items-center gap-3">
                    <select
                        value={selectedRole}
                        onChange={(e) => handleRoleFilter(e.target.value)}
                        className="rounded-xl border-gray-200 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="all">All Roles</option>
                        {Object.entries(availableRoles).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => setCreateModal(true)}
                        className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create User
                    </button>
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={users.data}
                onSort={handleSort}
                sortBy={filters.sort_by}
                sortOrder={filters.sort_order}
                emptyMessage="No users found"
                emptyDescription="Try adjusting your search or filter"
            />

            {/* Pagination */}
            <Pagination
                currentPage={users.current_page}
                lastPage={users.last_page}
                perPage={users.per_page}
                total={users.total}
                from={users.from}
                to={users.to}
                links={users.links}
            />

            {/* Create/Edit Modal */}
            <UserFormModal
                show={createModal}
                onClose={() => setCreateModal(false)}
                availableRoles={availableRoles}
            />

            <UserFormModal
                show={editModal.show}
                onClose={() => setEditModal({ show: false, user: null })}
                user={editModal.user}
                availableRoles={availableRoles}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, user: null })}
                onConfirm={handleDelete}
                title="Delete User"
                message={`Are you sure you want to delete ${deleteModal.user?.name}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </AuthenticatedLayout>
    );
}
