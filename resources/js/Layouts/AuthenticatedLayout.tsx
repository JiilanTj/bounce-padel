import Sidebar from '@/Components/Sidebar';
import { PageProps } from '@/types';
import {
    BellIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { Link, usePage } from '@inertiajs/react';
import {
    PropsWithChildren,
    ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';
import { Toaster } from 'sonner';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage<PageProps>().props.auth.user;
    const [searchOpen, setSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

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
                            <button className="relative rounded-xl p-2.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600">
                                <BellIcon className="h-5 w-5" />
                                <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500"></span>
                            </button>

                            {/* Divider */}
                            <div className="mx-2 h-8 w-px bg-gray-200"></div>

                            {/* User */}
                            <Link
                                href={route('profile.edit')}
                                className="flex items-center space-x-3 rounded-xl p-1.5 transition-colors hover:bg-gray-50"
                            >
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
                            </Link>
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
