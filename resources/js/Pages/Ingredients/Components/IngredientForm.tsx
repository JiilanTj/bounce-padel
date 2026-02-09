import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

type Category = {
    id: number;
    name: string;
};

type Ingredient = {
    id?: number;
    name: string;
    sku?: string | null;
    description?: string | null;
    unit: string;
    unit_type: string;
    current_stock: number | string;
    min_stock: number | string;
    max_stock: number | string;
    unit_price: number | string;
    supplier_name?: string | null;
    supplier_contact?: string | null;
    expiry_days?: number | null;
    storage_location: string;
    is_active: boolean;
    category_id?: number | null;
    category?: Category | null;
};

type Props = {
    show: boolean;
    onClose: () => void;
    ingredient?: Ingredient | null;
    categories?: Category[];
};

const UNITS = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'gram', label: 'Gram (g)' },
    { value: 'liter', label: 'Liter (L)' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'butir', label: 'Butir' },
    { value: 'lusin', label: 'Lusin (12)' },
    { value: 'ikat', label: 'Ikat' },
    { value: 'pack', label: 'Pack' },
    { value: 'botol', label: 'Botol' },
];

const UNIT_TYPES = [
    { value: 'weight', label: 'Weight (Berat)' },
    { value: 'volume', label: 'Volume (Cair)' },
    { value: 'quantity', label: 'Quantity (Jumlah)' },
];

const STORAGE_LOCATIONS = [
    { value: 'dry', label: 'Dry Storage (Kering)' },
    { value: 'chiller', label: 'Chiller (Dingin)' },
    { value: 'freezer', label: 'Freezer (Beku)' },
    { value: 'shelf', label: 'Shelf (Rak)' },
];

