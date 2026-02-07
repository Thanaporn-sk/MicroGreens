import Link from 'next/link';
import { Eye } from 'lucide-react';
import { PlantingLot } from '@prisma/client';
import { formatDate, formatNumber } from '@/app/lib/formatters';
import DeleteButton from '@/app/ui/delete-button';
import { deletePlantingLot } from '@/app/lib/actions';
import SortableHeader from '@/app/ui/sortable-header';

interface LotWithWeight extends PlantingLot {
    totalWeight: number;
}

export default function LotsTable({ lots }: { lots: LotWithWeight[] }) {
    const statusLabels: Record<string, string> = {
        'PLANTED': 'Growing',
        'HARVESTING': 'Harvesting',
        'COMPLETED': 'Harvested'
    };

    return (
        <div className="overflow-x-auto rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <table className="min-w-[1000px] w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300">
                            <SortableHeader label="Lot Code" value="lotCode" />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300">
                            <SortableHeader label="Crop" value="cropType" />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300">
                            <SortableHeader label="Status" value="status" />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300">
                            <SortableHeader label="Planted Date" value="plantingDate" />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300">
                            <SortableHeader label="Exp. Harvest" value="expectedHarvestDate" />
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Trays (Planted)</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Harvest Qty (kg)</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Yield (kg/tray)</th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {lots.map((lot) => {
                        const status = lot.status;
                        const label = statusLabels[status] || status;

                        return (
                            <tr key={lot.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link href={`/lots/${lot.id}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                        {lot.lotCode}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{lot.cropType}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${status === 'PLANTED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                        status === 'HARVESTING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                            status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                        {label}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(lot.plantingDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {lot.expectedHarvestDate ? formatDate(lot.expectedHarvestDate) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">{lot.trayCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">{formatNumber(lot.totalWeight)} kg</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">{(lot.totalWeight / (lot.trayCount || 1)).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/lots/${lot.id}`} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DeleteButton id={lot.id} deleteAction={deletePlantingLot} />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
