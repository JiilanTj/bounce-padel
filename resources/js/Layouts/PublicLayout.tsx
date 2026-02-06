import Footer from '@/Components/Landing/Footer';
import Navbar from '@/Components/Landing/Navbar';
import { WebsiteSettings } from '@/Pages/Welcome';
import { Head } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';

export default function PublicLayout({
    title,
    children,
    settings,
}: PropsWithChildren<{ title?: string; settings?: WebsiteSettings | null }>) {
    return (
        <div className="bg-background-light font-body text-slate-900 transition-colors duration-300 dark:bg-background-dark dark:text-white">
            {title && (
                <Head>
                    <title>{title}</title>
                    {/* Google Fonts */}
                    <link
                        rel="preconnect"
                        href="https://fonts.googleapis.com"
                    />
                    <link
                        rel="preconnect"
                        href="https://fonts.gstatic.com"
                        crossOrigin="anonymous"
                    />
                    <link
                        href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap"
                        rel="stylesheet"
                    />
                    {/* Material Symbols */}
                    <link
                        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                        rel="stylesheet"
                    />
                </Head>
            )}

            <Navbar settings={settings} />

            <main className="min-h-screen">{children}</main>

            <Footer settings={settings} />

            <Toaster position="top-right" richColors />
        </div>
    );
}
