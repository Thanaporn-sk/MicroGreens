'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Settings2 } from 'lucide-react';
import DeleteButton from '@/app/ui/delete-button';
import { deleteMaterial } from '@/app/lib/actions';
import StockAdjustmentModal from '@/app/ui/stock-adjustment-modal';
import MaterialHistoryModal from '@/app/ui/history/material-history-modal';

type MaterialWithStock = {
    id: number;
    name: string;
    unit: string;
    stock: { quantity: number } | null;
};

export default function InventoryTable({ materials }: { materials: MaterialWithStock[] }) {
    const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithStock | null>(null); // For adjustment
    const [historyMaterial, setHistoryMaterial] = useState<MaterialWithStock | null>(null); // For history

    return (
        <div className="rounded-lg bg-white shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {materials.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No materials found.</td>
                        </tr>
                    ) : (
                        materials.map((material) => (
                            <tr
                                key={material.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => setHistoryMaterial(material)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.unit}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.stock?.quantity?.toFixed(2) || '0.00'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => setSelectedMaterial(material)}
                                        className="text-emerald-600 hover:text-emerald-900 p-1 flex items-center gap-1 text-xs border border-emerald-200 rounded px-2 bg-emerald-50"
                                        title="Adjust Stock"
                                    >
                                        <Settings2 className="w-3 h-3" /> Adjust
                                    </button>
                                    <Link href={`/inventory/${material.id}/edit`} className="text-blue-600 hover:text-blue-900 p-1">
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

            {historyMaterial && (
                <MaterialHistoryModal
                    isOpen={!!historyMaterial}
                    onClose={() => setHistoryMaterial(null)}
                    materialId={historyMaterial.id}
                    materialName={historyMaterial.name}
                />
            )}
        </div>
    );
}
