'use client';

import Link from 'next/link';
import { createHarvest, editHarvest } from '@/app/lib/actions';
import type { Material, PlantingLot, Harvest } from '@prisma/client';

type MaterialWithStock = Material & { stock: { quantity: number } | null };
type LotWithHarvests = PlantingLot & { harvests: (Harvest & { material: Material | null })[] };
type HarvestWithMaterial = Harvest & { material: Material | null };

export default function HarvestForm({
    lot,
    materials,
    harvest
}: {
    lot: LotWithHarvests,
    materials: MaterialWithStock[],
    harvest?: HarvestWithMaterial
}) {
    const isEditing = !!harvest;

    return (
        <div className="flex flex-col gap-8 max-w-lg">
            <form action={async (formData) => {
                if (isEditing) {
                    await editHarvest(harvest.id, formData);
                } else {
                    await createHarvest(formData);
                }
            }} className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                <input type="hidden" name="lotId" value={lot.id} />

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Add Product to Stock</label>
                    <select
                        name="productMaterialId"
                        required
                        defaultValue={harvest?.materialId || ""}
                        className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-gray-100"
                    >
                        <option value="">Select Material/Product</option>
                        {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name} (Current: {m.stock?.quantity ?? 0} {m.unit})
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select the product you are creating (e.g. Sunflower Shoots)</p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Harvest Weight (kg)</label>
                    <input
                        type="number"
                        step="0.01"
                        name="weight"
                        required
                        defaultValue={harvest?.weight}
                        className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Trays Harvested</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            name="trayCount"
                            required
                            min="1"
                            max={lot.trayCount} // Suggest max but allow override?
                            defaultValue={harvest?.trayCount || ""}
                            className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-gray-100"
                            placeholder="Number of trays"
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">/ {lot.trayCount} Max</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Bag Count (Optional)</label>
                    <input
                        type="number"
                        name="bagCount"
                        defaultValue={harvest?.bagCount || ""}
                        className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Harvest Date</label>
                    <input
                        type="date"
                        name="harvestDate"
                        required
                        defaultValue={harvest ? new Date(harvest.harvestDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-gray-100"
                    />
                </div>

                <div className="flex gap-2 mt-4">
                    <Link
                        href={`/lots/${lot.id}`}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center w-full"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors w-full"
                    >
                        {isEditing ? 'Update Harvest' : 'Save Harvest Record'}
                    </button>
                </div>
            </form>

            {!isEditing && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                    <h3 className="font-medium mb-4 text-gray-800 dark:text-gray-200">Harvest History</h3>
                    {lot.harvests.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">No harvests recorded yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2">Product</th>
                                        <th className="px-4 py-2 text-right">Weight</th>
                                        <th className="px-4 py-2 text-right">Trays</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lot.harvests.map((h) => (
                                        <tr key={h.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-2 whitespace-nowrap dark:text-gray-300">
                                                {new Date(h.harvestDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2 dark:text-gray-300">
                                                {h.material?.name || '-'}
                                            </td>
                                            <td className="px-4 py-2 text-right font-medium dark:text-gray-200">
                                                {h.weight} kg
                                            </td>
                                            <td className="px-4 py-2 text-right dark:text-gray-300">
                                                {h.trayCount || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
