import CTA from '@/Components/Landing/CTA';
import Facilities from '@/Components/Landing/Facilities';
import Footer from '@/Components/Landing/Footer';
import Hero from '@/Components/Landing/Hero';
import Navbar from '@/Components/Landing/Navbar';
import Shop from '@/Components/Landing/Shop';
import Stats from '@/Components/Landing/Stats';
import { Head } from '@inertiajs/react';

export interface WebsiteSettings {
    phone_number: string | null;
    email: string | null;
    location: string | null;
    location_link: string | null;
    facebook_link: string | null;
    instagram_link: string | null;
    twitter_link: string | null;
}

export default function Welcome({
    settings,
}: {
    settings: WebsiteSettings | null;
}) {
    return (
        <div className="bg-background-light font-body text-slate-900 transition-colors duration-300 dark:bg-background-dark dark:text-white">
            <Head>
                <title>Bounce Padel - Lapangan & Perlengkapan Premium</title>
                <meta
                    name="description"
                    content="Bounce Padel - Klub Padel Premier Kota"
                />

                {/* Google Fonts */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
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

            <Navbar settings={settings} />

            <main>
                <Hero />
                <Stats />
                <Facilities />
                <Shop />
                <CTA />
            </main>

            <Footer settings={settings} />
        </div>
    );
}
