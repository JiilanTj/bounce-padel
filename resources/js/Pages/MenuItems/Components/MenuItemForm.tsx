import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type Menu = {
    id: number;
    name: string;
};

type Category = {
    id: number;
    name: string;
};

type MenuItem = {
    id?: number;
    menu_id: number;
    category_id: number | null;
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
    categories: Category[];
};

export default function MenuItemForm({
    show,
    onClose,
    menuItem,
    menus,
    categories,
}: Props) {
    const isEdit = !!menuItem;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<{
            menu_id: string;
            category_id: string;
            name: string;
            description: string;
            price: string;
            image: File | null;
            is_available: boolean;
            _method?: string;
        }>({
            menu_id: '',
            category_id: '',
            name: '',
            description: '',
            price: '',
            image: null,
            is_available: true,
        });

    useEffect(() => {
        if (show) {
            if (menuItem) {
                setData({
                    menu_id: menuItem.menu_id.toString(),
                    category_id: menuItem.category_id?.toString() || '',
                    name: menuItem.name,
                    description: menuItem.description || '',
                    price: menuItem.price.toString(),
                    image: null,
                    is_available: menuItem.is_available,
                    _method: 'PUT',
                });
                setImagePreview(menuItem.image_url);
            } else {
                reset();
                setImagePreview(null);
                if (menus.length > 0) {
                    setData('menu_id', menus[0].id.toString());
                }
            }
            clearErrors();
        }
    }, [show, menuItem, menus, setData, reset, clearErrors]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(isEdit ? menuItem?.image_url || null : null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && menuItem?.id) {
            post(route('menu-items.update', menuItem.id), {
                onSuccess: () => {
                    onClose();
                    reset();
                    setImagePreview(null);
                },
            });
        } else {
            post(route('menu-items.store'), {
                onSuccess: () => {
                    onClose();
                    reset();
                    setImagePreview(null);
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
                    <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
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
                            <InputLabel
                                htmlFor="category_id"
                                value="Category (Optional)"
                            />
                            <select
                                id="category_id"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.category_id}
                                onChange={(e) =>
                                    setData('category_id', e.target.value)
                                }
                            >
                                <option value="">No Category</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <InputError
                                message={errors.category_id}
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
                            <textarea
                                id="description"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                rows={3}
                            />
                            <InputError
                                message={errors.description}
                                className="mt-2"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <InputLabel htmlFor="image" value="Image" />
                            <div className="mt-2">
                                {imagePreview ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-32 w-32 rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="image"
                                        className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                                    >
                                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                                        <span className="mt-2 text-sm text-gray-500">
                                            Click to upload image
                                        </span>
                                        <span className="mt-1 text-xs text-gray-400">
                                            Max 8MB
                                        </span>
                                    </label>
                                )}
                                <input
                                    ref={fileInputRef}
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                            <InputError
                                message={errors.image}
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
