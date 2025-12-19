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
    // Use 'en-GB' for DD/MM/YYYY format which is common and stable
    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}
;
