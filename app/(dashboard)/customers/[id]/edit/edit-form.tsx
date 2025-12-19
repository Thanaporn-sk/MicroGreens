'use client';

import Link from 'next/link';
import { updateCustomer } from '@/app/lib/actions';
import type { Customer } from '@prisma/client';

export default function EditCustomerForm({ customer }: { customer: Customer }) {
    const updateCustomerWithId = updateCustomer.bind(null, customer.id);

    return (
        <form action={updateCustomerWithId} className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-sm border max-w-lg">
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Customer Name</label>
                <input
                    name="name"
                    defaultValue={customer.name}
                    required
                    className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Contact Info</label>
                <input
                    name="contact"
                    defaultValue={customer.contact || ''}
                    className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Address</label>
                <textarea
                    name="address"
                    defaultValue={customer.address || ''}
                    className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
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
                    Update Customer
                </button>
            </div>
        </form>
    );
}
