import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const menuItems = [
        { label: 'Lapangan', href: '#' },
        { label: 'Fasilitas', href: '#' },
        { label: 'Rental Alat', href: '#' },
        { label: 'Padel Store', href: '#' },
        { label: 'Kontak', href: '#' },
    ];

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

                {/* Mobile Menu Button - Only visible when menu is CLOSED */}
                {!isOpen && (
                    <button
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 lg:hidden"
                        onClick={() => setIsOpen(true)}
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                )}

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-8 lg:flex">
                    {menuItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="text-sm font-medium text-gray-300 transition-colors hover:text-primary"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Mobile Full Screen Menu Overlay */}
            <div
                className={`fixed inset-0 z-[60] flex h-screen min-h-screen w-full flex-col bg-[#112217] transition-all duration-300 ease-out lg:hidden ${
                    isOpen
                        ? 'translate-y-0 opacity-100'
                        : 'pointer-events-none -translate-y-full opacity-0'
                }`}
            >
                {/* Mobile Menu Header */}
                <div className="flex shrink-0 items-center justify-between px-6 py-4">
                    <img
                        src="/logowithtype.png"
                        alt="Bounce Padel Logo"
                        className="h-10 w-auto"
                    />
                    <button
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                        onClick={() => setIsOpen(false)}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Mobile Menu Items */}
                <div className="flex flex-1 flex-col justify-center px-6">
                    <div className="flex flex-col space-y-6">
                        {menuItems.map((item, index) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-3xl font-bold text-white transition-colors hover:text-primary"
                                style={{
                                    transitionDelay: `${index * 50}ms`,
                                }}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Mobile Menu Footer */}
                <div className="shrink-0 border-t border-white/10 px-6 py-8">
                    <button className="flex w-full items-center justify-between rounded-full bg-white px-6 py-4 font-bold text-[#112217] transition-colors hover:bg-gray-100">
                        <span>Hubungi Kami</span>
                        <span className="material-symbols-outlined">
                            arrow_forward
                        </span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
