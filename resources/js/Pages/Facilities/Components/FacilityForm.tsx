import FileInput from '@/Components/FileInput';
import IconPicker from '@/Components/IconPicker';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

type Facility = {
    id?: number;
    name: string;
    description: string | null;
    icon: string | null;
    image_path: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
};

type Props = {
    show: boolean;
    onClose: () => void;
    facility?: Facility | null;
};

export default function FacilityForm({ show, onClose, facility }: Props) {
    const isEdit = !!facility;

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            description: '',
            icon: null as string | null,
            image: null as File | null,
            status: 'active' as 'active' | 'inactive',
            sort_order: '',
            _method: 'POST',
        });

    useEffect(() => {
        if (show) {
            if (facility) {
                setData({
                    name: facility.name,
                    description: facility.description || '',
                    icon: facility.icon,
                    image: null,
                    status: facility.status,
                    sort_order: facility.sort_order.toString(),
                    _method: 'PUT',
                });
            } else {
                reset();
                setData((prev) => ({ ...prev, _method: 'POST' }));
            }
            clearErrors();
        }
    }, [show, facility, setData, reset, clearErrors]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && facility?.id) {
            post(route('facilities.update', facility.id), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post(route('facilities.store'), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    {isEdit ? 'Edit Facility' : 'Add New Facility'}
                </h2>

                <form onSubmit={submit} className="mt-6">
                    <div className="max-h-[calc(100vh-16rem)] space-y-6 overflow-y-auto pr-2">
                        {/* Top Row: Image + Status */}
                        <div className="flex gap-6">
                            <div className="w-1/3 flex-shrink-0">
                                <FileInput
                                    label="Facility Image (Optional)"
                                    onChange={(file) => setData('image', file)}
                                    error={errors.image}
                                    previewUrl={facility?.image_path}
                                    className="w-full"
                                />
                            </div>

                            <div className="flex-1 space-y-4">
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
                                                    | 'inactive',
                                            )
                                        }
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </select>
                                    <InputError
                                        message={errors.status}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="sort_order"
                                        value="Sort Order (Optional)"
                                    />
                                    <TextInput
                                        id="sort_order"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.sort_order}
                                        onChange={(e) =>
                                            setData(
                                                'sort_order',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0"
                                    />
                                    <InputError
                                        message={errors.sort_order}
                                        className="mt-2"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Lower numbers appear first. Leave empty
                                        for auto-assignment.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <InputLabel
                                    htmlFor="name"
                                    value="Facility Name"
                                />
                                <TextInput
                                    id="name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="description"
                                    value="Description"
                                />
                                <textarea
                                    id="description"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Describe this facility..."
                                />
                                <InputError
                                    message={errors.description}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <IconPicker
                                    value={data.icon}
                                    onChange={(icon) => setData('icon', icon)}
                                    error={errors.icon}
                                    label="Icon (Optional)"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Select an icon to represent this facility
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
                        <SecondaryButton onClick={onClose} className="mr-3">
                            Cancel
                        </SecondaryButton>

                        <PrimaryButton disabled={processing}>
                            {isEdit ? 'Update Facility' : 'Create Facility'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
