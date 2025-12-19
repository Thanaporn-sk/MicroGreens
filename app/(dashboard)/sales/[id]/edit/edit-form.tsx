'use client';

import Link from 'next/link';
import { updateSale } from '@/app/lib/actions';
import type { Sale } from '@prisma/client';

export default function EditSaleForm({ sale }: { sale: Sale }) {
    const updateSaleWithId = updateSale.bind(null, sale.id);

    return (
        <form action={updateSaleWithId} className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-sm border max-w-lg">
            <div className="text-sm text-gray-500 mb-2">
                Editing Sale for <strong>{sale.productName}</strong>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Weight Sold</label>
                <p className="text-xs text-yellow-600 mb-2">Changing quantity will automatically adjust current stock.</p>
                <input
                    type="number"
                    step="0.01"
                    name="weight"
                    defaultValue={sale.weight}
                    required
                    className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Total Price</label>
                <div className="relative">
                    <span className="absolute left-2 top-2 text-gray-500">$</span>
                    <input
                        type="number"
                        step="0.01"
                        name="price"
                        defaultValue={sale.price}
                        required
                        className="border border-gray-300 p-2 pl-6 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Sale Date</label>
                <input
                    type="date"
                    name="saleDate"
                    required
                    defaultValue={sale.saleDate.toISOString().split('T')[0]}
                    className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div className="flex gap-2 mt-4">
                <Link
                    href="/sales"
                    className="bg-gray-100 text-gray-700 p-2 rounded hover:bg-gray-200 transition-colors text-center w-full"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors w-full"
                >
                    Update Sale
                </button>
            </div>
        </form>
    );
}
