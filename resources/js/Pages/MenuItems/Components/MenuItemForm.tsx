import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

type Menu = {
    id: number;
    name: string;
};

type MenuItem = {
    id?: number;
    menu_id: number;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_available: boolean;
};

type Props = {
    show: boolean;
    onClose: () => void;
    menuItem?: MenuItem | null;
    menus: Menu[];
};

export default function MenuItemForm({
    show,
    onClose,
    menuItem,
    menus,
}: Props) {
    const isEdit = !!menuItem;

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            menu_id: '',
            name: '',
            description: '',
            price: '',
            image_url: '',
            is_available: true,
        });

    useEffect(() => {
        if (show) {
            if (menuItem) {
                setData({
                    menu_id: menuItem.menu_id.toString(),
                    name: menuItem.name,
                    description: menuItem.description || '',
                    price: menuItem.price.toString(),
                    image_url: menuItem.image_url || '',
                    is_available: menuItem.is_available,
                });
            } else {
                reset();
                if (menus.length > 0) {
                    setData('menu_id', menus[0].id.toString());
                }
            }
            clearErrors();
        }
    }, [show, menuItem, menus, setData, reset, clearErrors]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && menuItem?.id) {
            put(route('menu-items.update', menuItem.id), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post(route('menu-items.store'), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    {isEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>

                <form onSubmit={submit} className="mt-6">
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="menu_id" value="Menu" />
                            <select
                                id="menu_id"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.menu_id}
                                onChange={(e) =>
                                    setData('menu_id', e.target.value)
                                }
                                required
                            >
                                <option value="" disabled>
                                    Select Menu
                                </option>
                                {menus.map((menu) => (
                                    <option key={menu.id} value={menu.id}>
                                        {menu.name}
                                    </option>
                                ))}
                            </select>
                            <InputError
                                message={errors.menu_id}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="name" value="Item Name" />
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
                            <InputLabel htmlFor="price" value="Price" />
                            <TextInput
                                id="price"
                                type="number"
                                className="mt-1 block w-full"
                                value={data.price}
                                onChange={(e) =>
                                    setData('price', e.target.value)
                                }
                                required
                            />
                            <InputError
                                message={errors.price}
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
                                    checked={data.is_available}
                                    onChange={(e) =>
                                        setData(
                                            'is_available',
                                            e.target.checked,
                                        )
                                    }
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    Available
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
