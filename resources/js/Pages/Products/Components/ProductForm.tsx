import FileInput from '@/Components/FileInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

type Product = {
    id?: number;
    category_id: number;
    name: string;
    sku: string | null;
    description: string | null;
    price_buy: number;
    price_rent: number;
    stock_buy: number;
    stock_rent: number;
    image_path?: string | null;
    image_url?: string | null;
    type: 'sale' | 'rent';
};

type Category = {
    id: number;
    name: string;
    type: 'product' | 'menu';
};

type Props = {
    show: boolean;
    onClose: () => void;
    product?: Product | null;
    categories: Category[];
};

export default function ProductForm({
    show,
    onClose,
    product,
    categories,
}: Props) {
    const isEdit = !!product;

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            category_id: '',
            name: '',
            sku: '',
            description: '',
            price_buy: '0',
            price_rent: '0',
            stock_buy: '0',
            stock_rent: '0',
            image: null as File | null,
            type: 'sale' as 'sale' | 'rent',
            _method: 'POST',
        });

    useEffect(() => {
        if (show && categories && categories.length > 0) {
            if (product) {
                setData({
                    category_id: product.category_id.toString(),
                    name: product.name,
                    sku: product.sku || '',
                    description: product.description || '',
                    price_buy: product.price_buy.toString(),
                    price_rent: product.price_rent.toString(),
                    stock_buy: product.stock_buy.toString(),
                    stock_rent: product.stock_rent.toString(),
                    image: null,
                    type: product.type || 'sale',
                    _method: 'PUT',
                });
            } else {
                reset();
                // Set default category if available
                const productCategories = categories.filter(
                    (c) => c.type === 'product',
                );
                if (productCategories.length > 0) {
                    setData('category_id', productCategories[0].id.toString());
                }
                setData((prev) => ({ ...prev, _method: 'POST' }));
            }
            clearErrors();
        }
    }, [show, product, categories, setData, reset, clearErrors]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && product?.id) {
            post(route('products.update', product.id), {
                // Use post with _method PUT
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post(route('products.store'), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    // Auto-reset values when switching types (optional, but cleaner)
    const handleTypeChange = (newType: 'sale' | 'rent') => {
        if (newType === 'sale') {
            setData((prev) => ({
                ...prev,
                type: newType,
                price_rent: '0',
                stock_rent: '0',
            }));
        } else {
            setData((prev) => ({
                ...prev,
                type: newType,
                price_buy: '0',
                stock_buy: '0',
            }));
        }
    };

    const productCategories = (categories || []).filter(
        (c) => c.type === 'product',
    );

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    {isEdit ? 'Edit Product' : 'Add New Product'}
                </h2>

                <form onSubmit={submit} className="mt-6">
                    <div className="max-h-[calc(100vh-16rem)] space-y-6 overflow-y-auto pr-2">
                        {/* Top Row: Image + Product Type */}
                        <div className="flex gap-6">
                            <div className="w-1/3 flex-shrink-0">
                                <FileInput
                                    label="Product Image"
                                    onChange={(file) => setData('image', file)}
                                    error={errors.image}
                                    previewUrl={product?.image_path}
                                    className="w-full"
                                />
                            </div>

                            <div className="flex-1">
                                <InputLabel
                                    htmlFor="type"
                                    value="Product Type"
                                />
                                <div className="mt-2 flex flex-col space-y-3">
                                    <label className="flex cursor-pointer items-center">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="sale"
                                            checked={data.type === 'sale'}
                                            onChange={() =>
                                                handleTypeChange('sale')
                                            }
                                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Sale (For selling)
                                        </span>
                                    </label>
                                    <label className="flex cursor-pointer items-center">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="rent"
                                            checked={data.type === 'rent'}
                                            onChange={() =>
                                                handleTypeChange('rent')
                                            }
                                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Rent (For renting)
                                        </span>
                                    </label>
                                </div>
                                <InputError
                                    message={errors.type}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="space-y-4">
                            <div>
                                <InputLabel
                                    htmlFor="name"
                                    value="Product Name"
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel
                                        htmlFor="category_id"
                                        value="Category"
                                    />
                                    <select
                                        id="category_id"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.category_id}
                                        onChange={(e) =>
                                            setData(
                                                'category_id',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    >
                                        <option value="" disabled>
                                            Select Category
                                        </option>
                                        {productCategories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={errors.category_id}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="sku"
                                        value="SKU (Optional)"
                                    />
                                    <TextInput
                                        id="sku"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.sku}
                                        onChange={(e) =>
                                            setData('sku', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.sku}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            {data.type === 'sale' && (
                                <div className="grid grid-cols-2 gap-4 rounded-lg bg-blue-50 p-4">
                                    <div className="col-span-2 mb-1 text-sm font-medium text-blue-800">
                                        Sale Information
                                    </div>
                                    <div>
                                        <InputLabel
                                            htmlFor="price_buy"
                                            value="Selling Price (IDR)"
                                        />
                                        <TextInput
                                            id="price_buy"
                                            type="number"
                                            className="mt-1 block w-full"
                                            value={data.price_buy}
                                            onChange={(e) =>
                                                setData(
                                                    'price_buy',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            message={errors.price_buy}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel
                                            htmlFor="stock_buy"
                                            value="Stock for Sale"
                                        />
                                        <TextInput
                                            id="stock_buy"
                                            type="number"
                                            className="mt-1 block w-full"
                                            value={data.stock_buy}
                                            onChange={(e) =>
                                                setData(
                                                    'stock_buy',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            message={errors.stock_buy}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                            )}

                            {data.type === 'rent' && (
                                <div className="grid grid-cols-2 gap-4 rounded-lg bg-orange-50 p-4">
                                    <div className="col-span-2 mb-1 text-sm font-medium text-orange-800">
                                        Rental Information
                                    </div>
                                    <div>
                                        <InputLabel
                                            htmlFor="price_rent"
                                            value="Rental Price (IDR)"
                                        />
                                        <TextInput
                                            id="price_rent"
                                            type="number"
                                            className="mt-1 block w-full"
                                            value={data.price_rent}
                                            onChange={(e) =>
                                                setData(
                                                    'price_rent',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            message={errors.price_rent}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel
                                            htmlFor="stock_rent"
                                            value="Stock for Rent"
                                        />
                                        <TextInput
                                            id="stock_rent"
                                            type="number"
                                            className="mt-1 block w-full"
                                            value={data.stock_rent}
                                            onChange={(e) =>
                                                setData(
                                                    'stock_rent',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            message={errors.stock_rent}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                            )}

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
                                />
                                <InputError
                                    message={errors.description}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
                        <SecondaryButton onClick={onClose} className="mr-3">
                            Cancel
                        </SecondaryButton>

                        <PrimaryButton disabled={processing}>
                            {isEdit ? 'Update Product' : 'Create Product'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
