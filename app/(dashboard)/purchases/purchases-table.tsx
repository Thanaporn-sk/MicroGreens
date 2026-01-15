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
        type: string;
    };
};

export default function PurchasesTable({ purchases }: { purchases: PurchaseWithMaterial[] }) {
    const [historyMaterial, setHistoryMaterial] = useState<{ id: number, name: string } | null>(null);

    // Filter States
    const [materialFilter, setMaterialFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const filteredPurchases = purchases.filter((purchase) => {
        const matchMaterial = purchase.material.name.toLowerCase().includes(materialFilter.toLowerCase());
        const matchType = typeFilter ? purchase.material.type === typeFilter : true;
        return matchMaterial && matchType;
    });

    return (
        <>
            <div className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                <SortableHeader label="Date" value="date" />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 w-1/4">
                                <div className="flex flex-col gap-2">
                                    <SortableHeader label="Material" value="material" />
                                    <input
                                        type="text"
                                        placeholder="Filter Material..."
                                        className="w-full text-xs p-1 border rounded dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={materialFilter}
                                        onChange={(e) => setMaterialFilter(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                <div className="flex flex-col gap-2">
                                    <span>Type</span>
                                    <select
                                        className="w-full text-xs p-1 border rounded dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="">All Types</option>
                                        <option value="MATERIAL">Material</option>
                                        <option value="ASSET">Asset</option>
                                        <option value="SEED">Seed</option>
                                        <option value="CROP">Crop</option>
                                        <option value="PACKAGING">Packaging</option>
                                        <option value="EQUIPMENT">Equipment</option>
                                        <option value="OTHERS">Others</option>
                                    </select>
                                </div>
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
                        {filteredPurchases.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No purchases found.</td>
                            </tr>
                        ) : (
                            filteredPurchases.map((purchase) => (
                                <tr
                                    key={purchase.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                    onClick={() => setHistoryMaterial({ id: purchase.material.id, name: purchase.material.name })}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{formatDate(purchase.date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{purchase.material.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            {purchase.material.type}
                                        </span>
                                    </td>
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
