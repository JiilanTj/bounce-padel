import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

type Menu = {
    id?: number;
    name: string;
    description: string | null;
    is_active: boolean;
};

type Props = {
    show: boolean;
    onClose: () => void;
    menu?: Menu | null;
};

export default function MenuForm({ show, onClose, menu }: Props) {
    const isEdit = !!menu;

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            description: '',
            is_active: true,
        });

    useEffect(() => {
        if (show) {
            if (menu) {
                setData({
                    name: menu.name,
                    description: menu.description || '',
                    is_active: menu.is_active,
                });
            } else {
                reset();
            }
            clearErrors();
        }
    }, [show, menu, setData, reset, clearErrors]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && menu?.id) {
            put(route('menus.update', menu.id), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post(route('menus.store'), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    {isEdit ? 'Edit Menu' : 'Add New Menu'}
                </h2>

                <form onSubmit={submit} className="mt-6">
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Menu Name" />
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

                        <div>
                            <InputLabel
                                htmlFor="description"
                                value="Description"
                            />
                            <TextInput
                                id="description"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                            />
                            <InputError
                                message={errors.description}
                                className="mt-2"
                            />
                        </div>

                        <div className="block">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData('is_active', e.target.checked)
                                    }
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    Active
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={onClose} className="mr-3">
                            Cancel
                        </SecondaryButton>

                        <PrimaryButton disabled={processing}>
                            {isEdit ? 'Update' : 'Create'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
