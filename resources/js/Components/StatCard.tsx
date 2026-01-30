import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const colorClasses = {
    blue: {
        bg: 'bg-blue-50',
        icon: 'bg-blue-100 text-blue-600',
        text: 'text-blue-600',
    },
    green: {
        bg: 'bg-green-50',
        icon: 'bg-green-100 text-green-600',
        text: 'text-green-600',
    },
    purple: {
        bg: 'bg-purple-50',
        icon: 'bg-purple-100 text-purple-600',
        text: 'text-purple-600',
    },
    orange: {
        bg: 'bg-orange-50',
        icon: 'bg-orange-100 text-orange-600',
        text: 'text-orange-600',
    },
    red: {
        bg: 'bg-red-50',
        icon: 'bg-red-100 text-red-600',
        text: 'text-red-600',
    },
};

export default function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    color = 'blue',
}: StatCardProps) {
    const colors = colorClasses[color];

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        {value}
                    </p>
                    {description && (
                        <p className="mt-1 text-sm text-gray-500">
                            {description}
                        </p>
                    )}
                    {trend && (
                        <div className="mt-2 flex items-center text-sm">
                            <span
                                className={`font-medium ${
                                    trend.isPositive
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}
                            >
                                {trend.isPositive ? '+' : ''}
                                {trend.value}%
                            </span>
                            <span className="ml-1 text-gray-500">
                                vs last month
                            </span>
                        </div>
                    )}
                </div>
                <div className={`rounded-xl p-3 ${colors.icon}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}
