'use client';

import Link from 'next/link';
import { createCustomer } from '@/app/lib/actions';

export default function CustomerForm() {
    return (
        <form action={createCustomer} className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-sm border max-w-lg">
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Customer Name</label>
                <input
                    name="name"
                    required
                    className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. John Doe"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Contact Info</label>
                <input
                    name="contact"
                    className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Phone or Email"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Address</label>
                <textarea
                    name="address"
                    className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Shipping Address..."
                />
            </div>

            <div className="flex gap-2 mt-4">
                <Link
                    href="/customers"
                    className="bg-gray-100 text-gray-700 p-2 rounded hover:bg-gray-200 transition-colors text-center w-full"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors w-full"
                >
                    Save Customer
                </button>
            </div>
        </form>
    );
}
