'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Pencil } from 'lucide-react';
import DeleteButton from '@/app/ui/delete-button';
import { deleteCustomer } from '@/app/lib/actions';
import { formatDate } from '@/app/lib/formatters';
import CustomerHistoryModal from '@/app/ui/history/customer-history-modal';

type CustomerWithSales = {
    id: number;
    name: string;
    contact: string | null;
    address: string | null;
    createdAt: Date;
    sales: any[];
};

export default function CustomersList({ customers }: { customers: CustomerWithSales[] }) {
    const [historyCustomer, setHistoryCustomer] = useState<{ id: number, name: string } | null>(null);

    return (
        <>
            {customers.length === 0 ? (
                <p className="text-gray-500 text-center">No customers found.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {customers.map((c) => (
                        <div
                            key={c.id}
                            className="bg-white p-6 rounded-lg shadow border transition-all hover:shadow-md relative group cursor-pointer hover:border-blue-200"
                            onClick={() => setHistoryCustomer({ id: c.id, name: c.name })}
                        >
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                <Link href={`/customers/${c.id}/edit`} className="text-blue-600 hover:text-blue-900 p-1 bg-gray-50 rounded-full">
                                    <Pencil className="w-4 h-4" />
                                </Link>
                                <div className="bg-gray-50 rounded-full">
                                    <DeleteButton id={c.id} deleteAction={deleteCustomer} />
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{c.name}</h3>
                                    <p className="text-sm text-gray-500">{c.contact || 'No contact info'}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-700 min-h-[3rem]">
                                <p className="line-clamp-2">{c.address || 'No address'}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t text-xs text-gray-500 flex justify-between">
                                <span>Member since {formatDate(c.createdAt)}</span>
                                <span>Orders: {c.sales.length}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
