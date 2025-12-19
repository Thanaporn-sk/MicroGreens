'use client';

import { useState } from 'react';
import { adjustStock } from '@/app/lib/actions';
import { X } from 'lucide-react';

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

    if (!isOpen) return null;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-4">Adjust Stock: {materialName}</h2>

                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">Current Stock: <span className="font-bold text-gray-900">{currentStock} {unit}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adjustment Amount (+/-)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={adjustment}
                                onChange={(e) => setAdjustment(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                placeholder="-5.5 or 10"
                            />
                            <span className="text-gray-500 text-sm">{unit}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Use negative values to deduct stock (e.g. -5).</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason
                        </label>
                        <input
                            type="text"
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            placeholder="e.g. Usage, Spoilage, Correction"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Adjustment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
