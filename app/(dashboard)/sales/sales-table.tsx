'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import DeleteButton from '@/app/ui/delete-button';
import { deleteSale } from '@/app/lib/actions';
import { formatDate } from '@/app/lib/formatters';
import CustomerHistoryModal from '@/app/ui/history/customer-history-modal';
import ProductHistoryModal from '@/app/ui/history/product-history-modal';
import SortableHeader from '@/app/ui/sortable-header';

type SaleWithCustomer = {
    id: number;
    saleDate: Date;
    productName: string;
    weight: number;
    price: number;
    customer: {
        id: number;
        name: string;
    } | null;
};

export default function SalesTable({ sales }: { sales: SaleWithCustomer[] }) {
    const [historyCustomer, setHistoryCustomer] = useState<{ id: number, name: string } | null>(null);
    const [historyProduct, setHistoryProduct] = useState<string | null>(null);

    return (
        <>
            <div className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <SortableHeader label="Date" value="saleDate" />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <SortableHeader label="Customer" value="customer" />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <SortableHeader label="Product" value="productName" />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <SortableHeader label="Weight" value="weight" />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <SortableHeader label="Price" value="price" />
                            </th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {sales.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No sales recorded.</td>
                            </tr>
                        ) : (
                            sales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{formatDate(sale.saleDate)}</td>
                                    <td
                                        className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-cyan-400 cursor-pointer hover:underline"
                                        onClick={() => sale.customer && setHistoryCustomer({ id: sale.customer.id, name: sale.customer.name })}
                                        title={sale.customer ? "View Customer History" : ""}
                                    >
                                        {sale.customer?.name || 'Unknown'}
                                    </td>
                                    <td
                                        className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-cyan-400 cursor-pointer hover:underline"
                                        onClick={() => setHistoryProduct(sale.productName)}
                                        title="View Product Sales History"
                                    >
                                        {sale.productName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sale.weight.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">${sale.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                        <Link href={`/sales/${sale.id}/edit`} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1">
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <DeleteButton id={sale.id} deleteAction={deleteSale} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {historyCustomer && (
                <CustomerHistoryModal
                    isOpen={!!historyCustomer}
                    onClose={() => setHistoryCustomer(null)}
                    customerId={historyCustomer.id}
                    customerName={historyCustomer.name}
                />
            )}

            {historyProduct && (
                <ProductHistoryModal
                    isOpen={!!historyProduct}
                    onClose={() => setHistoryProduct(null)}
                    productName={historyProduct}
                />
            )}
        </>
    );
}
