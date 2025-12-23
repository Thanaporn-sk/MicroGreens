import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Package, ShoppingCart, Sprout, Users } from 'lucide-react';
import { formatDate } from '@/app/lib/formatters';

export default async function DashboardPage() {
    const session = await auth();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
        materialsCount,
        salesCount,
        activeLotsCount,
        customersCount,
        lowStockMaterials,
        recentActivity,
        salesLast7Days
    ] = await Promise.all([
        prisma.material.count(),
        prisma.sale.count(),
        prisma.plantingLot.count({ where: { harvests: { none: {} } } }),
        prisma.customer.count(),
        prisma.stock.findMany({
            where: { quantity: { lte: 10 } },
            include: { material: true },
            orderBy: { quantity: 'asc' },
            take: 5
        }),
        prisma.activityLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        }),
        prisma.sale.findMany({
            where: { saleDate: { gte: sevenDaysAgo } },
            select: { saleDate: true, price: true }
        })
    ]);

    // Process Sales Data for Chart
    const chartData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        return {
            date: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dateFull: dateStr,
            amount: 0
        };
    });

    salesLast7Days.forEach(sale => {
        const dateStr = sale.saleDate.toISOString().split('T')[0];
        const day = chartData.find(d => d.dateFull === dateStr);
        if (day) day.amount += sale.price;
    });

    const maxSales = Math.max(...chartData.map(d => d.amount), 1); // Avoid div by 0

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                <p className="mb-6 text-gray-600">Welcome back, <span className="font-semibold text-gray-900">{session?.user?.name || session?.user?.email}</span></p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card title="Total Materials" value={materialsCount} icon={<Package className="h-6 w-6 text-blue-500" />} />
                    <Card title="Total Sales" value={salesCount} icon={<ShoppingCart className="h-6 w-6 text-green-500" />} />
                    <Card title="Active Lots" value={activeLotsCount} icon={<Sprout className="h-6 w-6 text-emerald-600" />} />
                    <Card title="Customers" value={customersCount} icon={<Users className="h-6 w-6 text-purple-500" />} />
                </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4">Sales Trend (Last 7 Days)</h2>
                <div className="h-64 flex items-end justify-between gap-2">
                    {chartData.map((day) => (
                        <div key={day.date} className="flex flex-col items-center gap-2 w-full group">
                            <div className="relative w-full flex items-end justify-center h-48 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg overflow-hidden group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
                                <div
                                    className="w-full bg-green-500 opacity-80 group-hover:opacity-100 transition-opacity rounded-t-sm"
                                    style={{ height: `${(day.amount / maxSales) * 100}%` }}
                                ></div>
                                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 text-xs font-bold text-gray-700 dark:text-gray-200 transition-opacity">
                                    ฿{day.amount.toLocaleString()}
                                </div>
                            </div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{day.date}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Low Stock Warnings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Low Stock Alerts</h2>
                        <span className="text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
                            {lowStockMaterials.length} Items
                        </span>
                    </div>
                    <div className="p-0">
                        {lowStockMaterials.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 dark:text-gray-400">All stocks are healthy</div>
                        ) : (
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Material</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 text-right">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {lowStockMaterials.map((stock) => (
                                        <tr key={stock.id}>
                                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-200">{stock.material.name}</td>
                                            <td className="px-6 py-3 text-right text-red-600 dark:text-red-400 font-bold">{stock.quantity.toFixed(2)} {stock.material.unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Recent Activity</h2>
                    </div>
                    <div className="p-0">
                        {recentActivity.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 dark:text-gray-400">No recent activity</div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentActivity.map((log) => (
                                    <div key={log.id} className="px-6 py-3 flex flex-col gap-1">
                                        <div className="flex justify-between items-start">
                                            <span className="font-medium text-gray-900 dark:text-gray-200 text-sm">{log.action}</span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {formatDate(log.createdAt)} {log.createdAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{log.detail}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Card({ title, value, icon }: { title: string; value: number; icon?: React.ReactNode }) {
    return (
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</p>
            </div>
            {icon && <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-full">{icon}</div>}
        </div>
    );
}
