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
    type: string;
    buySale: string;
    images: { url: string }[];
    stock: { quantity: number } | null;
};

export default function InventoryTable({ materials }: { materials: MaterialWithDetails[] }) {
    const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithDetails | null>(null);
    const [detailMaterial, setDetailMaterial] = useState<MaterialWithDetails | null>(null);

    // Filter States
    const [nameFilter, setNameFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [buySaleFilter, setBuySaleFilter] = useState('');

    const filteredMaterials = materials.filter((material) => {
        const matchName = material.name.toLowerCase().includes(nameFilter.toLowerCase());
        const matchType = typeFilter ? material.type === typeFilter : true;
        const matchBuySale = buySaleFilter ? material.buySale === buySaleFilter : true;
        return matchName && matchType && matchBuySale;
    });

    return (
        <div className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-x-auto border dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 w-1/4">
                            <div className="flex flex-col gap-2">
                                <SortableHeader label="Name" value="name" />
                                <input
                                    type="text"
                                    placeholder="Filter Name..."
                                    className="w-full text-xs p-1 border rounded dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={nameFilter}
                                    onChange={(e) => setNameFilter(e.target.value)}
                                    // Prevent sorting when clicking input
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <div className="flex flex-col gap-2">
                                <span>Buy/Sale</span>
                                <select
                                    className="w-full text-xs p-1 border rounded dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={buySaleFilter}
                                    onChange={(e) => setBuySaleFilter(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <option value="">All</option>
                                    <option value="BOTH">Buy & Sell</option>
                                    <option value="BUY">Buy Only</option>
                                    <option value="SELL">Sell Only</option>
                                    <option value="NONE">None</option>
                                </select>
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400">
                            <SortableHeader label="Stock" value="stock" />
                        </th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredMaterials.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No materials found.</td>
                        </tr>
                    ) : (
                        filteredMaterials.map((material) => (
                            <tr
                                key={material.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                onClick={() => setDetailMaterial(material)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{material.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        {material.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {material.buySale === 'BOTH' && <span className="text-xs border px-1 rounded border-blue-200 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">Buy & Sell</span>}
                                    {material.buySale === 'BUY' && <span className="text-xs border px-1 rounded border-orange-200 bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400">Buy Only</span>}
                                    {material.buySale === 'SELL' && <span className="text-xs border px-1 rounded border-green-200 bg-green-50 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">Sell Only</span>}
                                    {material.buySale === 'NONE' && <span className="text-xs border px-1 rounded border-gray-200 bg-gray-50 text-gray-400">None</span>}
                                </td>
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
