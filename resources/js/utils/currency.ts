/**
 * Format currency to compact format with K/Jt/M suffix (Indonesian style)
 * @param amount - The amount to format
 * @param includeDecimals - Whether to include decimals (default: true)
 * @returns Formatted string with Rp prefix
 *
 * Examples:
 * - 300000 -> Rp 300k
 * - 1500000 -> Rp 1.5Jt
 * - 1500000000 -> Rp 1.5M
 */
export function formatCurrency(
    amount: number,
    includeDecimals: boolean = true,
): string {
    if (amount === 0) return 'Rp 0';

    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    // Milyar (Billion)
    if (absAmount >= 1_000_000_000) {
        const value = absAmount / 1_000_000_000;
        return `${sign}Rp ${includeDecimals && value % 1 !== 0 ? value.toFixed(1) : Math.floor(value)}M`;
    }

    // Juta (Million)
    if (absAmount >= 1_000_000) {
        const value = absAmount / 1_000_000;
        return `${sign}Rp ${includeDecimals && value % 1 !== 0 ? value.toFixed(1) : Math.floor(value)}Jt`;
    }

    // Ribu (Thousand)
    if (absAmount >= 1_000) {
        const value = absAmount / 1_000;
        return `${sign}Rp ${includeDecimals && value % 1 !== 0 ? value.toFixed(1) : Math.floor(value)}k`;
    }

    return `${sign}Rp ${absAmount}`;
}

/**
 * Format currency to full format with thousand separators
 * @param amount - The amount to format
 * @returns Formatted string with Rp prefix
 *
 * Examples:
 * - 300000 -> Rp 300.000
 * - 1500000 -> Rp 1.500.000
 */
export function formatCurrencyFull(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
