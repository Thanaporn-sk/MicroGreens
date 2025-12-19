import { prisma } from '@/lib/prisma';
import DateFilter from './date-filter';

// Helper for formatting currency if utils doesn't exist
const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
    }).format(amount);
};

export default async function ReportsPage({
    searchParams,
}: {
    searchParams?: Promise<{
        startDate?: string;
        endDate?: string;
    }>;
}) {
    // Await searchParams as required in Next.js 15+ (though this is 14/15 env, safer to await or treat as promise in newer generic types, but usually it's just props in 14. Standardizing on props access)
    // Actually in Next 15 searchParams is a promise, in 14 it's an object. The type assumes Next 15 style but let's just access it safely.

    // In strict Next.js 15 types, we await. In 14 we dont.
    // Let's assume standard access for now, but handle potential promise.
    const params = await searchParams;
    const startDate = params?.startDate ? new Date(params.startDate) : new Date(new Date().getFullYear(), 0, 1); // Default to start of year
    const endDate = params?.endDate ? new Date(params.endDate) : new Date();

    // Adjust endDate to end of day
    const endDateAdjusted = new Date(endDate);
    endDateAdjusted.setHours(23, 59, 59, 999);

    const [sales, purchases, stocks, customers] = await Promise.all([
        prisma.sale.findMany({
            where: {
                saleDate: {
                    gte: startDate,
                    lte: endDateAdjusted,
                },
            },
            orderBy: { saleDate: 'desc' },
        }),
        prisma.purchase.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDateAdjusted, // Use adjusted end date for consistency
                },
            },
            include: {
                material: true
            }
        }),
        prisma.stock.findMany({
            include: {
                material: true
            }
        }),
        prisma.customer.findMany({
            include: {
                sales: true
            }
        })
    ]);

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.price, 0);
    const totalExpenses = purchases.reduce((sum, p) => sum + (p.cost || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    // --- Sales by Product ---
    const salesByProduct = sales.reduce((acc, sale) => {
        if (!acc[sale.productName]) {
            acc[sale.productName] = { weight: 0, amount: 0, count: 0 };
        }
        acc[sale.productName].weight += sale.weight;
        acc[sale.productName].amount += sale.price;
        acc[sale.productName].count += 1;
        return acc;
    }, {} as Record<string, { weight: number; amount: number; count: number }>);

    const productSummary = Object.entries(salesByProduct)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.amount - a.amount);

    // --- Yield Analysis ---
    const harvestedLots = await prisma.plantingLot.findMany({
        where: {
            harvests: {
                some: {
                    harvestDate: {
                        gte: startDate,
                        lte: endDateAdjusted,
                    }
                }
            }
        },
        include: {
            harvests: true
        }
    });

    const yieldByCrop = harvestedLots.reduce((acc, lot) => {
        if (!acc[lot.cropType]) {
            acc[lot.cropType] = { seedUsed: 0, harvestWeight: 0, lotCount: 0 };
        }
        const totalHarvestWeight = lot.harvests.reduce((sum, h) => sum + h.weight, 0);

        acc[lot.cropType].seedUsed += lot.seedUsed;
        acc[lot.cropType].harvestWeight += totalHarvestWeight;
        acc[lot.cropType].lotCount += 1;
        return acc;
    }, {} as Record<string, { seedUsed: number; harvestWeight: number; lotCount: number }>);

    const yieldSummary = Object.entries(yieldByCrop)
        .map(([name, data]) => ({
            name,
            ...data,
            ratio: data.seedUsed > 0 ? data.harvestWeight / data.seedUsed : 0
        }))
        .sort((a, b) => b.ratio - a.ratio);


    // --- Cost Analysis (Purchases by Material) ---
    const expensesByMaterial = purchases.reduce((acc, purchase) => {
        const name = purchase.material.name;
        if (!acc[name]) {
            acc[name] = { amount: 0 };
        }
        acc[name].amount += (purchase.cost || 0);
        return acc;
    }, {} as Record<string, { amount: number }>);

    const expenseSummary = Object.entries(expensesByMaterial)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.amount - a.amount);

    // --- Customer Ranking ---
    // Note: This ranks based on ALL TIME sales if we use `include: sales`. 
    // If we want period sales, we should filter. 
    // But `include` filter in Prisma is tricky if we want `count` of sales in period.
    // Easier to aggregate from the `sales` array we already fetched, if `sales` has customerId?
    // Wait, `Sale` model has `customerId`.
    // Let's use the fetched `sales` (which is filtered by date) to aggregate customer spending.
    // But we need Customer Name. `Sale` model probably has `customerId` but we need to join or lookup.
    // Let's just create a lookup map from `customers` array.

    const customerMap = new Map(customers.map(c => [c.id, c.name]));

    const salesByCustomer = sales.reduce((acc, sale) => {
        if (!sale.customerId) return acc;
        const name = customerMap.get(sale.customerId) || 'Unknown';
        if (!acc[name]) {
            acc[name] = { amount: 0, count: 0 };
        }
        acc[name].amount += sale.price;
        acc[name].count += 1;
        return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    const customerSummary = Object.entries(salesByCustomer)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10); // Top 10

    // --- Inventory Valuation ---
    // We need average cost per unit for each material to calculate valuation.
    // This is complex. Simplification needed: Use *latest* purchase cost or *average* of fetched purchases.
    // If no purchases found in period, we might miss cost data. 
    // Let's fetch ALL purchases for cost calculation (might be heavy) or just fetch Materials with purchases relation?
    // Let's rely on `purchases` fetched (in period) for now? No, that's inaccurate if stock is old.
    // Improve: Fetch Latest Purchase for each Material to get current market price.
    // Let's add a separate query for latest purchases for all materials.
    const latestPurchases = await prisma.purchase.findMany({
        distinct: ['materialId'],
        orderBy: { date: 'desc' },
        select: { materialId: true, cost: true, quantity: true } // calculate unit cost
    });

    const materialUnitCost = new Map();
    latestPurchases.forEach(p => {
        if (p.cost && p.quantity > 0) {
            materialUnitCost.set(p.materialId, p.cost / p.quantity);
        }
    });

    const inventoryValuation = stocks.map(stock => {
        const unitCost = materialUnitCost.get(stock.materialId) || 0;
        return {
            name: stock.material.name,
            quantity: stock.quantity,
            unit: stock.material.unit,
            unitCost,
            value: stock.quantity * unitCost
        };
    }).sort((a, b) => b.value - a.value);

    const totalInventoryValue = inventoryValuation.reduce((sum, item) => sum + item.value, 0);


    return (
        <div className="w-full pb-10 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Financial Reports</h1>
            </div>

            <DateFilter />

            {/* High Level Summary */}
            <div className="grid gap-4 md:grid-cols-4">
                <SummaryCard title="Total Revenue" value={totalRevenue} type="success" />
                <SummaryCard title="Total Expenses" value={totalExpenses} type="danger" />
                <SummaryCard title="Net Profit" value={netProfit} type={netProfit >= 0 ? "success" : "danger"} />
                <SummaryCard title="Inventory Value" value={totalInventoryValue} type="neutral" />
            </div>

            {/* Row 1: Sales & Expenses */}
            <div className="grid gap-8 md:grid-cols-2">
                {/* Product Sales Summary */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="font-semibold text-lg">Sales by Product</h2>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-4 py-2 font-semibold">Product</th>
                                    <th className="px-4 py-2 font-semibold text-right">Weight</th>
                                    <th className="px-4 py-2 font-semibold text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productSummary.length === 0 ? (
                                    <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-500">No data</td></tr>
                                ) : (
                                    productSummary.map((item) => (
                                        <tr key={item.name} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium">{item.name}</td>
                                            <td className="px-4 py-2 text-right">{item.weight.toFixed(1)}</td>
                                            <td className="px-4 py-2 text-right">{formatMoney(item.amount)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Expenses by Material */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="font-semibold text-lg">Expenses by Material</h2>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-4 py-2 font-semibold">Material</th>
                                    <th className="px-4 py-2 font-semibold text-right">Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenseSummary.length === 0 ? (
                                    <tr><td colSpan={2} className="px-4 py-4 text-center text-gray-500">No data</td></tr>
                                ) : (
                                    expenseSummary.map((item) => (
                                        <tr key={item.name} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium">{item.name}</td>
                                            <td className="px-4 py-2 text-right">{formatMoney(item.amount)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Row 2: Yield & Customers */}
            <div className="grid gap-8 md:grid-cols-2">
                {/* Yield Efficiency */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="font-semibold text-lg">Yield Efficiency</h2>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-4 py-2 font-semibold">Crop</th>
                                    <th className="px-4 py-2 font-semibold text-right">Input (g)</th>
                                    <th className="px-4 py-2 font-semibold text-right">Output (g)</th>
                                    <th className="px-4 py-2 font-semibold text-right">Ratio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {yieldSummary.length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-500">No harvest data</td></tr>
                                ) : (
                                    yieldSummary.map((item) => (
                                        <tr key={item.name} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium">{item.name}</td>
                                            <td className="px-4 py-2 text-right">{item.seedUsed}</td>
                                            <td className="px-4 py-2 text-right">{item.harvestWeight}</td>
                                            <td className="px-4 py-2 text-right font-bold text-blue-600">
                                                1 : {item.ratio.toFixed(1)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Customers */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="font-semibold text-lg">Top Customers</h2>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-4 py-2 font-semibold">Customer</th>
                                    <th className="px-4 py-2 font-semibold text-right">Orders</th>
                                    <th className="px-4 py-2 font-semibold text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customerSummary.length === 0 ? (
                                    <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-500">No data</td></tr>
                                ) : (
                                    customerSummary.map((item) => (
                                        <tr key={item.name} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium">{item.name}</td>
                                            <td className="px-4 py-2 text-right">{item.count}</td>
                                            <td className="px-4 py-2 text-right">{formatMoney(item.amount)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Inventory Valuation Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-lg">Inventory Valuation (Current Assets)</h2>
                </div>
                <div className="p-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-4 py-2 font-semibold">Material</th>
                                <th className="px-4 py-2 font-semibold text-right">Stock</th>
                                <th className="px-4 py-2 font-semibold text-right">Est. Unit Cost</th>
                                <th className="px-4 py-2 font-semibold text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryValuation.length === 0 ? (
                                <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-500">No stock data</td></tr>
                            ) : (
                                inventoryValuation.map((item) => (
                                    <tr key={item.name} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium">{item.name}</td>
                                        <td className="px-4 py-2 text-right">{item.quantity.toFixed(1)} {item.unit}</td>
                                        <td className="px-4 py-2 text-right text-gray-500">{formatMoney(item.unitCost)}</td>
                                        <td className="px-4 py-2 text-right font-medium">{formatMoney(item.value)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 text-center mt-4">
                * Inventory Valuation based on latest purchase price per material.
            </p>

        </div>
    );
}

function SummaryCard({ title, value, type }: { title: string, value: number, type: 'success' | 'danger' | 'neutral' }) {
    const colorClass = type === 'success' ? 'text-green-600' : type === 'danger' ? 'text-red-600' : 'text-gray-900';
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
            <p className={`text-2xl font-bold ${colorClass}`}>
                {formatMoney(value)}
            </p>
        </div>
    );
}
