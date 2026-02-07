export function formatCurrency(amount: number) {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

export function formatNumber(amount: number, unit?: string) {
    const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
    return unit ? `${formatted} ${unit}` : formatted;
}

export function formatDate(date: Date | string | null | undefined) {
    if (!date) return '-';
    // Use 'en-GB' for YYYY-MM-DD format manually as toLocaleDateString might be locale dependent
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
}

export function formatDateTime(date: Date | string | null | undefined) {
    if (!date) return '-';
    // Use 'en-GB' for YYYY-MM-DD format manually
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Returns the current date in YYYY-MM-DD format based on the client's local timezone.
 * Useful for setting default values in <input type="date" />
 */
export function getLocalISODate(date: Date = new Date()) {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60000));
    return localDate.toISOString().split('T')[0];
}
