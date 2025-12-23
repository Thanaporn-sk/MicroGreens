'use client';

import Link from 'next/link';
import { createPurchase } from '@/app/lib/actions';
import type { Material } from '@prisma/client';

export default function PurchaseForm({ materials }: { materials: Material[] }) {
    return (
        <form action={createPurchase} className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-lg">
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Material</label>
                <select
                    name="materialId"
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                    <option value="">Select a material</option>
                    {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name} ({m.unit})
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Quantity Purchased</label>
                <input
                    type="number"
                    step="0.01"
                    name="quantity"
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="0.00"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Total Cost</label>
                <div className="relative">
                    <span className="absolute left-2 top-2 text-gray-500 dark:text-gray-400">$</span>
                    <input
                        type="number"
                        step="0.01"
                        name="cost"
                        required
                        className="border border-gray-300 dark:border-gray-700 p-2 pl-6 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date</label>
                <input
                    type="date"
                    name="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
            </div>

            <div className="flex gap-2 mt-4">
                <Link
                    href="/purchases"
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center w-full"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors w-full"
                >
                    Save Purchase
                </button>
            </div>
        </form>
    );
}
