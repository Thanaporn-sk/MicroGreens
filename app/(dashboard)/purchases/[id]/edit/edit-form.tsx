'use client';

import Link from 'next/link';
import { updatePurchase } from '@/app/lib/actions';
import type { Purchase, Material } from '@prisma/client';

export default function EditPurchaseForm({ purchase, material }: { purchase: Purchase, material: Material }) {
    const updatePurchaseWithId = updatePurchase.bind(null, purchase.id);

    return (
        <form action={updatePurchaseWithId} className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-sm border max-w-lg">
            <div className="text-sm text-gray-500 mb-2">
                Editing Purchase for <strong>{material.name}</strong>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Quantity Purchased ({material.unit})</label>
                <p className="text-xs text-yellow-600 mb-2">Changing quantity will automatically adjust current stock.</p>
                <input
                    type="number"
                    step="0.01"
                    name="quantity"
                    defaultValue={purchase.quantity}
                    required
                    className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Total Cost</label>
                <div className="relative">
                    <span className="absolute left-2 top-2 text-gray-500">$</span>
                    <input
                        type="number"
                        step="0.01"
                        name="cost"
                        defaultValue={purchase.cost || 0}
                        required
                        className="border border-gray-300 p-2 pl-6 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
                <input
                    type="date"
                    name="date"
                    required
                    defaultValue={purchase.date.toISOString().split('T')[0]}
                    className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div className="flex gap-2 mt-4">
                <Link
                    href="/purchases"
                    className="bg-gray-100 text-gray-700 p-2 rounded hover:bg-gray-200 transition-colors text-center w-full"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors w-full"
                >
                    Update Purchase
                </button>
            </div>
        </form>
    );
}
