'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createMaterial, State } from '@/app/lib/actions';
import { SubmitButton } from '@/app/ui/submit-button';

const initialState: State = { message: null, errors: {} };

export default function MaterialForm() {
    const [state, dispatch] = useActionState<State, FormData>(createMaterial, initialState);

    return (
        <form action={dispatch} className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-lg">
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Material Name</label>
                <input
                    name="name"
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="e.g. Sunflower Seeds"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Unit</label>
                <select name="unit" className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <option value="kg">kg</option>
                    <option value="bag">bag</option>
                    <option value="g">g</option>
                    <option value="liter">liter</option>
                    <option value="pcs">pcs</option>
                </select>
            </div>

            {state.message && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm">
                    {state.message}
                </div>
            )}
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                    name="description"
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Enter material description..."
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Type</label>
                    <select name="type" className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                        <option value="MATERIAL">Material</option>
                        <option value="ASSET">Asset</option>
                        <option value="SEED">Seed</option>
                        <option value="CROP">Crop</option>
                        <option value="PACKAGING">Packaging</option>
                        <option value="EQUIPMENT">Equipment</option>
                        <option value="OTHERS">Others</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Buy/Sale</label>
                    <select name="buySale" className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                        <option value="BOTH">Buy & Sell</option>
                        <option value="BUY">Buy Only</option>
                        <option value="SELL">Sell Only</option>
                        <option value="NONE">None</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Images</label>
                <input
                    type="file"
                    name="images"
                    multiple
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300
                        hover:file:bg-blue-100 dark:hover:file:bg-blue-900/70"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Select multiple images to upload.</p>
            </div>



            <div className="flex gap-2 mt-4">
                <Link
                    href="/inventory"
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center w-full"
                >
                    Cancel
                </Link>
                <SubmitButton
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors w-full"
                >
                    Save Material
                </SubmitButton>
            </div>
        </form>
    );
}
