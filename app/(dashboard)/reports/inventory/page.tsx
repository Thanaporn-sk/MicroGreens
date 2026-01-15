import { prisma } from '@/lib/prisma';
import InventoryReportFilters from './inventory-filters';
import { format } from 'date-fns';

const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

export default async function InventoryReportPage({
    searchParams,
}: {
    searchParams?: Promise<{
        startDate?: string;
        endDate?: string;
        itemName?: string;
    }>;
}) {
    const params = await searchParams;
    const startDate = params?.startDate ? new Date(params.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = params?.endDate ? new Date(params.endDate) : new Date();
    const itemName = params?.itemName || '';

    // Adjust end date to end of day
    const endDateAdjusted = new Date(endDate);
    endDateAdjusted.setHours(23, 59, 59, 999);

    // 1. Fetch All Transactions
    const [purchases, harvests, sales, adjustments, materials] = await Promise.all([
        prisma.purchase.findMany({
            where: { date: { gte: startDate, lte: endDateAdjusted } },
            include: { material: true }
        }),
        prisma.harvest.findMany({
            where: { harvestDate: { gte: startDate, lte: endDateAdjusted }, materialId: { not: null } },
            include: { material: true, lot: true }
        }),
        prisma.sale.findMany({
            where: { saleDate: { gte: startDate, lte: endDateAdjusted } },
            include: { customer: true }
        }),
        prisma.stockAdjustment.findMany({
            where: { date: { gte: startDate, lte: endDateAdjusted } },
            include: { material: true }
        }),
        prisma.material.findMany({ include: { stock: true }, orderBy: { name: 'asc' } })
    ]);

    // 2. Normalize Transactions
    type Transaction = {
        id: string;
        date: Date;
        type: 'BUY' | 'SALE' | 'HARVEST' | 'ADJUST';
        item: string;
        quantity: number;
        value?: number;
        unit: string; // unit of measure
        detail: string;
    };

    let transactions: Transaction[] = [];

    // Purchases (IN)
    purchases.forEach(p => {
        if (itemName && p.material.name !== itemName) return;
        transactions.push({
            id: `P-${p.id}`,
            date: p.date,
            type: 'BUY',
            item: p.material.name,
            quantity: p.quantity,
            value: p.cost || 0,
            unit: p.material.unit,
            detail: `Cost: ${p.cost}`
        });
    });

    // Harvests (IN)
    harvests.forEach(h => {
        if (!h.material) return;
        if (itemName && h.material.name !== itemName) return;
        transactions.push({
            id: `H-${h.id}`,
            date: h.harvestDate,
            type: 'HARVEST',
            item: h.material.name,
            quantity: h.weight,
            unit: h.material.unit,
            detail: `Lot: ${h.lot.lotCode}`
        });
    });

    // Sales (OUT)
    // Sales store 'productName' string. We try to match with material to get Unit.
    // If no match, default to 'kg' or empty.
    const materialMap = new Map(materials.map(m => [m.name, m]));

    sales.forEach(s => {
        if (itemName && s.productName !== itemName) return;
        const mat = materialMap.get(s.productName);
        transactions.push({
            id: `S-${s.id}`,
            date: s.saleDate,
            type: 'SALE',
            item: s.productName,
            quantity: s.weight, // This is OUT, but we display positive in list, color it red? or show negative? Usually reports show positive "Qty" but type implies direction.
            value: s.price,
            unit: mat?.unit || 'kg',
            detail: `Customer: ${s.customer?.name || (s.customerId ? 'ID ' + s.customerId : 'N/A')}`
        });
    });

    // Adjustments (IN or OUT)
    adjustments.forEach(a => {
        if (itemName && a.material.name !== itemName) return;
        transactions.push({
            id: `A-${a.id}`,
            date: a.date,
            type: 'ADJUST',
            item: a.material.name,
            quantity: a.quantity, // Can be negative
            unit: a.material.unit,
            detail: a.reason
        });
    });

    // Sort Descending
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    // 3. Summaries (Recalculate based on filtered transactions)
    // Note: Can't simply sum quantities because units differ (bags vs kg).
    // So we summary by "Count of Transactions" or "Value" if we had it.
    // User requested "Summary card etc buy, sale, adjust, current stock"
    // "Current Stock" is easy (fetched from materials).
    // "Buy/Sale" - probably they want Volume or Count? Let's show Transaction Counts for now, or maybe Total items moved?

    // Helper to sum
    const sumQty = (type: string) => transactions
        .filter(t => t.type === type)
        .reduce((acc, curr) => acc + (curr.quantity || 0), 0);

    const sumValue = (type: string) => transactions
        .filter(t => t.type === type)
        .reduce((acc, curr) => acc + (curr.value || 0), 0);

    const summary = {
        buyCount: transactions.filter(t => t.type === 'BUY').length,
        buyQty: itemName ? sumQty('BUY') : null,
        buyValue: sumValue('BUY'),

        saleCount: transactions.filter(t => t.type === 'SALE').length,
        saleQty: itemName ? sumQty('SALE') : null,
        saleValue: sumValue('SALE'),

        harvestCount: transactions.filter(t => t.type === 'HARVEST').length,
        harvestQty: itemName ? sumQty('HARVEST') : null,

    };

    // Filter count logic
    // Actually, summary cards might be misleading if we filter by Item Name but show total count of that Item's transactions.
    // The previous logic counted distinct DB records. Here we count Normalized transactions.
    // Normalized is fine.

    const materialNames = materials.map(m => m.name);

    // Format for initial input values
    const initialStartDate = format(startDate, 'yyyy-MM-dd');
    const initialEndDate = format(endDate, 'yyyy-MM-dd');

    return (
        <div className="w-full pb-10 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold dark:text-gray-200">Inventory Movement</h2>
            </div>

            <InventoryReportFilters
                materialNames={materialNames}
                initialStartDate={initialStartDate}
                initialEndDate={initialEndDate}
            />

            {/* Summaries */}
            <div className="grid gap-4 md:grid-cols-4">
                {/* BUY Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Transactions (Buy)</h3>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-blue-600">{summary.buyCount}</span>
                        <div className="text-sm text-gray-500 mt-1 flex justify-between">
                            {summary.buyQty !== null && <span>Qty: {formatNumber(summary.buyQty)}</span>}
                            <span>Val: ฿{formatNumber(summary.buyValue)}</span>
                        </div>
                    </div>
                </div>

                {/* SALE Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Transactions (Sale)</h3>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-red-600">{summary.saleCount}</span>
                        <div className="text-sm text-gray-500 mt-1 flex justify-between">
                            {summary.saleQty !== null && <span>Qty: {formatNumber(summary.saleQty)}</span>}
                            <span>Val: ฿{formatNumber(summary.saleValue)}</span>
                        </div>
                    </div>
                </div>

                {/* HARVEST Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Harvest Batches</h3>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-green-600">{summary.harvestCount}</span>
                        <div className="text-sm text-gray-500 mt-1">
                            {summary.harvestQty !== null && <span>Qty: {formatNumber(summary.harvestQty)}</span>}
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Filtered SKUs</h3>
                    <p className="text-2xl font-bold">{itemName ? 1 : materials.length}</p>
                </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="font-semibold text-lg dark:text-gray-100">Transaction History</h2>
                </div>
                <div className="overflow-auto max-h-[70vh]">
                    <table className="min-w-full text-left text-sm relative">
                        <thead className="sticky top-0 z-10 shadow-sm">
                            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-6 py-3 font-semibold text-gray-900 dark:text-gray-300">Date & Time</th>
                                <th className="px-6 py-3 font-semibold text-gray-900 dark:text-gray-300">Type</th>
                                <th className="px-6 py-3 font-semibold text-gray-900 dark:text-gray-300">Item</th>
                                <th className="px-6 py-3 font-semibold text-right text-gray-900 dark:text-gray-300">Quantity</th>
                                <th className="px-6 py-3 font-semibold text-gray-900 dark:text-gray-300">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No transactions found matching criteria.</td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            {format(t.date, 'dd/MM/yyyy HH:mm')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge type={t.type} />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">{t.item}</td>
                                        <td className={`px-6 py-4 text-right font-mono ${t.type === 'SALE' || (t.type === 'ADJUST' && t.quantity < 0)
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-green-600 dark:text-green-400'
                                            }`}>
                                            {t.type === 'SALE' ? '-' : (t.type === 'ADJUST' && t.quantity < 0 ? '' : '+')}
                                            {formatNumber(Math.abs(t.quantity))} {t.unit}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate" title={t.detail}>
                                            {t.detail}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Badge({ type }: { type: string }) {
    const styles = {
        BUY: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        SALE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        HARVEST: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        ADJUST: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    };
    // @ts-ignore
    const cn = styles[type] || 'bg-gray-100 text-gray-800';
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cn}`}>
            {type}
        </span>
    );
}
