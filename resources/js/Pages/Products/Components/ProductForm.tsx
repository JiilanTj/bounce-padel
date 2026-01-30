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
    image_url: string | null;
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

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            category_id: '',
            name: '',
            sku: '',
            description: '',
            price_buy: '',
            price_rent: '',
            stock_buy: '',
            stock_rent: '',
            image_url: '',
        });

    useEffect(() => {
        if (show) {
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
                    image_url: product.image_url || '',
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
            }
            clearErrors();
        }
    }, [show, product, categories, setData, reset, clearErrors]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && product?.id) {
            put(route('products.update', product.id), {
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

    const productCategories = categories.filter((c) => c.type === 'product');

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    {isEdit ? 'Edit Product' : 'Add New Product'}
                </h2>

                <form onSubmit={submit} className="mt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-4">
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
                                        setData('category_id', e.target.value)
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

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel
                                        htmlFor="price_buy"
                                        value="Buy Price"
                                    />
                                    <TextInput
                                        id="price_buy"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.price_buy}
                                        onChange={(e) =>
                                            setData('price_buy', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.price_buy}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        htmlFor="price_rent"
                                        value="Rent Price"
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
                                    />
                                    <InputError
                                        message={errors.price_rent}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel
                                        htmlFor="stock_buy"
                                        value="Buy Stock"
                                    />
                                    <TextInput
                                        id="stock_buy"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.stock_buy}
                                        onChange={(e) =>
                                            setData('stock_buy', e.target.value)
                                        }
                                        // Allow editing stock; backend handles logic
                                    />
                                    <InputError
                                        message={errors.stock_buy}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        htmlFor="stock_rent"
                                        value="Rent Stock"
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
                                    />
                                    <InputError
                                        message={errors.stock_rent}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="description" value="Description" />
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

                    <div className="mt-6 flex justify-end">
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
