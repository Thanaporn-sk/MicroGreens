'use client';

import { useEffect, useState } from 'react';
import Modal from '@/app/ui/modal';
import { getProductSalesHistory } from '@/app/lib/history-actions';
import { formatDate } from '@/app/lib/formatters';

interface Sale {
    id: number;
    saleDate: Date;
    customer: { name: string } | null;
    weight: number;
    price: number;
}

export default function ProductHistoryModal({
    isOpen,
    onClose,
    productName
}: {
    isOpen: boolean;
    onClose: () => void;
    productName: string | null;
}) {
    const [history, setHistory] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && productName) {
            setLoading(true);
            getProductSalesHistory(productName)
                .then(setHistory)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen, productName]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Sales History: ${productName}`}>
            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : history.length === 0 ? (
                <p className="text-gray-500 text-center">No sales history found.</p>
            ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Weight</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {history.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{formatDate(item.saleDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{item.customer?.name || 'Unknown'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.weight.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">${item.price.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </Modal>
    );
}
