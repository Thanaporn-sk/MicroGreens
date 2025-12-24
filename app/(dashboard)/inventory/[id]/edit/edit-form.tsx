'use client';

import { useState } from 'react';
import Link from 'next/link';
import { updateMaterial } from '@/app/lib/actions';
import type { Material } from '@prisma/client';
import { X } from 'lucide-react';
import { SubmitButton } from '@/app/ui/submit-button';

type MaterialWithImages = Material & { images: { id: number; url: string; }[] };

export default function EditMaterialForm({ material }: { material: MaterialWithImages }) {
    const updateMaterialWithId = updateMaterial.bind(null, material.id);
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleDeleteImage = (imageId: number) => {
        setDeletedImageIds([...deletedImageIds, imageId]);
    };

    const visibleImages = material.images ? material.images.filter(img => !deletedImageIds.includes(img.id)) : [];

    return (
        <form action={updateMaterialWithId} className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-lg">
            <input type="hidden" name="deletedImageIds" value={JSON.stringify(deletedImageIds)} />

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Material Name</label>
                <input
                    name="name"
                    defaultValue={material.name}
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Unit</label>
                <select
                    name="unit"
                    defaultValue={material.unit}
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                    <option value="kg">kg</option>
                    <option value="bag">bag</option>
                    <option value="g">g</option>
                    <option value="liter">liter</option>
                    <option value="pcs">pcs</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                    name="description"
                    defaultValue={material.description || ''}
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Add Images</label>
                <input
                    type="file"
                    name="images"
                    multiple
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300
                        hover:file:bg-blue-100 dark:hover:file:bg-blue-900/70"
                />
            </div>

            {visibleImages.length > 0 && (
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Existing Images</label>
                    <div className="flex gap-2 overflow-x-auto py-2">
                        {visibleImages.map((img) => (
                            <div key={img.id} className="relative w-24 h-24 border dark:border-gray-700 rounded-md overflow-hidden shrink-0 group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={img.url}
                                    alt="Material"
                                    className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setPreviewImage(img.url)}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteImage(img.id)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                                    title="Delete Image"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-2 mt-4">
                <Link
                    href="/inventory"
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center w-full"
                >
                    Cancel
                </Link>
                <SubmitButton
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors w-full"
                >
                    Update Material
                </SubmitButton>
            </div>

            {/* Lightbox Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animation-fadeIn"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-4xl max-h-screen">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={previewImage}
                            alt="Full View"
                            className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
                        />
                        <button
                            className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2 hover:bg-gray-200 shadow-lg"
                            onClick={() => setPreviewImage(null)}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
}
