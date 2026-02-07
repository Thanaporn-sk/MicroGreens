'use client';

import { formatDate } from '@/app/lib/formatters';

type LotDetails = {
    plantingDate: Date;
    expectedHarvestDate: Date | null;
    trayCount: number;
    seedUsed: number;
    notes: string | null;
    totalYield: number; // Total weight in kg
    yield: number; // Efficiency in kg/tray
};

export function LotDetailCard({ lot }: { lot: LotDetails }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Planting Details</h2>
            <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="text-gray-600 dark:text-gray-400">Planted Date</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{formatDate(lot.plantingDate)}</span>
                </div>
                {lot.expectedHarvestDate && (
                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                        <span className="text-gray-600 dark:text-gray-400">Expected Harvest</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">{formatDate(lot.expectedHarvestDate)}</span>
                    </div>
                )}
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="text-gray-600 dark:text-gray-400">Tray Count</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{lot.trayCount}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Seed Used</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{lot.seedUsed} units</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Harvest Qty</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{lot.totalYield} kg</span>
                </div>
                <div className="flex justify-between pb-2">
                    <span className="text-gray-600 dark:text-gray-400">Yield (Avg)</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{lot.yield} kg/tray</span>
                </div>
                {lot.notes && (
                    <div className="pt-2">
                        <span className="text-gray-600 dark:text-gray-400 block mb-1 text-sm">Notes</span>
                        <p className="text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">{lot.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
