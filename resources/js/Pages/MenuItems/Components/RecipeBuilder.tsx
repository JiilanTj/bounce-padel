import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { formatCurrency } from '@/utils/currency';
import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    BeakerIcon,
    Calculator,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

type Category = {
    id: number;
    name: string;
};

type Ingredient = {
    id: number;
    name: string;
    sku?: string | null;
    unit: string;
    unit_type: string;
    current_stock: number | string;
    min_stock: number | string;
    max_stock: number | string;
    unit_price: number | string;
    storage_location: string;
    category?: Category | null;
    is_low_stock: boolean;
};

type RecipeItem = {
    id: number;
    ingredient_id: number;
    quantity: number;
    unit?: string | null;
    ingredient: Ingredient;
    cost: number;
};

type MenuItem = {
    id: number;
    name: string;
    price: number;
    description?: string | null;
};

type RecipeData = {
    menu_item: MenuItem;
    ingredients: RecipeItem[];
    total_cost: number;
    profit: number;
    profit_margin: number;
};

type Props = {
    show: boolean;
    onClose: () => void;
    menuItem: MenuItem | null;
    initialRecipe?: RecipeData | null;
};

export default function RecipeBuilder({
    show,
    onClose,
    menuItem,
    initialRecipe,
}: Props) {
    const [recipeItems, setRecipeItems] = useState<RecipeItem[]>(
        initialRecipe?.ingredients || [],
    );
    const [availableIngredients, setAvailableIngredients] = useState<
        Ingredient[]
    >([]);
    const [showIngredientSelector, setShowIngredientSelector] = useState(false);
    const [searchIngredient, setSearchIngredient] = useState('');
    const [selectedIngredient, setSelectedIngredient] =
        useState<Ingredient | null>(null);
    const [newQuantity, setNewQuantity] = useState('1');
    const [newUnit, setNewUnit] = useState('');
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [saving, setSaving] = useState(false);
    const [availabilityResult, setAvailabilityResult] = useState<{
        can_make: boolean;
        quantity?: number;
        issues?: Array<{
            ingredient: string;
            required: number;
            available: number;
            shortage: number;
            unit?: string;
        }>;
    } | null>(null);

    // Fetch available ingredients when modal opens
    useEffect(() => {
        if (show) {
            fetchIngredients();
            if (initialRecipe) {
                setRecipeItems(initialRecipe.ingredients);
            }
        }
    }, [show, initialRecipe]);

    const fetchIngredients = () => {
        axios
            .get(route('recipe.available-ingredients'))
            .then((response) => {
                setAvailableIngredients(response.data);
            })
            .catch(() => {
                toast.error('Failed to load ingredients');
            });
    };

    const calculateTotalCost = () => {
        return recipeItems.reduce(
            (total, item) =>
                total + Number(item.ingredient.unit_price) * item.quantity,
            0,
        );
    };

    const totalCost = calculateTotalCost();
    const profit = menuItem ? menuItem.price - totalCost : 0;
    const profitMargin = menuItem ? (profit / menuItem.price) * 100 : 0;

    const addIngredient = () => {
        if (!selectedIngredient) return;

        const quantity = parseFloat(newQuantity);
        if (isNaN(quantity) || quantity <= 0) {
            toast.error('Please enter a valid quantity');
            return;
        }

        // Check if ingredient already exists
        const existingIndex = recipeItems.findIndex(
            (item) => item.ingredient_id === selectedIngredient.id,
        );

        if (existingIndex >= 0) {
            // Update existing
            setRecipeItems((prev) => {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + quantity,
                };
                return updated;
            });
        } else {
            // Add new
            setRecipeItems((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    ingredient_id: selectedIngredient.id,
                    quantity,
                    unit: newUnit || null,
                    ingredient: selectedIngredient,
                    cost: Number(selectedIngredient.unit_price) * quantity,
                },
            ]);
        }

        // Reset form
        setSelectedIngredient(null);
        setNewQuantity('1');
        setNewUnit('');
        setShowIngredientSelector(false);
    };

    const removeIngredient = (id: number) => {
        setRecipeItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: number, newQty: number) => {
        setRecipeItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, quantity: newQty } : item,
            ),
        );
    };

    const checkStockAvailability = () => {
        if (!menuItem) return;

        setCheckingAvailability(true);
        axios
            .get(route('menu-items.recipe.check-stock', menuItem.id), {
                params: { quantity: 1 },
            })
            .then((response) => {
                setAvailabilityResult(response.data);
            })
            .finally(() => {
                setCheckingAvailability(false);
            });
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (!menuItem) return;

        // Prepare the data for API call
        const submitData = {
            ingredients: recipeItems.map((item) => ({
                ingredient_id: item.ingredient_id,
                quantity: item.quantity.toString(),
                unit: item.unit || undefined,
            })),
        };

        setSaving(true);
        axios
            .post(route('menu-items.recipe.store', menuItem.id), submitData)
            .then(() => {
                toast.success('Recipe updated successfully');
                onClose();
            })
            .catch(() => {
                toast.error('Failed to update recipe');
            })
            .finally(() => {
                setSaving(false);
            });
    };

    const filteredIngredients = availableIngredients.filter((ing) => {
        const search = searchIngredient.toLowerCase();
        return (
            ing.name.toLowerCase().includes(search) ||
            ing.sku?.toLowerCase().includes(search) ||
            ing.category?.name.toLowerCase().includes(search)
        );
    });

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="flex max-h-[90vh] flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Recipe Builder
                        </h2>
                        <p className="text-sm text-gray-500">
                            {menuItem?.name} -{' '}
                            {formatCurrency(menuItem?.price || 0)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Cost Summary */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center gap-2">
                                    <Calculator className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs font-medium text-gray-500">
                                        Total Cost
                                    </span>
                                </div>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {formatCurrency(totalCost)}
                                </p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="text-xs font-medium text-gray-500">
                                        Profit
                                    </span>
                                </div>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {formatCurrency(profit)}
                                </p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center gap-2">
                                    <ChevronUp className="h-4 w-4 text-purple-600" />
                                    <span className="text-xs font-medium text-gray-500">
                                        Margin
                                    </span>
                                </div>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {profitMargin.toFixed(1)}%
                                </p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center gap-2">
                                    <BeakerIcon className="h-4 w-4 text-orange-600" />
                                    <span className="text-xs font-medium text-gray-500">
                                        Ingredients
                                    </span>
                                </div>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {recipeItems.length}
                                </p>
                            </div>
                        </div>

                        {/* Add Ingredient Button */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900">
                                Recipe Items
                            </h3>
                            <button
                                type="button"
                                onClick={() =>
                                    setShowIngredientSelector(
                                        !showIngredientSelector,
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                                Add Ingredient
                            </button>
                        </div>

                        {/* Ingredient Selector */}
                        {showIngredientSelector && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="ingredient_search"
                                        value="Search Ingredient"
                                    />
                                    <TextInput
                                        id="ingredient_search"
                                        type="text"
                                        className="mt-1"
                                        placeholder="Search by name, SKU, or category..."
                                        value={searchIngredient}
                                        onChange={(e) =>
                                            setSearchIngredient(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="new_quantity"
                                        value="Quantity"
                                    />
                                    <TextInput
                                        id="new_quantity"
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        className="mt-1"
                                        value={newQuantity}
                                        onChange={(e) =>
                                            setNewQuantity(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="new_unit"
                                        value="Unit (Optional override)"
                                    />
                                    <TextInput
                                        id="new_unit"
                                        type="text"
                                        className="mt-1"
                                        placeholder="Leave empty to use default"
                                        value={newUnit}
                                        onChange={(e) =>
                                            setNewUnit(e.target.value)
                                        }
                                    />
                                </div>

                                {searchIngredient &&
                                    filteredIngredients.length > 0 && (
                                        <div className="mt-3 max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white">
                                            {filteredIngredients
                                                .slice(0, 10)
                                                .map((ing) => (
                                                    <button
                                                        key={ing.id}
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedIngredient(
                                                                ing,
                                                            )
                                                        }
                                                        className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50 ${
                                                            selectedIngredient?.id ===
                                                            ing.id
                                                                ? 'bg-blue-50'
                                                                : ''
                                                        }`}
                                                    >
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {ing.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {ing.unit} •{' '}
                                                                {formatCurrency(
                                                                    Number(ing.unit_price),
                                                                )}{' '}
                                                                / {ing.unit}
                                                            </p>
                                                        </div>
                                                        {ing.is_low_stock && (
                                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                                        )}
                                                    </button>
                                                ))}
                                        </div>
                                    )}

                                <div className="mt-3 flex justify-end gap-2">
                                    <SecondaryButton
                                        type="button"
                                        onClick={() =>
                                            setShowIngredientSelector(false)
                                        }
                                    >
                                        Cancel
                                    </SecondaryButton>
                                    <PrimaryButton
                                        type="button"
                                        onClick={addIngredient}
                                        disabled={!selectedIngredient}
                                    >
                                        Add
                                    </PrimaryButton>
                                </div>
                            </div>
                        )}

                        {/* Recipe Items Table */}
                        {recipeItems.length > 0 ? (
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                                Ingredient
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                                Quantity
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                                Unit Price
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                                Cost
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {recipeItems.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {
                                                                item.ingredient
                                                                    .name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Stock:{' '}
                                                            {Number(
                                                                item.ingredient
                                                                    .current_stock,
                                                            ).toFixed(3)}{' '}
                                                            {
                                                                item.ingredient
                                                                    .unit
                                                            }
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.id,
                                                                    Math.max(
                                                                        0.001,
                                                                        item.quantity -
                                                                            0.1,
                                                                    ),
                                                                )
                                                            }
                                                            className="rounded p-1 hover:bg-gray-100"
                                                        >
                                                            <ChevronDown className="h-4 w-4" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            step="0.001"
                                                            min="0.001"
                                                            value={
                                                                item.quantity
                                                            }
                                                            onChange={(e) =>
                                                                updateQuantity(
                                                                    item.id,
                                                                    parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                                )
                                                            }
                                                            className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.id,
                                                                    item.quantity +
                                                                        0.1,
                                                                )
                                                            }
                                                            className="rounded p-1 hover:bg-gray-100"
                                                        >
                                                            <ChevronUp className="h-4 w-4" />
                                                        </button>
                                                        <span className="text-xs text-gray-500">
                                                            {item.unit ||
                                                                item.ingredient
                                                                    .unit}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {formatCurrency(
                                                        Number(
                                                            item.ingredient
                                                                .unit_price,
                                                        ),
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {formatCurrency(
                                                        Number(
                                                            item.ingredient
                                                                .unit_price,
                                                        ) * item.quantity,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeIngredient(
                                                                item.id,
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                                <BeakerIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">
                                    No ingredients added yet
                                </p>
                            </div>
                        )}

                        {/* Stock Availability Check */}
                        {menuItem && recipeItems.length > 0 && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <h4 className="mb-2 text-sm font-medium text-gray-900">
                                    Check Stock Availability
                                </h4>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500">
                                        Check if you have enough stock to make
                                        this menu item
                                    </p>
                                    <SecondaryButton
                                        type="button"
                                        onClick={checkStockAvailability}
                                        disabled={checkingAvailability}
                                    >
                                        {checkingAvailability
                                            ? 'Checking...'
                                            : 'Check Availability'}
                                    </SecondaryButton>
                                </div>
                                {availabilityResult && (
                                    <div className="mt-3">
                                        {availabilityResult.can_make ? (
                                            <div className="flex items-center gap-2 rounded-md bg-green-50 p-2 text-sm text-green-800">
                                                <CheckCircle className="h-4 w-4" />
                                                <span>
                                                    Stock available for{' '}
                                                    {
                                                        availabilityResult.quantity
                                                    }{' '}
                                                    serving(s)
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-sm text-red-800">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <span>
                                                        Insufficient stock
                                                    </span>
                                                </div>
                                                {availabilityResult.issues?.map(
                                                    (issue, idx: number) => (
                                                        <div
                                                            key={idx}
                                                            className="rounded-md bg-red-50 p-2 text-xs text-red-700"
                                                        >
                                                            {issue.ingredient}:
                                                            Need{' '}
                                                            {issue.required}{' '}
                                                            {issue.unit || ''},
                                                            Have{' '}
                                                            {issue.available}{' '}
                                                            (Shortage:{' '}
                                                            {issue.shortage})
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                    <SecondaryButton type="button" onClick={onClose}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton
                        type="button"
                        onClick={submit}
                        disabled={saving || recipeItems.length === 0}
                    >
                        {saving ? 'Saving...' : 'Save Recipe'}
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}
