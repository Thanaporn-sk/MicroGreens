'use client';

import Link from 'next/link';
import { updatePlantingLot } from '@/app/lib/actions';
import { SubmitButton } from '@/app/ui/submit-button';
import type { PlantingLot } from '@prisma/client';

export default function EditLotForm({ lot }: { lot: PlantingLot }) {
    const updateWithId = updatePlantingLot.bind(null, lot.id);

    return (
        <form action={updateWithId} className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-lg">
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Lot Code</label>
                <input
                    name="lotCode"
                    defaultValue={lot.lotCode}
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="e.g. LOT-2023-001"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Crop Type</label>
                <input
                    name="cropType"
                    defaultValue={lot.cropType}
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="e.g. Sunflower"
                />
            </div>

            {/* Seed Info Display Only - Editing complicated due to stock */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-sm text-gray-600 dark:text-gray-300 border dark:border-gray-600">
                <p><strong>Seed Used:</strong> {lot.seedUsed} (Cannot be changed)</p>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Number of Trays</label>
                <input
                    type="number"
                    name="trayCount"
                    defaultValue={lot.trayCount}
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="0"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                <select
                    name="status"
                    defaultValue={lot.status}
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                    <option value="PLANTED">PLANTED</option>
                    <option value="GROWING">GROWING</option>
                    <option value="HARVESTING">HARVESTING</option>
                    <option value="COMPLETED">COMPLETED</option>
                </select>
            </div>

            <div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Planting Date</label>
                    <input
                        type="date"
                        name="plantingDate"
                        defaultValue={new Date(lot.plantingDate).toISOString().split('T')[0]}
                        required
                        className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Expected Harvest Date (Optional)</label>
                    <input
                        type="date"
                        name="expectedHarvestDate"
                        defaultValue={lot.expectedHarvestDate ? new Date(lot.expectedHarvestDate).toISOString().split('T')[0] : ''}
                        className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Notes (Optional)</label>
                <textarea
                    name="notes"
                    defaultValue={lot.notes || ''}
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Substrate used, special conditions..."
                />
            </div>



            <div className="flex gap-2 mt-4">
                <Link
                    href="/lots"
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center w-full"
                >
                    Cancel
                </Link>
                <SubmitButton
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors w-full"
                >
                    Update Lot
                </SubmitButton>
            </div>
        </form>
    );
}
