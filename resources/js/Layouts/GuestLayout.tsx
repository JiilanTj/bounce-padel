import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen bg-[#112217]">
            {/* Left Side - Image/Decor */}
            <div className="relative hidden w-0 flex-1 lg:block">
                <div
                    className="absolute inset-0 z-0 h-full w-full bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAWlE-9UDhnPPYTmQb0VHg__XUkAnTXCthkpo9ZkfiKNRmIC7CQUcyKlnsJXP235wYvaGqewFFJ6HS--YbNjQeYE2x3zY2ZDkRAONMAB_vpQQE2vIrmZcxaQNBvlY1vScM2u7xObOEwAR4FH36sqXxgM13S30u2rFJlhKTFMZJQdSRa4dR52rgZPUZuuv4bOvFYYeL8oEaywrg-IRdz3tBHtoia3Bq3TAGivjgtI6ebmZiNrCk0Bw41S1hx4qBFbHuBUg_gv9b5Rko')",
                    }}
                ></div>
                <div className="absolute inset-0 bg-[#112217]/60 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 flex flex-col justify-between p-12">
                    <Link href="/">
                        <img
                            src="/textlogo.png"
                            alt="Bounce Padel"
                            className="h-12 w-auto brightness-200 grayscale md:h-16"
                        />
                    </Link>
                    <div>
                        <blockquote className="space-y-2">
                            <p className="text-lg font-medium text-white">
                                &ldquo;Bounce Padel has completely transformed
                                the way I play. The facilities are world-class
                                and the community is amazing.&rdquo;
                            </p>
                            <footer className="text-sm text-gray-400">
                                Sofia Davis, Member
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="lg:hidden">
                        <Link href="/">
                            <img
                                src="/textlogo.png"
                                alt="Bounce Padel"
                                className="h-12 w-auto brightness-200 grayscale"
                            />
                        </Link>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
