import Sidebar from '@/Components/Sidebar';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { PageProps } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
    BellIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightOnRectangleIcon, UserIcon } from '@heroicons/react/24/solid';
import { Link, router, usePage } from '@inertiajs/react';
import {
    PropsWithChildren,
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { Toaster, toast } from 'sonner';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage<PageProps>().props.auth.user;
    const [searchOpen, setSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Enable order notifications ONLY for cashier (kasir)
    const enableNotifications = user.role === 'kasir';

    // Handler untuk new order - menampilkan toast sekali per order baru
    const handleNewOrder = useCallback(
        (order: {
            customer_name: string;
            table_number?: string;
            items_count: number;
            total_amount: number;
        }) => {
            toast.success(
                `Order baru dari ${order.customer_name}${order.table_number ? ` - Meja ${order.table_number}` : ''}`,
                {
                    description: `${order.items_count} item • ${formatCurrency(order.total_amount)}`,
                    duration: 5000,
                    action: {
                        label: 'Lihat',
                        onClick: () => router.visit(route('orders.index')),
                    },
                },
            );
        },
        [],
    );

    const {
        newOrdersCount,
        notifications,
        isConnected,
        markAsRead,
        markAllAsRead,
        clearRead,
    } = useOrderNotifications(enableNotifications, handleNewOrder);

    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    const handleSearchToggle = () => {
        setSearchOpen(!searchOpen);
    };

    const handleSearchClose = () => {
        setSearchOpen(false);
    };

    return (
        <>
            <Toaster
                position="top-right"
                richColors
                closeButton
                expand={true}
                toastOptions={{
                    style: {
                        zIndex: 9999,
                    },
                }}
            />
            <div className="flex h-screen overflow-hidden bg-gray-50">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Top Header Bar */}
                    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6">
                        {/* Left side - Page Title */}
                        <div className="flex-1">{header}</div>

                        {/* Right side - Actions */}
                        <div className="flex items-center space-x-2">
                            {/* Expandable Search */}
                            <div className="relative flex items-center">
                                <div
                                    className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${
                                        searchOpen
                                            ? 'w-64 rounded-xl border border-gray-200 bg-gray-50'
                                            : 'w-10'
                                    }`}
                                >
                                    <button
                                        onClick={handleSearchToggle}
                                        className={`flex-shrink-0 rounded-xl p-2.5 text-gray-400 transition-colors hover:text-gray-600 ${
                                            searchOpen
                                                ? 'hover:bg-gray-100'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <MagnifyingGlassIcon className="h-5 w-5" />
                                    </button>

                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search..."
                                        className={`flex-1 border-0 bg-transparent py-2 pr-2 text-sm text-gray-700 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-0 ${
                                            searchOpen
                                                ? 'w-full opacity-100'
                                                : 'w-0 opacity-0'
                                        }`}
                                        onBlur={() => {
                                            // Delay close to allow click on close button
                                            setTimeout(() => {
                                                if (
                                                    searchInputRef.current
                                                        ?.value === ''
                                                ) {
                                                    handleSearchClose();
                                                }
                                            }, 150);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') {
                                                handleSearchClose();
                                            }
                                        }}
                                    />

                                    {searchOpen && (
                                        <button
                                            onClick={handleSearchClose}
                                            className="flex-shrink-0 p-2 text-gray-400 transition-colors hover:text-gray-600"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Notifications */}
                            {enableNotifications ? (
                                <Menu as="div" className="relative">
                                    <MenuButton className="relative rounded-xl p-2.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600">
                                        <BellIcon className="h-5 w-5" />
                                        {newOrdersCount > 0 && (
                                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                                {newOrdersCount > 9
                                                    ? '9+'
                                                    : newOrdersCount}
                                            </span>
                                        )}
                                        {/* Connection status indicator */}
                                        <span
                                            className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${
                                                isConnected
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-300'
                                            }`}
                                            title={
                                                isConnected
                                                    ? 'Terhubung'
                                                    : 'Terputus'
                                            }
                                        />
                                    </MenuButton>

                                    <MenuItems className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                Notifikasi Pesanan (
                                                {newOrdersCount})
                                            </h3>
                                            {notifications.filter(
                                                (n) => !n.read,
                                            ).length > 0 && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="text-xs text-blue-600 hover:text-blue-700"
                                                    >
                                                        Tandai dibaca
                                                    </button>
                                                    <button
                                                        onClick={clearRead}
                                                        className="text-xs text-red-600 hover:text-red-700"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.filter(
                                                (n) => !n.read,
                                            ).length === 0 ? (
                                                <div className="px-4 py-8 text-center text-sm text-gray-500">
                                                    <BellIcon className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                                                    <p>
                                                        Belum ada pesanan baru
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="py-1">
                                                    {notifications
                                                        .filter((n) => !n.read) // Hanya tampilkan yang belum dibaca
                                                        .slice(0, 10)
                                                        .map((notification) => (
                                                            <MenuItem
                                                                key={
                                                                    notification.id
                                                                }
                                                            >
                                                                {({
                                                                    focus,
                                                                }) => (
                                                                    <Link
                                                                        href={route(
                                                                            'orders.index',
                                                                        )}
                                                                        onClick={() =>
                                                                            markAsRead(
                                                                                notification.id,
                                                                            )
                                                                        }
                                                                        className={`block px-4 py-3 text-sm ${
                                                                            focus
                                                                                ? 'bg-gray-50'
                                                                                : 'bg-blue-50/50'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <p className="font-medium text-gray-900">
                                                                                        {
                                                                                            notification.customer_name
                                                                                        }
                                                                                    </p>
                                                                                    {!notification.read && (
                                                                                        <span className="flex h-2 w-2 rounded-full bg-blue-500" />
                                                                                    )}
                                                                                </div>
                                                                                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                                                                    {notification.table_number && (
                                                                                        <span>
                                                                                            Meja{' '}
                                                                                            {
                                                                                                notification.table_number
                                                                                            }
                                                                                        </span>
                                                                                    )}
                                                                                    <span>
                                                                                        •
                                                                                    </span>
                                                                                    <span
                                                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                                                                                            notification.type ===
                                                                                            'pos'
                                                                                                ? 'bg-purple-100 text-purple-800'
                                                                                                : 'bg-blue-100 text-blue-800'
                                                                                        }`}
                                                                                    >
                                                                                        {notification.type.toUpperCase()}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="ml-4 text-right">
                                                                                <p className="text-xs text-gray-500">
                                                                                    {
                                                                                        notification.items_count
                                                                                    }{' '}
                                                                                    item
                                                                                </p>
                                                                                <p className="text-sm font-semibold text-gray-900">
                                                                                    {formatCurrency(
                                                                                        notification.total_amount,
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </Link>
                                                                )}
                                                            </MenuItem>
                                                        ))}
                                                </div>
                                            )}
                                        </div>

                                        {notifications.length > 0 && (
                                            <div className="border-t border-gray-100 px-4 py-2">
                                                <Link
                                                    href={route('orders.index')}
                                                    className="block text-center text-xs font-medium text-blue-600 hover:text-blue-700"
                                                >
                                                    Lihat semua pesanan →
                                                </Link>
                                            </div>
                                        )}
                                    </MenuItems>
                                </Menu>
                            ) : null}

                            {/* Divider */}
                            <div className="mx-2 h-8 w-px bg-gray-200"></div>

                            {/* User Profile Dropdown */}
                            <Menu as="div" className="relative">
                                <MenuButton className="flex items-center space-x-3 rounded-xl p-1.5 transition-colors hover:bg-gray-50">
                                    <div className="hidden text-right sm:block">
                                        <p className="text-sm font-semibold text-gray-800">
                                            {user.name}
                                        </p>
                                        <p className="text-xs capitalize text-gray-500">
                                            {user.role}
                                        </p>
                                    </div>
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="h-9 w-9 rounded-full object-cover shadow-sm ring-2 ring-white"
                                    />
                                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                </MenuButton>

                                <MenuItems className="absolute right-0 z-50 mt-1 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                                    <div className="py-1">
                                        <MenuItem>
                                            {({ focus }) => (
                                                <Link
                                                    href={route('profile.edit')}
                                                    className={`flex items-center px-4 py-2 text-sm ${
                                                        focus
                                                            ? 'bg-gray-50 text-gray-900'
                                                            : 'text-gray-700'
                                                    }`}
                                                >
                                                    <UserIcon className="mr-3 h-4 w-4" />
                                                    Profile
                                                </Link>
                                            )}
                                        </MenuItem>
                                        <div className="border-t border-gray-100" />
                                        <MenuItem>
                                            {({ focus }) => (
                                                <button
                                                    onClick={() =>
                                                        router.post(
                                                            route('logout'),
                                                        )
                                                    }
                                                    className={`flex w-full items-center px-4 py-2 text-left text-sm ${
                                                        focus
                                                            ? 'bg-gray-50 text-gray-900'
                                                            : 'text-gray-700'
                                                    }`}
                                                >
                                                    <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                                                    Logout
                                                </button>
                                            )}
                                        </MenuItem>
                                    </div>
                                </MenuItems>
                            </Menu>
                        </div>
                    </header>

                    {/* Scrollable Main Content */}
                    <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
