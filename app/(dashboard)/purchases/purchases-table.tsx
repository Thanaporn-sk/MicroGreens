'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import DeleteButton from '@/app/ui/delete-button';
import { deletePurchase } from '@/app/lib/actions';
import { formatDate } from '@/app/lib/formatters';
import MaterialHistoryModal from '@/app/ui/history/material-history-modal';
import SortableHeader from '@/app/ui/sortable-header';

type PurchaseWithMaterial = {
    id: number;
    date: Date;
    quantity: number;
    cost: number | null;
    materialId: number;
    material: {
        id: number;
        name: string;
        unit: string;
    };
};

export default function PurchasesTable({ purchases }: { purchases: PurchaseWithMaterial[] }) {
    const [historyMaterial, setHistoryMaterial] = useState<{ id: number, name: string } | null>(null);

    return (
        <>
            <div className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                <SortableHeader label="Date" value="date" />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                <SortableHeader label="Material" value="material" />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                <SortableHeader label="Quantity" value="quantity" />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                <SortableHeader label="Cost" value="cost" />
                            </th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {purchases.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No purchases recorded.</td>
                            </tr>
                        ) : (
                            purchases.map((purchase) => (
                                <tr
                                    key={purchase.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                    onClick={() => setHistoryMaterial({ id: purchase.material.id, name: purchase.material.name })}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{formatDate(purchase.date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{purchase.material.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{purchase.quantity.toFixed(2)} {purchase.material.unit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${purchase.cost?.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                        <Link href={`/purchases/${purchase.id}/edit`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1">
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <DeleteButton id={purchase.id} deleteAction={deletePurchase} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {historyMaterial && (
                <MaterialHistoryModal
                    isOpen={!!historyMaterial}
                    onClose={() => setHistoryMaterial(null)}
                    materialId={historyMaterial.id}
                    materialName={historyMaterial.name}
                />
            )}
        </>
    );
}
