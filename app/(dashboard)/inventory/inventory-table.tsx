'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Settings2 } from 'lucide-react';
import DeleteButton from '@/app/ui/delete-button';
import { deleteMaterial } from '@/app/lib/actions';
import StockAdjustmentModal from '@/app/ui/stock-adjustment-modal';
import MaterialDetailModal from '@/app/ui/inventory/material-detail-modal';
import SortableHeader from '@/app/ui/sortable-header';

type MaterialWithDetails = {
    id: number;
    name: string;
    unit: string;
    description: string | null;
    images: { url: string }[];
    stock: { quantity: number } | null;
};

export default function InventoryTable({ materials }: { materials: MaterialWithDetails[] }) {
    const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithDetails | null>(null); // For adjustment
    const [detailMaterial, setDetailMaterial] = useState<MaterialWithDetails | null>(null); // For details/history

    return (
        <div className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-x-auto border dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400">
                            <SortableHeader label="Name" value="name" />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400">
                            <SortableHeader label="Stock" value="stock" />
                        </th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {materials.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No materials found.</td>
                        </tr>
                    ) : (
                        materials.map((material) => (
                            <tr
                                key={material.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                onClick={() => setDetailMaterial(material)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{material.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{material.unit}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{material.stock?.quantity?.toFixed(2) || '0.00'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => setSelectedMaterial(material)}
                                        className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 p-1 flex items-center gap-1 text-xs border border-emerald-200 dark:border-emerald-800 rounded px-2 bg-emerald-50 dark:bg-emerald-900/20"
                                        title="Adjust Stock"
                                    >
                                        <Settings2 className="w-3 h-3" /> Adjust
                                    </button>
                                    <Link href={`/inventory/${material.id}/edit`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1">
                                        <Pencil className="w-4 h-4" />
                                    </Link>
                                    <DeleteButton id={material.id} deleteAction={deleteMaterial} />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {selectedMaterial && (
                <StockAdjustmentModal
                    isOpen={!!selectedMaterial}
                    onClose={() => setSelectedMaterial(null)}
                    materialId={selectedMaterial.id}
                    materialName={selectedMaterial.name}
                    currentStock={selectedMaterial.stock?.quantity || 0}
                    unit={selectedMaterial.unit}
                />
            )}

            {detailMaterial && (
                <MaterialDetailModal
                    isOpen={!!detailMaterial}
                    onClose={() => setDetailMaterial(null)}
                    material={detailMaterial}
                />
            )}
        </div>
    );
}
