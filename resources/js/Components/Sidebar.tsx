import { PageProps } from '@/types';
import {
    Bars3Icon,
    CalendarDaysIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    CreditCardIcon,
    HomeIcon,
    ShoppingBagIcon,
    UserGroupIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Sidebar({ className = '' }: { className?: string }) {
    const user = usePage<PageProps>().props.auth.user;
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            routeName: 'dashboard',
            icon: HomeIcon,
            roles: ['user', 'kasir', 'pelayan', 'admin', 'owner'],
        },
        {
            name: 'Courts',
            href: '#',
            routeName: 'courts.*',
            icon: ChartBarIcon,
            roles: ['admin', 'owner'],
        },
        {
            name: 'POS',
            href: '#',
            routeName: 'pos.*',
            icon: CreditCardIcon,
            roles: ['kasir', 'owner'],
        },
        {
            name: 'Orders',
            href: '#',
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
            name: 'My Bookings',
            href: '#',
            routeName: 'bookings.*',
            icon: CalendarDaysIcon,
            roles: ['user'],
        },
    ];

    const bottomNavItems = [
        {
            name: 'Settings',
            href: route('profile.edit'),
            routeName: 'profile.*',
            icon: Cog6ToothIcon,
            roles: ['user', 'kasir', 'pelayan', 'admin', 'owner'],
        },
    ];

    const filteredNav = navItems.filter((item) =>
        item.roles.includes(user.role),
    );

    const filteredBottomNav = bottomNavItems.filter((item) =>
        item.roles.includes(user.role),
    );

    const isActive = (routeName: string) => {
        if (!routeName) return false;
        return route().current(routeName);
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
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/30">
                                <span className="text-sm font-bold text-white">
                                    BP
                                </span>
                            </div>
                            <span className="text-lg font-bold text-gray-800">
                                Bounce
                            </span>
                        </Link>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                        {filteredNav.map((item) => {
                            const active = isActive(item.routeName);
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
                                    <item.icon
                                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                            active
                                                ? 'text-white'
                                                : 'text-gray-400 group-hover:text-gray-600'
                                        }`}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Navigation */}
                    <div className="border-t border-gray-100 px-3 py-3">
                        {filteredBottomNav.map((item) => {
                            const active = isActive(item.routeName);
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
                                    <item.icon
                                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                            active
                                                ? 'text-white'
                                                : 'text-gray-400 group-hover:text-gray-600'
                                        }`}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Info */}
                    <div className="border-t border-gray-100 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md ring-2 ring-white">
                                <span className="text-sm font-semibold text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
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
