'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, User } from 'lucide-react';
import DeleteButton from '@/app/ui/delete-button';
import { deleteCustomer } from '@/app/lib/actions';
import { formatDate } from '@/app/lib/formatters';
import CustomerHistoryModal from '@/app/ui/history/customer-history-modal';
import SortableHeader from '@/app/ui/sortable-header';

type CustomerWithSales = {
    id: number;
    name: string;
    contact: string | null;
    address: string | null;
    createdAt: Date;
    sales: any[];
};

export default function CustomersTable({ customers }: { customers: CustomerWithSales[] }) {
    const [historyCustomer, setHistoryCustomer] = useState<{ id: number, name: string } | null>(null);

    return (
        <>
            <div className="rounded-lg bg-white shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500">
                                <SortableHeader label="Name" value="name" />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500">
                                <SortableHeader label="Contact" value="contact" />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500">
                                <SortableHeader label="Joined" value="createdAt" />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Sales
                            </th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {customers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No customers found.</td>
                            </tr>
                        ) : (
                            customers.map((c) => (
                                <tr
                                    key={c.id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => setHistoryCustomer({ id: c.id, name: c.name })}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">{c.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>{c.contact || '-'}</div>
                                        <div className="text-xs text-gray-400">{c.address}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(c.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {c.sales.length}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                        <Link href={`/customers/${c.id}/edit`} className="text-blue-600 hover:text-blue-900 p-1">
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <DeleteButton id={c.id} deleteAction={deleteCustomer} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {historyCustomer && (
                <CustomerHistoryModal
                    isOpen={!!historyCustomer}
                    onClose={() => setHistoryCustomer(null)}
                    customerId={historyCustomer.id}
                    customerName={historyCustomer.name}
                />
            )}
        </>
    );
}
