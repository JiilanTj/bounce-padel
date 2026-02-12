import { formatCurrency } from '@/utils/currency';

type OrderItem = {
    quantity: number;
    price: number;
    subtotal: number;
    item: {
        name: string;
    };
};

type Order = {
    id: number;
    items: OrderItem[];
};

export const printTableReceipt = (
    orders: Order[],
    tableName: string,
    startDate: string,
    endDate: string,
    cashierName: string,
) => {
    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) return;

    // Aggregate items
    const aggregatedItems: Record<
        string,
        { name: string; quantity: number; subtotal: number }
    > = {};
    let grandTotal = 0;

    orders.forEach((order) => {
        order.items.forEach((item) => {
            const quantity = Number(item.quantity) || 0;
            const subtotal = Number(item.subtotal) || 0;

            if (!aggregatedItems[item.item.name]) {
                aggregatedItems[item.item.name] = {
                    name: item.item.name,
                    quantity: 0,
                    subtotal: 0,
                };
            }
            aggregatedItems[item.item.name].quantity += quantity;
            aggregatedItems[item.item.name].subtotal += subtotal;
            grandTotal += subtotal;
        });
    });

    const itemsHtml = Object.values(aggregatedItems)
        .map(
            (item) => `
        <div class="mb-1">
            <div class="flex">
                <div style="flex: 1;">${item.name}</div>
            </div>
            <div class="flex" style="font-size: 11px; color: #333;">
                <div>${item.quantity} x</div>
                <div>${formatCurrency(item.subtotal)}</div>
            </div>
        </div>
    `,
        )
        .join('');

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            dateStyle: 'short',
            timeStyle: 'short',
            timeZone: 'UTC',
        });
    };

    const content = `
        <html>
        <head>
            <title>Table Receipt - ${tableName}</title>
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
                <div style="font-size: 10px;">Table Receipt</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="mb-2">
                <div class="font-bold" style="font-size: 14px;">${tableName}</div>
                <div style="font-size: 10px;">
                    From: ${formatDate(startDate)}<br>
                    To:   ${formatDate(endDate)}
                </div>
                <div>Cashier: ${cashierName}</div>
            </div>

            <div class="divider"></div>

            <div class="mb-2">
                <div class="font-bold mb-1">Consolidated Items</div>
                ${itemsHtml}
            </div>

            <div class="divider"></div>

            <div class="flex font-bold" style="font-size: 14px;">
                <div>TOTAL</div>
                <div>${formatCurrency(grandTotal)}</div>
            </div>
            
            <div class="divider"></div>

            <div class="text-center" style="font-size: 10px; margin-top: 20px;">
                ${new Date().toLocaleString('id-ID', { timeZone: 'UTC' })}
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
