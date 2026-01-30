import ConfirmationModal from '@/Components/ConfirmationModal';
import RoleBadge from '@/Components/RoleBadge';
import UserAvatar from '@/Components/UserAvatar';
import UserFormModal from '@/Components/UserFormModal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import {
    ArrowLeftIcon,
    CalendarIcon,
    EnvelopeIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface UserShowProps extends PageProps {
    user: User & {
        bookings_count?: number;
        orders_count?: number;
    };
    availableRoles: Record<string, string>;
}

export default function Show() {
    const { user, availableRoles } = usePage<UserShowProps>().props;
    const { flash } = usePage<PageProps>().props;

    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        setDeleting(true);
        router.delete(route('users.destroy', user.id), {
            onSuccess: () => {
                router.visit(route('users.index'));
            },
            onFinish: () => {
                setDeleting(false);
                setDeleteModal(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-900">
                        User Details
                    </h1>
                    <Link
                        href={route('users.index')}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Back to Users
                    </Link>
                </div>
            }
        >
            <Head title={`User: ${user.name}`} />

            {/* Flash Message */}
            {flash?.success && (
                <div className="mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">
                    {flash.success}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Profile Card */}
                <div className="lg:col-span-2">
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        {/* Header with gradient */}
                        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                        {/* Profile Content */}
                        <div className="px-6 pb-6">
                            {/* Avatar */}
                            <div className="-mt-12 mb-4">
                                <UserAvatar
                                    name={user.name}
                                    role={user.role}
                                    size="xl"
                                />
                            </div>

                            {/* Name & Role */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {user.name}
                                </h2>
                                <div className="mt-2">
                                    <RoleBadge role={user.role} size="lg" />
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="space-y-4">
                                <div className="flex items-center text-gray-600">
                                    <EnvelopeIcon className="mr-3 h-5 w-5 text-gray-400" />
                                    <span className="text-sm">
                                        {user.email}
                                    </span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
                                    <span className="text-sm">
                                        Joined{' '}
                                        {new Date(
                                            user.created_at,
                                        ).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex space-x-3">
                                <button
                                    onClick={() => setEditModal(true)}
                                    className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                                >
                                    <PencilIcon className="mr-2 h-4 w-4" />
                                    Edit User
                                </button>
                                <button
                                    onClick={() => setDeleteModal(true)}
                                    className="inline-flex items-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50"
                                >
                                    <TrashIcon className="mr-2 h-4 w-4" />
                                    Delete User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                    {/* Statistics Card */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="font-semibold text-gray-900">
                                Statistics
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-100 px-6">
                            <div className="py-4">
                                <p className="text-sm text-gray-600">
                                    Total Bookings
                                </p>
                                <p className="mt-1 text-2xl font-semibold text-gray-900">
                                    {user.bookings_count || 0}
                                </p>
                            </div>
                            <div className="py-4">
                                <p className="text-sm text-gray-600">
                                    Total Orders
                                </p>
                                <p className="mt-1 text-2xl font-semibold text-gray-900">
                                    {user.orders_count || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Account Info Card */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="font-semibold text-gray-900">
                                Account Information
                            </h3>
                        </div>
                        <div className="space-y-4 px-6 py-4">
                            <div>
                                <p className="text-xs text-gray-500">User ID</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    #{user.id}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">
                                    Created At
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {new Date(
                                        user.created_at,
                                    ).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">
                                    Last Updated
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {new Date(
                                        user.updated_at,
                                    ).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <UserFormModal
                show={editModal}
                onClose={() => setEditModal(false)}
                user={user}
                availableRoles={availableRoles}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete User"
                message={`Are you sure you want to delete ${user.name}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </AuthenticatedLayout>
    );
}
