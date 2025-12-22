import Link from 'next/link';
import { Eye } from 'lucide-react';
import { PlantingLot } from '@prisma/client';
import { formatDate } from '@/app/lib/formatters';
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
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500">
                            <SortableHeader label="Lot Code" value="lotCode" />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500">
                            <SortableHeader label="Crop" value="cropType" />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500">
                            <SortableHeader label="Status" value="status" />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500">
                            <SortableHeader label="Planted Date" value="plantingDate" />
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Trays (Planted)</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Yield (g)</th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {lots.map((lot) => {
                        const status = lot.status;
                        const label = statusLabels[status] || status;

                        return (
                            <tr key={lot.id} className="hover:bg-gray-50 group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link href={`/lots/${lot.id}`} className="font-medium text-blue-600 hover:underline">
                                        {lot.lotCode}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lot.cropType}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${status === 'PLANTED' ? 'bg-green-100 text-green-800' :
                                        status === 'HARVESTING' ? 'bg-yellow-100 text-yellow-800' :
                                            status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {label}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(lot.plantingDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{lot.trayCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{lot.totalWeight}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/lots/${lot.id}`} className="text-gray-400 hover:text-gray-600">
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
