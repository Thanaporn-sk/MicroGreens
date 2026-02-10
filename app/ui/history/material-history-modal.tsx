'use client';

import { useEffect, useState } from 'react';
import Modal from '@/app/ui/modal';
import { getItemHistory, HistoryItem } from '@/app/lib/history-actions';
import { formatDate } from '@/app/lib/formatters';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

    // Pagination & Filter States
    const [page, setPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState('ALL');
    const itemsPerPage = 25;

    useEffect(() => {
        if (isOpen && materialId) {
            setLoading(true);
            getItemHistory(materialId)
                .then(data => setHistory(data.history))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen, materialId]);

    const filteredHistory = history.filter(item => {
        if (typeFilter === 'ALL') return true;
        return item.type === typeFilter;
    });

    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const paginatedHistory = filteredHistory.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const getRowStyle = (type: string) => {
        switch (type) {
            case 'PURCHASE':
            case 'HARVEST':
                return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 ring-green-600/20'; // Additions
            case 'SALE':
                return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 ring-red-600/20'; // Deductions
            case 'ADJUSTMENT':
                return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 ring-blue-600/20'; // Neutral/Mixed
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 ring-gray-500/10';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`History: ${materialName}`}>
            <div className="p-6">
                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : filteredHistory.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center">No history matching filter.</p>
                ) : (
                    <>
                        <div className="shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700 border-separate border-spacing-0">
                                <thead className="sticky top-0 z-10">
                                    <tr>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">Date</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                                            <div className="flex flex-col gap-1">
                                                <span>Type</span>
                                                <select
                                                    className="text-[10px] p-1 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={typeFilter}
                                                    onChange={(e) => {
                                                        setTypeFilter(e.target.value);
                                                        setPage(1);
                                                    }}
                                                >
                                                    <option value="ALL">All</option>
                                                    <option value="PURCHASE">Purchase</option>
                                                    <option value="SALE">Sale</option>
                                                    <option value="HARVEST">Harvest</option>
                                                    <option value="ADJUSTMENT">Adjustment</option>
                                                </select>
                                            </div>
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">Quantity</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                    {paginatedHistory.map((item) => (
                                        <tr key={item.id}>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(item.date)}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getRowStyle(item.type)}`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className={`whitespace-nowrap px-3 py-4 text-sm ${item.quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {item.quantity > 0 ? '+' : ''}{item.quantity.toFixed(2)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{item.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, filteredHistory.length)} of {filteredHistory.length}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-1 px-2 border rounded text-xs disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                                    >
                                        <ChevronLeft className="w-3 h-3" /> Prev
                                    </button>
                                    <span className="text-xs self-center text-gray-600 dark:text-gray-400">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-1 px-2 border rounded text-xs disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                                    >
                                        Next <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
}
