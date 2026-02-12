import { formatCurrency } from '@/utils/currency';

type Product = {
    name: string;
};

type OrderItem = {
    quantity: number;
    price: number;
    subtotal: number;
    item: Product;
};

type OrderForReceipt = {
    id: number;
    created_at: string;
    status: string;
    total_amount: number;
    user: {
        name: string;
        phone?: string | null;
    };
    items: OrderItem[];
};

export const printProductReceipt = (
    order: OrderForReceipt,
    cashierName: string,
) => {
    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) return;

    const date = new Date(order.created_at).toLocaleDateString('id-ID', {
        timeZone: 'UTC',
    });
    const time = new Date(order.created_at).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
    });

    const itemsHtml = order.items
        .map(
            (item) => `
        <div class="mb-1">
            <div class="flex">
                <div style="flex: 1;">${item.item.name}</div>
            </div>
            <div class="flex" style="font-size: 11px; color: #333;">
                <div>${item.quantity} x ${formatCurrency(item.price)}</div>
                <div>${formatCurrency(item.subtotal)}</div>
            </div>
        </div>
    `,
        )
        .join('');

    const content = `
        <html>
        <head>
            <title>Receipt #${order.id}</title>
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
                <div style="font-size: 10px;">Sales Receipt</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="mb-2">
                <div>ID: #${order.id}</div>
                <div>Date: ${date} ${time}</div>
                <div>Cashier: ${cashierName}</div>
            </div>

            <div class="divider"></div>

            <div class="mb-2">
                <div class="font-bold">Customer</div>
                <div>${order.user.name}</div>
                ${order.user.phone ? `<div>${order.user.phone}</div>` : ''}
            </div>

            <div class="divider"></div>

            <div class="mb-2">
                <div class="font-bold mb-1">Items</div>
                ${itemsHtml}
            </div>

            <div class="divider"></div>

            <div class="flex font-bold" style="font-size: 14px;">
                <div>TOTAL</div>
                <div>${formatCurrency(order.total_amount)}</div>
            </div>
            
            <div class="flex" style="margin-top: 5px;">
                <div>Status</div>
                <div class="font-bold">${order.status.toUpperCase()}</div>
            </div>

            <div class="divider"></div>

            <div class="text-center" style="font-size: 10px; margin-top: 20px;">
                Thank you for shopping!<br>
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
