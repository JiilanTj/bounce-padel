import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    PencilSquareIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import CourtForm from './Components/CourtForm';

// Define Court type locally or import from types if available
// Reusing OperatingHour from CourtForm if possible, but defining strict for now
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
};

type Props = PageProps & {
    courts: {
        data: Court[];
        links: Array<{ url: string | null; label: string; active: boolean }>; // Pagination links
    };
};

export default function Index({ auth, courts }: Props) {
    const { delete: destroy } = useForm();
    const [showModal, setShowModal] = useState(false);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

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

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this court?')) {
            destroy(route('courts.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        Active
                    </span>
                );
            case 'maintenance':
                return (
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                        Maintenance
                    </span>
                );
            case 'closed':
                return (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                        Closed
                    </span>
                );
            default:
                return (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                        {status}
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout
            // @ts-expect-error - User type mismatch in Auth
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Court Management
                </h2>
            }
        >
            <Head title="Courts" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                                Court List
                            </h3>
                            <p className="text-sm text-gray-500">
                                Manage your padel courts and operating status.
                            </p>
                        </div>
                        {['admin', 'owner'].includes(auth.user.role) && (
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-blue-900"
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Court
                            </button>
                        )}
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                        >
                                            Name
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                        >
                                            Type
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                        >
                                            Price/Hr
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                        >
                                            Status
                                        </th>
                                        <th
                                            scope="col"
                                            className="relative px-6 py-3"
                                        >
                                            <span className="sr-only">
                                                Actions
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {courts.data.map((court) => (
                                        <tr
                                            key={court.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {court.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {court.surface}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${court.type === 'indoor' ? 'bg-indigo-100 text-indigo-800' : 'bg-orange-100 text-orange-800'}`}
                                                >
                                                    {court.type === 'indoor'
                                                        ? 'Indoor'
                                                        : 'Outdoor'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                Rp{' '}
                                                {new Intl.NumberFormat(
                                                    'id-ID',
                                                ).format(court.price_per_hour)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {getStatusBadge(court.status)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                {['admin', 'owner'].includes(
                                                    auth.user.role,
                                                ) && (
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() =>
                                                                openEditModal(
                                                                    court,
                                                                )
                                                            }
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            <PencilSquareIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    court.id,
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {courts.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-10 text-center text-sm text-gray-500"
                                            >
                                                No courts found. Click "Add
                                                Court" to create one.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <CourtForm
                show={showModal}
                onClose={closeModal}
                court={selectedCourt}
            />
        </AuthenticatedLayout>
    );
}
