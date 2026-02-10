'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/app/ui/modal';
import { getItemHistory, HistoryItem, deleteAdjustment } from '@/app/lib/history-actions';
import { formatDate } from '@/app/lib/formatters';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

type MaterialDetail = {
    id: number;
    name: string;
    unit: string;
    description: string | null;
    images: { url: string }[];
    stock: { quantity: number } | null;
};

export default function MaterialDetailModal({
    isOpen,
    onClose,
    material
}: {
    isOpen: boolean;
    onClose: () => void;
    material: MaterialDetail | null;
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Pagination & Filter States
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('ALL');
    const itemsPerPage = 25;

    useEffect(() => {
        let ignore = false;
        if (isOpen && material && activeTab === 'history') {
            const startFetch = async () => {
                setLoadingHistory(true);
                try {
                    const data = await getItemHistory(material.id);
                    if (!ignore) {
                        setHistory(data.history);
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    if (!ignore) {
                        setLoadingHistory(false);
                    }
                }
            };
            startFetch();
        }
        return () => {
            ignore = true;
        };
    }, [isOpen, material, activeTab]);

    const fetchHistory = useCallback(async () => {
        if (material) {
            setLoadingHistory(true);
            try {
                const data = await getItemHistory(material.id);
                setHistory(data.history);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingHistory(false);
            }
        }
    }, [material]);

    const handleDeleteAdjustment = async (compositeId: string) => {
        if (!confirm('Are you sure you want to delete this adjustment? This will also update the current stock.')) {
            return;
        }

        const id = parseInt(compositeId.replace('a-', ''));
        if (isNaN(id)) return;

        const result = await deleteAdjustment(id);
        if (result.success) {
            fetchHistory();
            router.refresh();
        } else {
            alert(result.error || 'Failed to delete adjustment');
        }
    };

    const filteredHistory = history.filter(item => {
        if (historyTypeFilter === 'ALL') return true;
        return item.type === historyTypeFilter;
    });

    const totalHistoryPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const paginatedHistory = filteredHistory.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage);

    if (!material) return null;

    const getRowStyle = (type: string) => {
        switch (type) {
            case 'PURCHASE':
            case 'HARVEST': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 ring-green-600/20';
            case 'SALE': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 ring-red-600/20';
            case 'ADJUSTMENT': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 ring-blue-600/20';
            default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 ring-gray-500/10';
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={`Material: ${material.name}`}>
                <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 px-6 pt-2 border-b border-gray-200 dark:border-gray-700 transition-colors">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'details'
                                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            Details
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'history'
                                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            History
                        </button>
                    </nav>
                </div>

                <div className="flex-1 min-h-0">

                    {activeTab === 'details' ? (
                        <div className="p-6 space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Stock</h4>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{material.stock?.quantity.toFixed(2)} {material.unit}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {material.description || 'No description provided.'}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Images</h4>
                                {material.images.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">No images uploaded.</p>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {material.images.map((img, idx) => (
                                            <div key={idx} className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setPreviewImage(img.url)}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={img.url}
                                                    alt={`${material.name} ${idx + 1}`}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 pt-0">
                            {loadingHistory ? (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading history...</div>
                            ) : filteredHistory.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No history records found.</p>
                            ) : (
                                <>
                                    <div className="shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 md:rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700 border-separate border-spacing-0">
                                            <thead className="sticky top-[56px] z-10">
                                                <tr>
                                                    <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700 whitespace-nowrap">Date</th>
                                                    <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700 whitespace-nowrap">
                                                        <div className="flex flex-col gap-1">
                                                            <span>Type</span>
                                                            <select
                                                                className="text-[10px] p-1 border rounded dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                value={historyTypeFilter}
                                                                onChange={(e) => {
                                                                    setHistoryTypeFilter(e.target.value);
                                                                    setHistoryPage(1);
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
                                                    <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700 whitespace-nowrap">Qty</th>
                                                    <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700 whitespace-nowrap">Details</th>
                                                    <th className="px-3 py-3.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700 whitespace-nowrap">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                                {paginatedHistory.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(item.date)}</td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getRowStyle(item.type)}`}>
                                                                {item.type}
                                                            </span>
                                                        </td>
                                                        <td className={`whitespace-nowrap px-3 py-4 text-sm font-medium ${item.quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            {item.quantity > 0 ? '+' : ''}{item.quantity.toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{item.details}</td>
                                                        <td className="px-3 py-4 text-sm text-right">
                                                            {item.type === 'ADJUSTMENT' && (
                                                                <button
                                                                    onClick={() => handleDeleteAdjustment(item.id)}
                                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                                    title="Delete Adjustment"
                                                                >
                                                                    <Trash2 className="w-4 h-4 ml-auto" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {totalHistoryPages > 1 && (
                                        <div className="flex items-center justify-between mt-4 px-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Showing {((historyPage - 1) * itemsPerPage) + 1} to {Math.min(historyPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length} records
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                                                    disabled={historyPage === 1}
                                                    className="p-1 px-2 border rounded text-xs disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                                                >
                                                    <ChevronLeft className="w-3 h-3" /> Prev
                                                </button>
                                                <span className="text-xs self-center text-gray-600 dark:text-gray-400">
                                                    Page {historyPage} of {totalHistoryPages}
                                                </span>
                                                <button
                                                    onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
                                                    disabled={historyPage === totalHistoryPages}
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
                    )}
                </div>
            </Modal>

            {/* Lightbox Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animation-fadeIn"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-5xl max-h-screen">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={previewImage}
                            alt="Full View"
                            className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
                        />
                        <button
                            className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2 hover:bg-gray-200 shadow-lg"
                            onClick={() => setPreviewImage(null)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
