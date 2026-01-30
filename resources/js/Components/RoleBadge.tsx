interface RoleBadgeProps {
    role: 'user' | 'kasir' | 'pelayan' | 'admin' | 'owner';
    size?: 'sm' | 'md' | 'lg';
}

export default function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
    const roleConfig = {
        user: {
            label: 'User',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
        },
        kasir: {
            label: 'Kasir',
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
        },
        pelayan: {
            label: 'Pelayan',
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-800',
        },
        admin: {
            label: 'Admin',
            bgColor: 'bg-orange-100',
            textColor: 'text-orange-800',
        },
        owner: {
            label: 'Owner',
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
        },
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
    };

    const config = roleConfig[role];
    const sizeClass = sizeClasses[size];

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClass}`}
        >
            {config.label}
        </span>
    );
}
