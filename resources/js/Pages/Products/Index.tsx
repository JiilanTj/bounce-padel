import ConfirmationModal from '@/Components/ConfirmationModal';
import Pagination from '@/Components/Pagination';
import StatCard from '@/Components/StatCard';
import Table from '@/Components/Table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    MagnifyingGlassIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Package,
    ShoppingCart,
    TrendingDown,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ProductForm from './Components/ProductForm';

type Category = {
    id: number;
    name: string;
    type: 'product' | 'menu';
};

type Product = {
    id: number;
    category_id: number;
    name: string;
    sku: string | null;
    description: string | null;
    price_buy: number;
    price_rent: number;
    stock_buy: number;
    stock_rent: number;
    image_url: string | null;
    category?: Category;
};

interface ProductsIndexProps extends PageProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    categories: Category[];
    filters: {
        search: string | null;
        category_id: string | null;
        sort_by: string;
        sort_order: 'asc' | 'desc';
    };
    stats: {
        total: number;
        low_stock_buy: number;
        low_stock_rent: number;
        total_value: number;
    };
}

export default function Index() {
    const { products, categories, filters, stats } =
        usePage<ProductsIndexProps>().props;
    const { flash } = usePage<PageProps>().props;

    // State
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(
        filters.category_id || 'all',
    );
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        product: Product | null;
    }>({ show: false, product: null });
    const [deleting, setDeleting] = useState(false);

    // Show flash messages as toast
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Debounced search
    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.get(
            route('products.index'),
            {
                search: searchQuery || undefined,
                category_id:
                    selectedCategory !== 'all' ? selectedCategory : undefined,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Category filter
    const handleCategoryFilter = (categoryId: string) => {
        setSelectedCategory(categoryId);
        router.get(
            route('products.index'),
            {
                search: searchQuery || undefined,
                category_id: categoryId !== 'all' ? categoryId : undefined,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Sorting
    const handleSort = (column: string) => {
        const newOrder =
            filters.sort_by === column && filters.sort_order === 'asc'
                ? 'desc'
                : 'asc';

        router.get(
            route('products.index'),
            {
                search: searchQuery || undefined,
                category_id:
                    selectedCategory !== 'all' ? selectedCategory : undefined,
                sort_by: column,
                sort_order: newOrder,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Modal handlers
    const openCreateModal = () => {
        setSelectedProduct(null);
        setShowModal(true);
    };

    const openEditModal = (product: Product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    // Delete product
    const handleDelete = () => {
        if (!deleteModal.product) return;

        setDeleting(true);
        router.delete(route('products.destroy', deleteModal.product.id), {
            onFinish: () => {
                setDeleting(false);
                setDeleteModal({ show: false, product: null });
            },
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Table columns configuration
    const columns = [
        {
            key: 'name',
            label: 'Product',
            sortable: true,
            render: (product: Product) => (
                <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                        <Package className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                            {product.name}
                        </p>
                        {product.sku && (
                            <p className="text-xs text-gray-500">
                                SKU: {product.sku}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Category',
            sortable: false,
            render: (product: Product) => (
                <p className="text-sm text-gray-600">
                    {product.category?.name || '-'}
                </p>
            ),
        },
        {
            key: 'price',
            label: 'Price (Buy / Rent)',
            sortable: false,
            className: 'text-right',
            render: (product: Product) => (
                <div className="text-sm text-gray-900">
                    <div>{formatCurrency(product.price_buy)}</div>
                    <div className="text-gray-500">
                        {formatCurrency(product.price_rent)}
                    </div>
                </div>
            ),
        },
        {
            key: 'stock',
            label: 'Stock (Buy / Rent)',
            sortable: false,
            className: 'text-right',
            render: (product: Product) => (
                <div className="text-sm">
                    <div
                        className={
                            product.stock_buy < 5
                                ? 'font-medium text-red-600'
                                : 'text-gray-900'
                        }
                    >
                        {product.stock_buy}
                    </div>
                    <div
                        className={
                            product.stock_rent < 5
                                ? 'font-medium text-red-600'
                                : 'text-gray-500'
                        }
                    >
                        {product.stock_rent}
                    </div>
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'text-right',
            render: (product: Product) => (
                <div className="flex items-center justify-end space-x-2">
                    <button
                        onClick={() => openEditModal(product)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600"
                        title="Edit"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() =>
                            setDeleteModal({
                                show: true,
                                product,
                            })
                        }
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-xl font-semibold text-gray-900">
                    Product Management
                </h1>
            }
        >
            <Head title="Products" />

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Products"
                    value={stats.total}
                    icon={Package}
                    description="All inventory items"
                    color="blue"
                />
                <StatCard
                    title="Low Stock (Buy)"
                    value={stats.low_stock_buy}
                    icon={AlertTriangle}
                    description="Items with < 5 units"
                    color="red"
                />
                <StatCard
                    title="Low Stock (Rent)"
                    value={stats.low_stock_rent}
                    icon={TrendingDown}
                    description="Items with < 5 units"
                    color="orange"
                />
                <StatCard
                    title="Total Value"
                    value={`Rp ${(stats.total_value / 1000000).toFixed(1)}M`}
                    icon={ShoppingCart}
                    description="Inventory value"
                    color="green"
                />
            </div>

            {/* Filters & Actions */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1 sm:max-w-md">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="block w-full rounded-lg border-gray-300 pl-10 pr-4 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                </form>

                {/* Category Filter & Add Button */}
                <div className="flex items-center gap-3">
                    <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryFilter(e.target.value)}
                        className="rounded-lg border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <PlusIcon className="mr-2 h-5 w-5" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={products.data}
                onSort={handleSort}
                sortBy={filters.sort_by}
                sortOrder={filters.sort_order}
                emptyMessage="No products found"
                emptyDescription="Get started by adding a new product"
            />

            {/* Pagination */}
            <Pagination
                currentPage={products.current_page}
                lastPage={products.last_page}
                perPage={products.per_page}
                from={products.from}
                to={products.to}
                total={products.total}
                links={products.links}
            />

            {/* Product Form Modal */}
            <ProductForm
                show={showModal}
                onClose={closeModal}
                product={selectedProduct}
                categories={categories}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, product: null })}
                onConfirm={handleDelete}
                title="Delete Product"
                message={`Are you sure you want to delete "${deleteModal.product?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </AuthenticatedLayout>
    );
}
