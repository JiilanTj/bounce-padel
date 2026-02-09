import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { formatCurrency } from '@/utils/currency';
import {
    ArrowTrendingUpIcon,
    BanknotesIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    PlusIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, usePage } from '@inertiajs/react';

type DashboardStats = {
    total_revenue: number;
    active_bookings: number;
    new_members: number;
    today_sales: number;
    revenue_change: number;
    members_change: number;
    today_sales_change: number;
};

type ActivityItem = {
    id: string;
    type: 'booking' | 'order' | 'user';
    title: string;
    subtitle: string;
    status: string;
    amount: number | null;
    created_at: string;
};

type Props = PageProps & {
    stats: DashboardStats;
    recent_activity: ActivityItem[];
};

export default function Dashboard({
    stats: realStats,
    recent_activity,
}: Props) {
    const user = usePage<PageProps>().props.auth.user;

    const formatChange = (value: number) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value}%`;
    };

    const getChangeType = (value: number) => {
        return value >= 0 ? 'increase' : 'decrease';
    };

    type StatItem = {
        name: string;
        value: string;
        icon: React.ForwardRefExoticComponent<
            React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & {
                title?: string;
                titleId?: string;
            }
        >;
        iconBg: string;
        iconColor: string;
        roles: string[];
        change?: string;
        changeType?: 'increase' | 'decrease';
    };

    const stats: StatItem[] = [
        {
            name: 'Total Revenue',
            value: formatCurrency(realStats.total_revenue),
            change: formatChange(realStats.revenue_change),
            changeType: getChangeType(realStats.revenue_change),
            icon: BanknotesIcon,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            roles: ['owner', 'admin'],
        },
        {
            name: 'Active Bookings',
            value: realStats.active_bookings.toString(),
            icon: CalendarDaysIcon,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            roles: ['owner', 'admin', 'kasir'],
        },
        {
            name: 'New Members',
            value: realStats.new_members.toString(),
            change: formatChange(realStats.members_change),
            changeType: getChangeType(realStats.members_change),
            icon: UserGroupIcon,
            iconBg: 'bg-pink-100',
            iconColor: 'text-pink-600',
            roles: ['owner', 'admin'],
        },
        {
            name: "Today's Sales",
            value: formatCurrency(realStats.today_sales),
            change: formatChange(realStats.today_sales_change),
            changeType: getChangeType(realStats.today_sales_change),
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
            href: route('bookings.create'),
        },
        // {
        //     name: 'View Reports',
        //     icon: ChartBarIcon,
        //     color: 'bg-purple-600 hover:bg-purple-700',
        //     roles: ['admin', 'owner'],
        //     href: '#', // Placeholder for reports
        // },
    ];

    const filteredActions = quickActions.filter((action) =>
        action.roles.includes(user.role),
    );

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'booking':
                return {
                    icon: CalendarDaysIcon,
                    bg: 'bg-blue-100',
                    color: 'text-blue-600',
                };
            case 'order':
                return {
                    icon: BanknotesIcon,
                    bg: 'bg-green-100',
                    color: 'text-green-600',
                };
            case 'user':
                return {
                    icon: UserGroupIcon,
                    bg: 'bg-purple-100',
                    color: 'text-purple-600',
                };
            default:
                return {
                    icon: ChartBarIcon,
                    bg: 'bg-gray-100',
                    color: 'text-gray-600',
                };
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            confirmed: 'bg-green-100 text-green-800',
            paid: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-yellow-100 text-yellow-800',
            new: 'bg-blue-100 text-blue-800',
            cancelled: 'bg-red-100 text-red-800',
            completed: 'bg-green-100 text-green-800',
        };

        return (
            <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    styles[status] || 'bg-gray-100 text-gray-800'
                }`}
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

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
                            {stat.change && (
                                <span
                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                                        stat.changeType === 'increase'
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-red-50 text-red-700'
                                    }`}
                                >
                                    {stat.change}
                                </span>
                            )}
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
                            <Link
                                key={action.name}
                                href={action.href}
                                className={`inline-flex items-center rounded-xl ${action.color} px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors`}
                            >
                                <action.icon className="mr-2 h-4 w-4" />
                                {action.name}
                            </Link>
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
                    </div>
                    <div className="space-y-4">
                        {recent_activity.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No recent activity.
                            </p>
                        ) : (
                            recent_activity.map((activity) => {
                                const {
                                    icon: Icon,
                                    bg,
                                    color,
                                } = getActivityIcon(activity.type);
                                return (
                                    <div
                                        key={activity.id}
                                        className="flex items-center space-x-4 rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                    >
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full ${bg}`}
                                        >
                                            <Icon
                                                className={`h-5 w-5 ${color}`}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {activity.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {activity.subtitle}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {activity.amount && (
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(
                                                        activity.amount,
                                                    )}
                                                </p>
                                            )}
                                            {getStatusBadge(activity.status)}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Statistics Summary */}
                <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Statistics</h3>
                        <span className="text-sm font-medium text-blue-100">
                            Current
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-100">
                                    Total Bookings
                                </span>
                                {/* We can use active bookings here or fetch total all time if needed */}
                                <span className="text-lg font-bold">
                                    {realStats.active_bookings}
                                </span>
                            </div>
                            <div className="mt-1 text-xs text-blue-200">
                                Active Bookings
                            </div>
                        </div>

                        <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-100">
                                    New Members
                                </span>
                                <span className="text-lg font-bold">
                                    {realStats.new_members}
                                </span>
                            </div>
                            <div className="mt-1 text-xs text-blue-200">
                                Last 30 Days
                            </div>
                        </div>

                        <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-100">
                                    Today's Sales
                                </span>
                                <span className="text-lg font-bold">
                                    {formatCurrency(realStats.today_sales)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