export default function IngredientForm({
    show,
    onClose,
    ingredient,
    categories = [],
}: Props) {
    const isEdit = !!ingredient;

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            category_id: '',
            sku: '',
            description: '',
            unit: 'pcs',
            unit_type: 'quantity',
            current_stock: '0',
            min_stock: '0',
            max_stock: '0',
            unit_price: '0',
            supplier_name: '',
            supplier_contact: '',
            expiry_days: '',
            storage_location: 'dry',
            is_active: '1',
            _method: 'POST',
        });

    useEffect(() => {
        if (show) {
            if (ingredient) {
                setData({
                    name: ingredient.name,
                    category_id: ingredient.category_id?.toString() || '',
                    sku: ingredient.sku || '',
                    description: ingredient.description || '',
                    unit: ingredient.unit,
                    unit_type: ingredient.unit_type,
                    current_stock: ingredient.current_stock.toString(),
                    min_stock: ingredient.min_stock.toString(),
                    max_stock: ingredient.max_stock.toString(),
                    unit_price: ingredient.unit_price.toString(),
                    supplier_name: ingredient.supplier_name || '',
                    supplier_contact: ingredient.supplier_contact || '',
                    expiry_days: ingredient.expiry_days?.toString() || '',
                    storage_location: ingredient.storage_location,
                    is_active: ingredient.is_active ? '1' : '0',
                    _method: 'PUT',
                });
            } else {
                reset();
                setData((prev) => ({
                    ...prev,
                    _method: 'POST',
                    is_active: '1',
                }));
            }
            clearErrors();
        }
    }, [show, ingredient, setData, reset, clearErrors]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && ingredient?.id) {
            post(route('ingredients.update', ingredient.id), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post(route('ingredients.store'), {
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
                    {isEdit ? 'Edit Ingredient' : 'Add New Ingredient'}
                </h2>

                <form onSubmit={submit} className="mt-6">
                    <div className="max-h-[calc(100vh-16rem)] space-y-6 overflow-y-auto pr-2">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <InputLabel
                                    htmlFor="name"
                                    value="Ingredient Name"
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
                                <InputLabel htmlFor="sku" value="SKU / Code" />
                                <TextInput
                                    id="sku"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.sku}
                                    onChange={(e) =>
                                        setData('sku', e.target.value)
                                    }
                                    placeholder="Optional"
                                />
                                <InputError
                                    message={errors.sku}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="category_id"
                                    value="Category"
                                />
                                <select
                                    id="category_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={data.category_id}
                                    onChange={(e) =>
                                        setData('category_id', e.target.value)
                                    }
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
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
                                    htmlFor="unit_type"
                                    value="Unit Type"
                                />
                                <select
                                    id="unit_type"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={data.unit_type}
                                    onChange={(e) =>
                                        setData('unit_type', e.target.value)
                                    }
                                    required
                                >
                                    {UNIT_TYPES.map((type) => (
                                        <option
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.unit_type}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="unit" value="Unit" />
                                <select
                                    id="unit"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={data.unit}
                                    onChange={(e) =>
                                        setData('unit', e.target.value)
                                    }
                                    required
                                >
                                    {UNITS.map((unit) => (
                                        <option
                                            key={unit.value}
                                            value={unit.value}
                                        >
                                            {unit.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.unit}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="storage_location"
                                    value="Storage Location"
                                />
                                <select
                                    id="storage_location"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={data.storage_location}
                                    onChange={(e) =>
                                        setData(
                                            'storage_location',
                                            e.target.value,
                                        )
                                    }
                                    required
                                >
                                    {STORAGE_LOCATIONS.map((loc) => (
                                        <option
                                            key={loc.value}
                                            value={loc.value}
                                        >
                                            {loc.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.storage_location}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="min_stock"
                                    value="Min Stock"
                                />
                                <TextInput
                                    id="min_stock"
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    className="mt-1 block w-full"
                                    value={data.min_stock}
                                    onChange={(e) =>
                                        setData('min_stock', e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.min_stock}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="max_stock"
                                    value="Max Stock"
                                />
                                <TextInput
                                    id="max_stock"
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    className="mt-1 block w-full"
                                    value={data.max_stock}
                                    onChange={(e) =>
                                        setData('max_stock', e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.max_stock}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="unit_price"
                                    value="Unit Price"
                                />
                                <TextInput
                                    id="unit_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="mt-1 block w-full"
                                    value={data.unit_price}
                                    onChange={(e) =>
                                        setData('unit_price', e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.unit_price}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="current_stock"
                                    value="Initial Stock"
                                />
                                <TextInput
                                    id="current_stock"
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    className="mt-1 block w-full"
                                    value={data.current_stock}
                                    onChange={(e) =>
                                        setData('current_stock', e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.current_stock}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="expiry_days"
                                    value="Expiry Days"
                                />
                                <TextInput
                                    id="expiry_days"
                                    type="number"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={data.expiry_days}
                                    onChange={(e) =>
                                        setData('expiry_days', e.target.value)
                                    }
                                    placeholder="Optional"
                                />
                                <InputError
                                    message={errors.expiry_days}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="is_active"
                                    value="Status"
                                />
                                <select
                                    id="is_active"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={data.is_active}
                                    onChange={(e) =>
                                        setData('is_active', e.target.value)
                                    }
                                    required
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                                <InputError
                                    message={errors.is_active}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="supplier_name"
                                    value="Supplier Name"
                                />
                                <TextInput
                                    id="supplier_name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.supplier_name}
                                    onChange={(e) =>
                                        setData('supplier_name', e.target.value)
                                    }
                                    placeholder="Optional"
                                />
                                <InputError
                                    message={errors.supplier_name}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="supplier_contact"
                                    value="Supplier Contact"
                                />
                                <TextInput
                                    id="supplier_contact"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.supplier_contact}
                                    onChange={(e) =>
                                        setData(
                                            'supplier_contact',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Phone or email"
                                />
                                <InputError
                                    message={errors.supplier_contact}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <InputLabel
                                htmlFor="description"
                                value="Description"
                            />
                            <textarea
                                id="description"
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Ingredient description..."
                            />
                            <InputError
                                message={errors.description}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={onClose}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing
                                ? 'Saving...'
                                : isEdit
                                  ? 'Update Ingredient'
                                  : 'Create Ingredient'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
