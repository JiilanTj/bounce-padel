import FileInput from '@/Components/FileInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

type Inventory = {
    id?: number;
    name: string;
    image_path?: string | null;
    price: number;
    quantity: number;
    owner_name: string;
    status: 'functional' | 'damaged' | 'lost' | 'maintenance' | 'retired';
    sku?: string | null;
    description?: string | null;
    location?: string | null;
    category?: string | null;
    purchase_date?: string | null;
    notes?: string | null;
};

type Props = {
    show: boolean;
    onClose: () => void;
    inventory?: Inventory | null;
};

export default function InventoryForm({ show, onClose, inventory }: Props) {
    const isEdit = !!inventory;

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            image: null as File | null,
            price: '0',
            quantity: '0',
            owner_name: '',
            status: 'functional' as
                | 'functional'
                | 'damaged'
                | 'lost'
                | 'maintenance'
                | 'retired',
            sku: '',
            description: '',
            location: '',
            category: '',
            purchase_date: '',
            notes: '',
            _method: 'POST',
        });

    useEffect(() => {
        if (show) {
            if (inventory) {
                setData({
                    name: inventory.name,
                    image: null,
                    price: inventory.price.toString(),
                    quantity: inventory.quantity.toString(),
                    owner_name: inventory.owner_name,
                    status: inventory.status,
                    sku: inventory.sku || '',
                    description: inventory.description || '',
                    location: inventory.location || '',
                    category: inventory.category || '',
                    purchase_date: inventory.purchase_date || '',
                    notes: inventory.notes || '',
                    _method: 'PUT',
                });
            } else {
                reset();
                setData((prev) => ({ ...prev, _method: 'POST' }));
            }
            clearErrors();
        }
    }, [show, inventory, setData, reset, clearErrors]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && inventory?.id) {
            post(route('inventories.update', inventory.id), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post(route('inventories.store'), {
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
                    {isEdit ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                </h2>

                <form onSubmit={submit} className="mt-6">
                    <div className="max-h-[calc(100vh-16rem)] space-y-6 overflow-y-auto pr-2">
                        {/* Image Upload */}
                        <div>
                            <FileInput
                                label="Item Image"
                                onChange={(file) => setData('image', file)}
                                error={errors.image}
                                previewUrl={inventory?.image_path}
                                className="w-full"
                            />
                        </div>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                                    htmlFor="owner_name"
                                    value="Owner Name"
                                />
                                <TextInput
                                    id="owner_name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.owner_name}
                                    onChange={(e) =>
                                        setData('owner_name', e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.owner_name}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="category"
                                    value="Category"
                                />
                                <TextInput
                                    id="category"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.category}
                                    onChange={(e) =>
                                        setData('category', e.target.value)
                                    }
                                    placeholder="e.g., Raket, Bola, Net"
                                />
                                <InputError
                                    message={errors.category}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="price" value="Price" />
                                <TextInput
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
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
                                    htmlFor="quantity"
                                    value="Quantity"
                                />
                                <TextInput
                                    id="quantity"
                                    type="number"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={data.quantity}
                                    onChange={(e) =>
                                        setData('quantity', e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.quantity}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="status" value="Status" />
                                <select
                                    id="status"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.status}
                                    onChange={(e) =>
                                        setData(
                                            'status',
                                            e.target.value as
                                                | 'functional'
                                                | 'damaged'
                                                | 'lost'
                                                | 'maintenance'
                                                | 'retired',
                                        )
                                    }
                                    required
                                >
                                    <option value="functional">
                                        Functional
                                    </option>
                                    <option value="damaged">Damaged</option>
                                    <option value="lost">Lost</option>
                                    <option value="maintenance">
                                        Maintenance
                                    </option>
                                    <option value="retired">Retired</option>
                                </select>
                                <InputError
                                    message={errors.status}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="location"
                                    value="Location"
                                />
                                <TextInput
                                    id="location"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.location}
                                    onChange={(e) =>
                                        setData('location', e.target.value)
                                    }
                                    placeholder="Storage location"
                                />
                                <InputError
                                    message={errors.location}
                                    className="mt-2"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel
                                    htmlFor="purchase_date"
                                    value="Purchase Date"
                                />
                                <TextInput
                                    id="purchase_date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.purchase_date}
                                    onChange={(e) =>
                                        setData('purchase_date', e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.purchase_date}
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
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Item description..."
                            />
                            <InputError
                                message={errors.description}
                                className="mt-2"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <InputLabel htmlFor="notes" value="Notes" />
                            <textarea
                                id="notes"
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                                placeholder="Additional notes..."
                            />
                            <InputError
                                message={errors.notes}
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
                                  ? 'Update Item'
                                  : 'Create Item'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
