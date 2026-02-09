import { PageProps } from '@/types';
import {
    Bars3Icon,
    CalendarDaysIcon,
    ChartBarIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    Cog6ToothIcon,
    CreditCardIcon,
    GlobeAltIcon,
    HomeIcon,
    ShoppingBagIcon,
    Square2StackIcon,
    UserGroupIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

// Define a type for navigation items
type NavItem = {
    name: string;
    href?: string;
    routeName?: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>; // HeroIcon type
    roles?: string[];
    children?: { name: string; href: string; routeName: string }[];
};

export default function Sidebar({ className = '' }: { className?: string }) {
    const { props, url } = usePage<PageProps>();
    const user = props.auth.user;
    const [isOpen, setIsOpen] = useState(false);
    // State for collapsible menus. Key is the item name.
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
        {},
    );

    const toggleMenu = (name: string) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    const navItems: NavItem[] = useMemo(
        () => [
            {
                name: 'Dashboard',
                href: route('dashboard'),
                routeName: 'dashboard',
                icon: HomeIcon,
                roles: ['user', 'kasir', 'pelayan', 'admin', 'owner'],
            },
            {
                name: 'Master Data',
                icon: Square2StackIcon,
                roles: ['admin', 'owner'],
                children: [
                    {
                        name: 'Courts',
                        href: route('courts.index'),
                        routeName: 'courts.*',
                    },
                    {
                        name: 'Categories',
                        href: route('categories.index'),
                        routeName: 'categories.*',
                    },
                    {
                        name: 'Products',
                        href: route('products.index'),
                        routeName: 'products.*',
                    },
                    {
                        name: 'Inventories',
                        href: route('inventories.index'),
                        routeName: 'inventories.*',
                    },
                    {
                        name: 'Ingredients',
                        href: route('ingredients.index'),
                        routeName: 'ingredients.*',
                    },
                    {
                        name: 'Tables',
                        href: route('tables.index'),
                        routeName: 'tables.*',
                    },
                    {
                        name: 'Menus',
                        href: route('menus.index'),
                        routeName: 'menus.*',
                    },
                    {
                        name: 'Menu Items',
                        href: route('menu-items.index'),
                        routeName: 'menu-items.*',
                    },
                    {
                        name: 'Facilities',
                        href: route('facilities.index'),
                        routeName: 'facilities.*',
                    },
                ],
            },
            {
                name: 'Courts', // Keep separate for quick access if preferred, or remove if redundancy is bad.
                // User requested "Master Data" group. I will keep this hidden or removed to avoid clutter as per plan.
                // Actually, let's remove the duplicated top-level "Courts" since it's in Master Data now.
                // But wait, the previous code had it. I will remove it to be clean.
                href: route('courts.index'),
                routeName: 'courts.index.direct', // Fake route to avoid conflict if any
                icon: ChartBarIcon,
                roles: [], // Hide by giving no roles
            },
            {
                name: 'Booking & Product',
                icon: CalendarDaysIcon,
                roles: ['kasir', 'owner'],
                children: [
                    {
                        name: 'Court Bookings',
                        href: route('bookings.index'),
                        routeName: 'bookings.*',
                    },
                    {
                        name: 'Product Sales',
                        href: route('product-sales.index'),
                        routeName: 'product-sales.*',
                    },
                    {
                        name: 'Equipment Rental',
                        href: route('equipment-rentals.index'),
                        routeName: 'equipment-rentals.*',
                    },
                ],
            },
            {
                name: 'POS',
                href: route('pos.index'),
                routeName: 'pos.*',
                icon: CreditCardIcon,
                roles: ['kasir', 'owner'],
            },
            {
                name: 'Orders',
                href: route('orders.index'),
                routeName: 'orders.*',
                icon: ShoppingBagIcon,
                roles: ['pelayan', 'kasir', 'owner'],
            },
            {
                name: 'User Management',
                href: route('users.index'),
                routeName: 'users.*',
                icon: UserGroupIcon,
                roles: ['admin', 'owner'],
            },
            {
                name: 'Website Settings',
                href: route('website-settings.edit'),
                routeName: 'website-settings.*',
                icon: GlobeAltIcon,
                roles: ['owner'],
            },
            {
                name: 'My Bookings',
                href: '#',
                routeName: 'bookings.*',
                icon: CalendarDaysIcon,
                roles: ['user'],
            },
        ],
        [],
    );

    const bottomNavItems: NavItem[] = useMemo(
        () => [
            {
                name: 'Settings',
                href: route('profile.edit'),
                routeName: 'profile.*',
                icon: Cog6ToothIcon,
                roles: ['user', 'kasir', 'pelayan', 'admin', 'owner'],
            },
        ],
        [],
    );

    const filteredNav = navItems.filter(
        (item) => item.roles && item.roles.includes(user.role),
    );

    const filteredBottomNav = bottomNavItems.filter(
        (item) => item.roles && item.roles.includes(user.role),
    );

    useEffect(() => {
        navItems.forEach((item) => {
            if (
                item.children &&
                item.children.some((child) => route().current(child.routeName))
            ) {
                setExpandedMenus((prev) => ({
                    ...prev,
                    [item.name]: true,
                }));
            }
        });
    }, [url, navItems]);

    const isActive = (routeName?: string) => {
        if (!routeName) return false;
        return route().current(routeName);
    };

    const isChildActive = (children: { routeName: string }[]) => {
        return children.some((child) => route().current(child.routeName));
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="fixed left-4 top-4 z-50 lg:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="rounded-xl bg-white p-2.5 text-gray-600 shadow-lg transition-colors hover:bg-gray-50"
                >
                    {isOpen ? (
                        <XMarkIcon className="h-6 w-6" />
                    ) : (
                        <Bars3Icon className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Sidebar Container */}
            <div
                className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-100 bg-white transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:inset-0 lg:translate-x-0 ${className}`}
            >
                <div className="flex h-full flex-col">
                    {/* Logo Area */}
                    <div className="flex h-16 items-center px-6">
                        <Link href="/" className="flex items-center space-x-3">
                            <img
                                src="/textlogoungu.png"
                                alt="Bounce Padel"
                                className="h-8 w-auto"
                            />
                        </Link>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                        {filteredNav.map((item) => {
                            const hasChildren =
                                item.children && item.children.length > 0;
                            const active = item.routeName
                                ? isActive(item.routeName)
                                : hasChildren
                                  ? isChildActive(item.children || [])
                                  : false;

                            // If it has children, render collapsible menu
                            if (hasChildren) {
                                const isExpanded = expandedMenus[item.name];
                                const Icon = item.icon;
                                return (
                                    <div key={item.name} className="space-y-1">
                                        <button
                                            onClick={() =>
                                                toggleMenu(item.name)
                                            }
                                            className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                                active
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                {Icon && (
                                                    <Icon
                                                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                                            active
                                                                ? 'text-blue-600'
                                                                : 'text-gray-400 group-hover:text-gray-600'
                                                        }`}
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                {item.name}
                                            </div>
                                            {isExpanded ? (
                                                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>

                                        {/* Child Items */}
                                        {isExpanded && (
                                            <div className="space-y-1 pl-11">
                                                {item.children?.map((child) => {
                                                    const childActive =
                                                        isActive(
                                                            child.routeName,
                                                        );
                                                    return (
                                                        <Link
                                                            key={child.name}
                                                            href={child.href}
                                                            className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                                childActive
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                            }`}
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            // Standard Item
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                        active
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    {Icon && (
                                        <Icon
                                            className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                                active
                                                    ? 'text-white'
                                                    : 'text-gray-400 group-hover:text-gray-600'
                                            }`}
                                            aria-hidden="true"
                                        />
                                    )}
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Navigation */}
                    <div className="border-t border-gray-100 px-3 py-3">
                        {filteredBottomNav.map((item) => {
                            const active = isActive(item.routeName);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                        active
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    {Icon && (
                                        <Icon
                                            className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                                active
                                                    ? 'text-white'
                                                    : 'text-gray-400 group-hover:text-gray-600'
                                            }`}
                                            aria-hidden="true"
                                        />
                                    )}
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Info */}
                    <div className="border-t border-gray-100 p-4">
                        <div className="flex items-center space-x-3">
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-10 w-10 rounded-full object-cover shadow-md ring-2 ring-white"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-gray-800">
                                    {user.name}
                                </p>
                                <p className="text-xs capitalize text-gray-500">
                                    {user.role}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </>
    );
}
