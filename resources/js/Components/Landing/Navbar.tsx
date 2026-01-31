import { Link } from '@inertiajs/react';

export default function Navbar() {

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-landing-border bg-background-dark/95 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 lg:px-10">
                <div className="flex items-center gap-3 text-white">
                    <img
                        src="/logowithtype.png"
                        alt="Bounce Padel Logo"
                        className="h-10 w-auto"
                    />
                </div>
                {/* Desktop Navigation */}
                <div className="hidden items-center gap-8 lg:flex">
                    <Link
                        href="#"
                        className="text-sm font-medium text-gray-300 transition-colors hover:text-primary"
                    >
                        Lapangan
                    </Link>
                    <Link
                        href="#"
                        className="text-sm font-medium text-gray-300 transition-colors hover:text-primary"
                    >
                        Fasilitas
                    </Link>
                    <Link
                        href="#"
                        className="text-sm font-medium text-gray-300 transition-colors hover:text-primary"
                    >
                        Rental Alat
                    </Link>
                    <Link
                        href="#"
                        className="text-sm font-medium text-gray-300 transition-colors hover:text-primary"
                    >
                        Padel Store
                    </Link>
                    <Link
                        href="#"
                        className="text-sm font-medium text-gray-300 transition-colors hover:text-primary"
                    >
                        Kontak
                    </Link>
                </div>
            </div>
        </nav>
    );
}
