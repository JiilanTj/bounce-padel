import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    ArrowTrendingUpIcon,
    BanknotesIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    PlusIcon,
    UserGroupIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const user = usePage<PageProps>().props.auth.user;

    // Sample data - replace with real data later
    const stats = [
        {
            name: 'Total Revenue',
            value: 'Rp 24.098.000',
            change: '+8.96%',
            changeType: 'increase',
            icon: BanknotesIcon,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            roles: ['owner', 'admin'],
        },
        {
            name: 'Active Bookings',
            value: '24',
            change: '+3.2%',
            changeType: 'increase',
            icon: CalendarDaysIcon,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            roles: ['owner', 'admin', 'kasir'],
        },
        {
            name: 'New Members',
            value: '156',
            change: '+12.5%',
            changeType: 'increase',
            icon: UserGroupIcon,
            iconBg: 'bg-pink-100',
            iconColor: 'text-pink-600',
            roles: ['owner', 'admin'],
        },
        {
            name: "Today's Sales",
            value: 'Rp 1.980.000',
            change: '+1.92%',
            changeType: 'increase',
            icon: ArrowTrendingUpIcon,
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            roles: ['kasir', 'owner', 'admin'],
        },
    ];

    const filteredStats = stats.filter((stat) =>
        stat.roles.includes(user.role),
    );

    const quickActions = [
        {
            name: 'Create New Booking',
            icon: PlusIcon,
            color: 'bg-blue-600 hover:bg-blue-700',
            roles: ['admin', 'owner', 'kasir'],
        },
        {
            name: 'Add New Member',
            icon: UserPlusIcon,
            color: 'bg-green-600 hover:bg-green-700',
            roles: ['admin', 'owner'],
        },
        {
            name: 'View Reports',
            icon: ChartBarIcon,
            color: 'bg-purple-600 hover:bg-purple-700',
            roles: ['admin', 'owner'],
        },
    ];

    const filteredActions = quickActions.filter((action) =>
        action.roles.includes(user.role),
    );

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-xl font-semibold text-gray-900">
                    Dashboard
                </h1>
            }
        >
            <Head title="Dashboard" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {filteredStats.map((stat) => (
                    <div
                        key={stat.name}
                        className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div className={`rounded-xl ${stat.iconBg} p-3`}>
                                <stat.icon
                                    className={`h-6 w-6 ${stat.iconColor}`}
                                />
                            </div>
                            <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                                    stat.changeType === 'increase'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-red-50 text-red-700'
                                }`}
                            >
                                {stat.change}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500">
                                {stat.name}
                            </p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            {filteredActions.length > 0 && (
                <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                        Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {filteredActions.map((action) => (
                            <button
                                key={action.name}
                                className={`inline-flex items-center rounded-xl ${action.color} px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors`}
                            >
                                <action.icon className="mr-2 h-4 w-4" />
                                {action.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Content Grid */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Recent Activity */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Recent Activity
                        </h3>
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            View all
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4 rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    New booking from John Doe
                                </p>
                                <p className="text-xs text-gray-500">
                                    Court A • 5 minutes ago
                                </p>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                Confirmed
                            </span>
                        </div>
                        <div className="flex items-center space-x-4 rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                <UserGroupIcon className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    New member registration
                                </p>
                                <p className="text-xs text-gray-500">
                                    Sarah Smith • 12 minutes ago
                                </p>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                New
                            </span>
                        </div>
                        <div className="flex items-center space-x-4 rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                <BanknotesIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    Payment received
                                </p>
                                <p className="text-xs text-gray-500">
                                    Rp 350.000 • 25 minutes ago
                                </p>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                Completed
                            </span>
                        </div>
                    </div>
                </div>

                {/* Statistics Summary */}
                <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Statistics</h3>
                        <span className="text-sm font-medium text-blue-100">
                            This Month
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-100">
                                    Total Bookings
                                </span>
                                <span className="text-lg font-bold">248</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-white/20">
                                <div
                                    className="h-2 rounded-full bg-white"
                                    style={{ width: '75%' }}
                                ></div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-100">
                                    Court Utilization
                                </span>
                                <span className="text-lg font-bold">82%</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-white/20">
                                <div
                                    className="h-2 rounded-full bg-white"
                                    style={{ width: '82%' }}
                                ></div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-100">
                                    Member Growth
                                </span>
                                <span className="text-lg font-bold">+24%</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-white/20">
                                <div
                                    className="h-2 rounded-full bg-emerald-400"
                                    style={{ width: '24%' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
