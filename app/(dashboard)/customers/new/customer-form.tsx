'use client';

import Link from 'next/link';
import { createCustomer } from '@/app/lib/actions';
import { SubmitButton } from '@/app/ui/submit-button';

export default function CustomerForm() {
    return (
        <form action={createCustomer} className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-lg">
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Customer Name</label>
                <input
                    name="name"
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="e.g. John Doe"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Contact Info</label>
                <input
                    name="contact"
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Phone or Email"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Address</label>
                <textarea
                    name="address"
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Shipping Address..."
                />
            </div>

            <div className="flex gap-2 mt-4">
                <Link
                    href="/customers"
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center w-full"
                >
                    Cancel
                </Link>
                <SubmitButton
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors w-full"
                >
                    Save Customer
                </SubmitButton>
            </div>
        </form>
    );
}
