'use client';

import Link from 'next/link';
import { createHarvest } from '@/app/lib/actions';
import type { Material, PlantingLot, Harvest } from '@prisma/client';

type MaterialWithStock = Material & { stock: { quantity: number } | null };
type LotWithHarvests = PlantingLot & { harvests: (Harvest & { material: Material | null })[] };

export default function HarvestForm({ lot, materials }: { lot: LotWithHarvests, materials: MaterialWithStock[] }) {
    return (
        <div className="flex flex-col gap-8 max-w-lg">
            <form action={createHarvest} className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-sm border">
                <input type="hidden" name="lotId" value={lot.id} />

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Add Product to Stock</label>
                    <select
                        name="productMaterialId"
                        required
                        className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="">Select Material/Product</option>
                        {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name} (Current: {m.stock?.quantity ?? 0} {m.unit})
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Select the product you are creating (e.g. Sunflower Shoots)</p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Harvest Weight (g)</label>
                    <input
                        type="number"
                        step="0.01"
                        name="weight"
                        required
                        className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Trays Harvested</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            name="trayCount"
                            required
                            min="1"
                            max={lot.trayCount} // Limit to total trays? Or allow overage? Better to suggest max but allow manual override if needed, but min 1 is logical.
                            className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Number of trays"
                        />
                        <span className="text-sm text-gray-500 whitespace-nowrap">/ {lot.trayCount} Max</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Bag Count (Optional)</label>
                    <input
                        type="number"
                        name="bagCount"
                        className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Harvest Date</label>
                    <input
                        type="date"
                        name="harvestDate"
                        required
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="flex gap-2 mt-4">
                    <Link
                        href={`/lots/${lot.id}`}
                        className="bg-gray-100 text-gray-700 p-2 rounded hover:bg-gray-200 transition-colors text-center w-full"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors w-full"
                    >
                        Save Harvest Record
                    </button>
                </div>
            </form>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-medium mb-4 text-gray-800">Harvest History</h3>
                {lot.harvests.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No harvests recorded yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2">Product</th>
                                    <th className="px-4 py-2 text-right">Weight</th>
                                    <th className="px-4 py-2 text-right">Trays</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lot.harvests.map((h) => (
                                    <tr key={h.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {new Date(h.harvestDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2">
                                            {h.material?.name || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-right font-medium">
                                            {h.weight} g
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {h.trayCount || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
