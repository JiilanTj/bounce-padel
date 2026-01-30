import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

type Category = {
    id?: number;
    name: string;
    type: 'product' | 'menu';
};

type Props = {
    show: boolean;
    onClose: () => void;
    category?: Category | null;
};

export default function CategoryForm({ show, onClose, category }: Props) {
    const isEdit = !!category;

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            type: 'product' as 'product' | 'menu',
        });

    useEffect(() => {
        if (show) {
            if (category) {
                setData({
                    name: category.name,
                    type: category.type,
                });
            } else {
                reset();
                setData('type', 'product');
            }
            clearErrors();
        }
    }, [show, category, setData, reset, clearErrors]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && category?.id) {
            put(route('categories.update', category.id), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post(route('categories.store'), {
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
                    {isEdit ? 'Edit Category' : 'Add New Category'}
                </h2>

                <form onSubmit={submit} className="mt-6">
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Category Name" />
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
                            <InputLabel htmlFor="type" value="Type" />
                            <select
                                id="type"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.type}
                                onChange={(e) =>
                                    setData(
                                        'type',
                                        e.target.value as 'product' | 'menu',
                                    )
                                }
                            >
                                <option value="product">Product</option>
                                <option value="menu">Menu (F&B)</option>
                            </select>
                            <InputError
                                message={errors.type}
                                className="mt-2"
                            />
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
