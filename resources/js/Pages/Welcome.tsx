import CTA from '@/Components/Landing/CTA';
import Facilities from '@/Components/Landing/Facilities';
import Footer from '@/Components/Landing/Footer';
import Hero from '@/Components/Landing/Hero';
import Navbar from '@/Components/Landing/Navbar';
import Shop from '@/Components/Landing/Shop';
import Stats from '@/Components/Landing/Stats';
import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <div className="bg-background-light font-body text-slate-900 transition-colors duration-300 dark:bg-background-dark dark:text-white">
            <Head>
                <title>Bounce Padel - Premium Courts & Gear</title>
                <meta
                    name="description"
                    content="Bounce Padel - The City's Premier Padel Club"
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

            <Navbar />

            <main>
                <Hero />
                <Stats />
                <Facilities />
                <Shop />
                <CTA />
            </main>

            <Footer />
        </div>
    );
}
