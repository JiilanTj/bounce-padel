import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';

type TableData = {
    id: number;
    number: string;
    qr_code: string;
};

interface PrintQrProps extends PageProps {
    table: TableData;
}

export default function PrintQr({ table }: PrintQrProps) {
    useEffect(() => {
        // Auto-print when page loads
        window.print();
    }, []);

    // Generate full URL for deep linking
    // Example: https://bouncepadel.com/cafe-resto?table=TABLE-001
    const qrValue = `${window.location.origin}/cafe-resto?table=${table.qr_code}`;

    return (
        <div className="min-h-screen bg-white p-8 text-black print:p-0">
            <Head title={`Print QR - Table ${table.number}`} />

            <div className="mx-auto max-w-md border-4 border-black p-8 text-center print:max-w-none print:border-none">
                {/* Header */}
                <h1 className="mb-2 text-4xl font-bold uppercase tracking-widest">
                    Meja
                </h1>
                <h2 className="mb-8 text-8xl font-black">{table.number}</h2>

                {/* QR Code */}
                <div className="mb-8 flex justify-center">
                    <QRCodeSVG
                        value={qrValue}
                        size={300}
                        level="H" // High error correction
                        includeMargin={true}
                    />
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                    <p className="text-xl font-semibold uppercase">
                        Scan untuk Memesan
                    </p>
                    <p className="text-sm text-gray-600 print:text-black">
                        Arahkan kamera HP Anda ke QR Code di atas untuk melihat
                        menu dan memesan.
                    </p>
                </div>

                {/* Branding Footer */}
                <div className="mt-12 border-t-2 border-black pt-4">
                    <p className="text-sm font-bold tracking-widest text-gray-500 print:text-black">
                        BOUNCE PADEL CLUB
                    </p>
                </div>
            </div>

            {/* Print Controls (Hidden when printing) */}
            <div className="fixed bottom-8 left-0 right-0 text-center print:hidden">
                <button
                    onClick={() => window.print()}
                    className="rounded-full bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700"
                >
                    Print QR Code
                </button>
                <p className="mt-2 text-xs text-gray-400">
                    Tekan Ctrl+P jika tombol tidak berfungsi
                </p>
            </div>

            <style>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body {
                        margin: 1cm;
                    }
                }
            `}</style>
        </div>
    );
}
