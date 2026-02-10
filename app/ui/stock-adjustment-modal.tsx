'use client';

import { useState } from 'react';
import { adjustStock } from '@/app/lib/actions';
import Modal from '@/app/ui/modal';

export default function StockAdjustmentModal({
    isOpen,
    onClose,
    materialId,
    materialName,
    currentStock,
    unit
}: {
    isOpen: boolean;
    onClose: () => void;
    materialId: number;
    materialName: string;
    currentStock: number;
    unit: string;
}) {
    const [adjustment, setAdjustment] = useState<string>('');
    const [reason, setReason] = useState('Manual Correction');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const val = parseFloat(adjustment);
            if (!isNaN(val) && val !== 0) {
                await adjustStock(materialId, val, reason);
                onClose();
                setAdjustment('');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to update stock');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Adjust Stock: ${materialName}`}>
            <div className="p-6 space-y-6">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Current Stock: <span className="font-bold text-gray-900 dark:text-white">{currentStock.toFixed(2)} {unit}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Adjustment Amount (+/-)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={adjustment}
                                onChange={(e) => setAdjustment(e.target.value)}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                placeholder="-5.5 or 10"
                            />
                            <span className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">{unit}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use negative values to deduct stock (e.g. -5).</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Reason
                        </label>
                        <input
                            type="text"
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            placeholder="e.g. Usage, Spoilage, Correction"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Adjustment'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
