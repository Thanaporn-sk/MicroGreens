'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Modal from '@/app/ui/modal';
import { getItemHistory, HistoryItem } from '@/app/lib/history-actions';
import { formatDate } from '@/app/lib/formatters';

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
    const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && material && activeTab === 'history') {
            setLoadingHistory(true);
            getItemHistory(material.id)
                .then(data => setHistory(data.history))
                .catch(console.error)
                .finally(() => setLoadingHistory(false));
        }
    }, [isOpen, material, activeTab]);

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
                <div className="border-b border-gray-200 dark:border-gray-700 mb-4 transition-colors">
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

                {activeTab === 'details' ? (
                    <div className="space-y-4">
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
                    <div>
                        {loadingHistory ? (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading history...</div>
                        ) : history.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No history records found.</p>
                        ) : (
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th>
                                            <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</th>
                                            <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Qty</th>
                                            <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                        {history.map((item) => (
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
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
