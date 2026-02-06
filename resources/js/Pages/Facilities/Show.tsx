import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Head, Link, usePage } from '@inertiajs/react';
import { Home } from 'lucide-react';

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

interface FacilitiesShowProps extends PageProps {
    facility: Facility;
}

export default function Show() {
    const { facility } = usePage<FacilitiesShowProps>().props;

    return (
        <AuthenticatedLayout>
            <Head title={`Facility - ${facility.name}`} />

            <div className="mx-auto max-w-7xl space-y-8 p-6 pt-0">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href={route('facilities.index')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Back to Facilities
                    </Link>
                </div>

                {/* Facility Details */}
                <div className="rounded-lg bg-white p-8 shadow-sm ring-1 ring-gray-200">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Image/Icon Section */}
                        <div className="space-y-4">
                            {facility.image_path ? (
                                <img
                                    src={facility.image_path}
                                    alt={facility.name}
                                    className="h-64 w-full rounded-lg object-cover"
                                />
                            ) : facility.icon ? (
                                <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
                                    <span className="material-symbols-outlined text-9xl text-gray-400">
                                        {facility.icon}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
                                    <Home className="h-32 w-32 text-gray-400" />
                                </div>
                            )}

                            <div className="text-sm text-gray-600">
                                <p>
                                    <span className="font-medium">Status:</span>{' '}
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                            facility.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {facility.status === 'active'
                                            ? 'Active'
                                            : 'Inactive'}
                                    </span>
                                </p>
                                <p className="mt-2">
                                    <span className="font-medium">
                                        Sort Order:
                                    </span>{' '}
                                    {facility.sort_order}
                                </p>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {facility.name}
                                </h1>
                                {facility.icon && (
                                    <div className="mt-2 flex items-center gap-2 text-gray-600">
                                        <span>Icon:</span>
                                        <span className="material-symbols-outlined text-lg">
                                            {facility.icon}
                                        </span>
                                        <span className="text-sm">
                                            ({facility.icon})
                                        </span>
                                    </div>
                                )}
                            </div>

                            {facility.description && (
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Description
                                    </h2>
                                    <p className="mt-2 text-gray-600">
                                        {facility.description}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2 text-sm text-gray-500">
                                <p>
                                    <span className="font-medium">
                                        Created:
                                    </span>{' '}
                                    {new Date(
                                        facility.created_at,
                                    ).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                                <p>
                                    <span className="font-medium">
                                        Last Updated:
                                    </span>{' '}
                                    {new Date(
                                        facility.updated_at,
                                    ).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
