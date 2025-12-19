'use client';

import { useEffect, useState } from 'react';
import Modal from '@/app/ui/modal';
import { getItemHistory, HistoryItem } from '@/app/lib/history-actions';
import { formatDate } from '@/app/lib/formatters';

export default function MaterialHistoryModal({
    isOpen,
    onClose,
    materialId,
    materialName
}: {
    isOpen: boolean;
    onClose: () => void;
    materialId: number | null;
    materialName: string;
}) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && materialId) {
            setLoading(true);
            getItemHistory(materialId)
                .then(data => setHistory(data.history))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen, materialId]);

    const getRowStyle = (type: string) => {
        switch (type) {
            case 'PURCHASE':
            case 'HARVEST':
                return 'text-green-600 bg-green-50'; // Additions
            case 'SALE':
                return 'text-red-600 bg-red-50'; // Deductions
            case 'ADJUSTMENT':
                return 'text-blue-600 bg-blue-50'; // Neutral/Mixed
            default:
                return '';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`History: ${materialName}`}>
            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : history.length === 0 ? (
                <p className="text-gray-500 text-center">No history found.</p>
            ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {history.map((item) => (
                                <tr key={item.id}>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(item.date)}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getRowStyle(item.type)}`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className={`whitespace-nowrap px-3 py-4 text-sm ${item.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.quantity > 0 ? '+' : ''}{item.quantity.toFixed(2)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Modal>
    );
}
