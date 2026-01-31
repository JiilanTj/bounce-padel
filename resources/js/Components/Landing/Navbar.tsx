import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export default function Navbar() {
    const { auth } = usePage<PageProps>().props;

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-[#23482f] bg-background-dark/95 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 lg:px-10">
                <div className="flex items-center gap-3 text-white">
                    <div className="text-primary">
                        <span className="material-symbols-outlined text-3xl">
                            sports_tennis
                        </span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-white">
                        Bounce Padel
                    </h2>
                </div>
                <div className="hidden items-center gap-10 md:flex">
                    <a
                        className="text-sm font-medium text-gray-300 transition-colors hover:text-primary"
                        href="#"
                    >
                        Courts
                    </a>
                    <a
                        className="text-sm font-medium text-gray-300 transition-colors hover:text-primary"
                        href="#"
                    >
                        Shop
                    </a>
                    <a
                        className="text-sm font-medium text-gray-300 transition-colors hover:text-primary"
                        href="#"
                    >
                        Lessons
                    </a>
                    <a
                        className="text-sm font-medium text-gray-300 transition-colors hover:text-primary"
                        href="#"
                    >
                        Contact
                    </a>
                </div>
                <div className="flex items-center gap-4">
                    <button className="hidden text-white hover:text-primary sm:flex">
                        <span className="material-symbols-outlined">
                            search
                        </span>
                    </button>

                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-[#112217] transition-colors hover:bg-green-600"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('login')}
                                className="px-3 text-sm font-medium text-white transition-colors hover:text-primary"
                            >
                                Log in
                            </Link>
                            <Link
                                href={route('register')}
                                className="flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-[#112217] transition-colors hover:bg-green-600"
                            >
                                <span>Get Started</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
