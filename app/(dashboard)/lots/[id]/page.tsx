import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeleteButton from '@/app/ui/delete-button';
import { deleteHarvest } from '@/app/lib/actions';
import { Plus, ArrowLeft, Pencil } from 'lucide-react';
import { formatDate } from '@/app/lib/formatters';

export default async function LotDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);
    const lot = await prisma.plantingLot.findUnique({
        where: { id },
        include: {
            harvests: {
                orderBy: { harvestDate: 'desc' }
            }
        }
    });

    if (!lot) {
        notFound();
    }

    const totalHarvestWeight = lot.harvests.reduce((sum, h) => sum + h.weight, 0);

    const statusLabels: Record<string, string> = {
        'PLANTED': 'Growing',
        'HARVESTING': 'Harvesting',
        'COMPLETED': 'Harvested'
    };
    const status = lot.status;
    const label = statusLabels[status] || status;

    return (
        <div className="w-full">
            <div className="mb-6">
                <Link href="/lots" className="text-gray-500 hover:text-gray-900 flex items-center text-sm mb-4">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Lots
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">{lot.lotCode}</h1>
                        <p className="text-gray-500">{lot.cropType}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/lots/${lot.id}/edit`}
                            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1 rounded-md text-sm font-medium flex items-center transition-colors"
                        >
                            <Pencil className="w-3 h-3 mr-2" />
                            Edit
                        </Link>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${status === 'PLANTED' ? 'bg-green-100 text-green-800' :
                            status === 'HARVESTING' ? 'bg-yellow-100 text-yellow-800' :
                                status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {label}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-4">Planting Details</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Planted Date</span>
                            <span>{formatDate(lot.plantingDate)}</span>
                        </div>
                        {lot.expectedHarvestDate && (
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-600">Expected Harvest</span>
                                <span className="font-medium text-blue-600">{formatDate(lot.expectedHarvestDate)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Tray Count</span>
                            <span>{lot.trayCount}</span>
                        </div>
                        <div className="flex justify-between pb-2">
                            <span className="text-gray-600">Seed Used</span>
                            <span>{lot.seedUsed} units</span>
                        </div>
                        {lot.notes && (
                            <div className="pt-2">
                                <span className="text-gray-600 block mb-1">Notes</span>
                                <p className="text-sm bg-gray-50 p-2 rounded">{lot.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-4">Performance</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Total Harvested</span>
                            <span className="font-bold text-green-600">{totalHarvestWeight} units</span>
                        </div>
                        <div className="flex justify-between pb-2">
                            <span className="text-gray-600">Yield per Tray</span>
                            <span>{lot.trayCount > 0 ? (totalHarvestWeight / lot.trayCount).toFixed(2) : 0} units/tray</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full">
                <div className="flex w-full items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Harvest Records</h2>
                    <Link
                        href={`/harvest/${lot.id}`}
                        className="flex items-center rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Harvest
                    </Link>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden border">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bags</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {lot.harvests.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No harvests recorded yet.</td>
                                </tr>
                            ) : (
                                lot.harvests.map(h => (
                                    <tr key={h.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(h.harvestDate)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{h.weight}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{h.bagCount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <DeleteButton id={h.id} deleteAction={deleteHarvest} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
