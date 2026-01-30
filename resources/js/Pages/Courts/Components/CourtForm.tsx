import FileInput from '@/Components/FileInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

// Types
type OperatingHour = {
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_closed: boolean;
};

type Court = {
    id?: number;
    name: string;
    type: 'indoor' | 'outdoor';
    surface: string;
    status: 'active' | 'maintenance' | 'closed';
    price_per_hour: number;
    operating_hours?: OperatingHour[];
    image_path?: string | null;
    image_url?: string | null;
};

type Props = {
    show: boolean;
    onClose: () => void;
    court?: Court | null; // If null, it's create mode
};

export default function CourtForm({ show, onClose, court }: Props) {
    const isEdit = !!court;
    const [activeTab, setActiveTab] = useState<'basic' | 'hours'>('basic');

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            type: 'indoor',
            surface: '',
            status: 'active',
            price_per_hour: '',
            operating_hours: [] as OperatingHour[],
            image: null as File | null,
            _method: 'POST',
        });

    useEffect(() => {
        if (show) {
            if (court) {
                setData({
                    name: court.name,
                    type: court.type,
                    surface: court.surface,
                    status: court.status,
                    price_per_hour: court.price_per_hour.toString(),
                    operating_hours: court.operating_hours || [],
                    image: null,
                    _method: 'PUT',
                });
            } else {
                reset();
                setData((prev) => ({ ...prev, _method: 'POST' }));
            }
            clearErrors();
            setActiveTab('basic');
        }
    }, [show, court]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && court?.id) {
            post(route('courts.update', court.id), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post(route('courts.store'), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];

    const handleHourChange = (
        index: number,
        field: keyof OperatingHour,
        value: string | boolean,
    ) => {
        const newHours = [...data.operating_hours];
        if (newHours[index]) {
            // @ts-expect-error - value type is dynamic based on field
            newHours[index][field] = value;
            setData('operating_hours', newHours);
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    {isEdit ? 'Edit Court' : 'Add New Court'}
                </h2>

                <div className="mt-4 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('basic')}
                            className={`${activeTab === 'basic' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
                        >
                            Basic Info
                        </button>
                        {isEdit && (
                            <button
                                onClick={() => setActiveTab('hours')}
                                className={`${activeTab === 'hours' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
                            >
                                Operating Hours
                            </button>
                        )}
                    </nav>
                </div>

                <form onSubmit={submit} className="mt-6">
                    {activeTab === 'basic' && (
                        <div className="space-y-4">
                            <FileInput
                                label="Court Image"
                                onChange={(file) => setData('image', file)}
                                error={errors.image}
                                previewUrl={court?.image_path}
                                className="w-full"
                            />

                            <div>
                                <InputLabel htmlFor="name" value="Court Name" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                    autoFocus
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="type" value="Type" />
                                    <select
                                        id="type"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.type}
                                        onChange={(e) =>
                                            setData(
                                                'type',
                                                e.target.value as
                                                    | 'indoor'
                                                    | 'outdoor',
                                            )
                                        }
                                    >
                                        <option value="indoor">Indoor</option>
                                        <option value="outdoor">Outdoor</option>
                                    </select>
                                    <InputError
                                        message={errors.type}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        htmlFor="status"
                                        value="Status"
                                    />
                                    <select
                                        id="status"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.status}
                                        onChange={(e) =>
                                            setData(
                                                'status',
                                                e.target.value as
                                                    | 'active'
                                                    | 'maintenance'
                                                    | 'closed',
                                            )
                                        }
                                    >
                                        <option value="active">Active</option>
                                        <option value="maintenance">
                                            Maintenance
                                        </option>
                                        <option value="closed">Closed</option>
                                    </select>
                                    <InputError
                                        message={errors.status}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel
                                        htmlFor="surface"
                                        value="Surface Material"
                                    />
                                    <TextInput
                                        id="surface"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.surface}
                                        onChange={(e) =>
                                            setData('surface', e.target.value)
                                        }
                                        placeholder="e.g. Artificial Turf"
                                    />
                                    <InputError
                                        message={errors.surface}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        htmlFor="price"
                                        value="Price per Hour (IDR)"
                                    />
                                    <TextInput
                                        id="price"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.price_per_hour}
                                        onChange={(e) =>
                                            setData(
                                                'price_per_hour',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.price_per_hour}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'hours' && isEdit && (
                        <div className="space-y-4">
                            <p className="mb-4 text-sm text-gray-500">
                                Set the opening and closing times for this
                                court. Default is 08:00 - 22:00.
                            </p>
                            <div className="max-h-96 overflow-y-auto rounded-lg bg-gray-50 p-4">
                                {data.operating_hours.length > 0 ? (
                                    data.operating_hours.map((hour, index) => (
                                        <div
                                            key={index}
                                            className="mb-3 flex items-center space-x-4 border-b border-gray-200 pb-3 last:border-0"
                                        >
                                            <div className="w-24 text-sm font-medium text-gray-700">
                                                {days[hour.day_of_week]}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <label className="flex items-center text-xs text-gray-600">
                                                    <input
                                                        type="checkbox"
                                                        className="mr-2 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                        checked={hour.is_closed}
                                                        onChange={(e) =>
                                                            handleHourChange(
                                                                index,
                                                                'is_closed',
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                    />
                                                    Closed
                                                </label>
                                            </div>

                                            {!hour.is_closed && (
                                                <>
                                                    <input
                                                        type="time"
                                                        className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        value={hour.open_time}
                                                        onChange={(e) =>
                                                            handleHourChange(
                                                                index,
                                                                'open_time',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <span className="text-gray-400">
                                                        -
                                                    </span>
                                                    <input
                                                        type="time"
                                                        className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        value={hour.close_time}
                                                        onChange={(e) =>
                                                            handleHourChange(
                                                                index,
                                                                'close_time',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-4 text-center text-gray-500">
                                        No operating hours found. Please save
                                        first or check backend.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={onClose} className="mr-3">
                            Cancel
                        </SecondaryButton>

                        <PrimaryButton disabled={processing}>
                            {isEdit ? 'Update Court' : 'Create Court'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
