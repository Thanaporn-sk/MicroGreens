'use client';

import Link from 'next/link';
import { createPlantingLot } from '@/app/lib/actions';
import { SubmitButton } from '@/app/ui/submit-button';
import { getLocalISODate } from '@/app/lib/formatters';
import type { Material } from '@prisma/client';

export default function LotForm({ materials }: { materials: Material[] }) {
    return (
        <form action={createPlantingLot} className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-lg">
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Lot Code</label>
                <input
                    name="lotCode"
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="e.g. LOT-2023-001"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Crop Type</label>
                <input
                    name="cropType"
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="e.g. Sunflower"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Seed Material (Deduct from Stock)</label>
                <select
                    name="seedMaterialId"
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                    <option value="">Select Seed</option>
                    {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name} ({m.unit})
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Seed Amount Used</label>
                <input
                    type="number"
                    step="0.01"
                    name="seedAmount"
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="0.00"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Number of Trays</label>
                <input
                    type="number"
                    name="trayCount"
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="0"
                />
            </div>

            <div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Planting Date</label>
                    <input
                        type="date"
                        name="plantingDate"
                        defaultValue={getLocalISODate()}
                        required
                        className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Expected Harvest Date (Optional)</label>
                    <input
                        type="date"
                        name="expectedHarvestDate"
                        className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Notes (Optional)</label>
                <textarea
                    name="notes"
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
                    Create Lot
                </SubmitButton>
            </div>
        </form>
    );
}
