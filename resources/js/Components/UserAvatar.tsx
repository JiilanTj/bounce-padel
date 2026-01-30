interface UserAvatarProps {
    name: string;
    imageUrl?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    role?: 'user' | 'kasir' | 'pelayan' | 'admin' | 'owner';
}

export default function UserAvatar({
    name,
    imageUrl,
    size = 'md',
    role,
}: UserAvatarProps) {
    // Get first letter of name
    const initial = name.charAt(0).toUpperCase();

    // Size configurations
    const sizeClasses = {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-2xl',
    };

    // Gradient based on role (fallback to blue if no role)
    const roleGradients = {
        user: 'from-blue-500 to-blue-600',
        kasir: 'from-green-500 to-green-600',
        pelayan: 'from-purple-500 to-purple-600',
        admin: 'from-orange-500 to-orange-600',
        owner: 'from-red-500 to-red-600',
    };

    const gradient = role ? roleGradients[role] : 'from-blue-500 to-indigo-600';

    return (
        <div
            className={`flex items-center justify-center rounded-full bg-gradient-to-br ${gradient} font-semibold text-white shadow-sm ${sizeClasses[size]}`}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={name}
                    className="h-full w-full rounded-full object-cover"
                />
            ) : (
                <span>{initial}</span>
            )}
        </div>
    );
}
