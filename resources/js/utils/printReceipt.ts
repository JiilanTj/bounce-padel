import { formatCurrency } from '@/utils/currency';

type BookingForReceipt = {
    id: number;
    start_time: string;
    end_time: string;
    status: string;
    total_price: number;
    user: {
        name: string;
        phone: string | null;
    };
    court: {
        name: string;
    };
    notes?: string | null;
};

export const printReceipt = (
    booking: BookingForReceipt,
    cashierName: string,
) => {
    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) return;

    const startDate = new Date(booking.start_time).toLocaleDateString('id-ID', {
        timeZone: 'UTC',
    });
    const startTime = new Date(booking.start_time).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
    });
    const endTime = new Date(booking.end_time).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
    });

    const content = `
        <html>
        <head>
            <title>Receipt #${booking.id}</title>
            <style>
                @page { size: 58mm auto; margin: 0; }
                body {
                    font-family: 'Courier New', monospace;
                    width: 58mm;
                    padding: 10px;
                    margin: 0;
                    font-size: 12px;
                    line-height: 1.4;
                    color: black;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .divider { border-top: 1px dashed black; margin: 10px 0; }
                .mb-2 { margin-bottom: 8px; }
                .flex { display: flex; justify-content: space-between; }
            </style>
        </head>
        <body>
            <div class="text-center mb-2">
                <div class="font-bold" style="font-size: 16px;">BOUNCE PADEL</div>
                <div style="font-size: 10px;">Booking Receipt</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="mb-2">
                <div>ID: #${booking.id}</div>
                <div>Date: ${new Date().toLocaleDateString('id-ID')}</div>
                <div>Cashier: ${cashierName}</div>
            </div>

            <div class="divider"></div>

            <div class="mb-2">
                <div class="font-bold">Customer</div>
                <div>${booking.user.name}</div>
                <div>${booking.user.phone || '-'}</div>
            </div>

            <div class="mb-2">
                <div class="font-bold">Booking Details</div>
                <div>Court: ${booking.court.name}</div>
                <div>Date: ${startDate}</div>
                <div>Time: ${startTime} - ${endTime}</div>
            </div>

            <div class="divider"></div>

            <div class="flex font-bold" style="font-size: 14px;">
                <div>TOTAL</div>
                <div>${formatCurrency(booking.total_price)}</div>
            </div>
            
            <div class="flex" style="margin-top: 5px;">
                <div>Status</div>
                <div class="font-bold">${booking.status.toUpperCase()}</div>
            </div>

            <div class="divider"></div>

            <div class="text-center" style="font-size: 10px; margin-top: 20px;">
                Thank you for playing!<br>
                Please show this receipt at the counter.
            </div>

            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
};
