'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { createSale, State } from '@/app/lib/actions';
import type { Customer, Material } from '@prisma/client';

type MaterialWithStock = Material & { stock: { quantity: number } | null };

const initialState: State = { message: null, errors: {} };

export default function SaleForm({ customers, materials }: { customers: Customer[], materials: MaterialWithStock[] }) {
    const [state, dispatch] = useActionState<State, FormData>(createSale, initialState);

    return (
        <form action={dispatch} className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-lg">
            {state.message && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm">
                    {state.message}
                </div>
            )}
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Customer</label>
                <select
                    name="customerId"
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Product (Deduct from Stock)</label>
                <select
                    name="materialId"
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                    <option value="">Select Product from Stock</option>
                    {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name} (Available: {m.stock?.quantity ?? 0} {m.unit})
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Weight Sold</label>
                <input
                    type="number"
                    step="0.01"
                    name="weight"
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="0.00"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Total Price</label>
                <div className="relative">
                    <span className="absolute left-2 top-2 text-gray-500 dark:text-gray-400">$</span>
                    <input
                        type="number"
                        step="0.01"
                        name="price"
                        required
                        className="border border-gray-300 dark:border-gray-700 p-2 pl-6 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Sale Date</label>
                <input
                    type="date"
                    name="saleDate"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
            </div>

            <div className="flex gap-2 mt-4">
                <Link
                    href="/sales"
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center w-full"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors w-full"
                >
                    Record Sale
                </button>
            </div>
        </form>
    );
}
