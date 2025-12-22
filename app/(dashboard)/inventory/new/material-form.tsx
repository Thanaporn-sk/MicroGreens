'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createMaterial, State } from '@/app/lib/actions';

const initialState: State = { message: null, errors: {} };

export default function MaterialForm() {
    const [state, dispatch] = useActionState<State, FormData>(createMaterial, initialState);

    return (
        <form action={dispatch} className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-sm border max-w-lg">
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Material Name</label>
                <input
                    name="name"
                    required
                    className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Sunflower Seeds"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Unit</label>
                <select name="unit" className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="kg">kg</option>
                    <option value="bag">bag</option>
                    <option value="g">g</option>
                    <option value="liter">liter</option>
                    <option value="pcs">pcs</option>
                </select>
            </div>

            {state.message && (
                <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
                    {state.message}
                </div>
            )}



            <div className="flex gap-2 mt-4">
                <Link
                    href="/inventory"
                    className="bg-gray-100 text-gray-700 p-2 rounded hover:bg-gray-200 transition-colors text-center w-full"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors w-full"
                >
                    Save Material
                </button>
            </div>
        </form>
    );
}
