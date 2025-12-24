'use client';

import { useState } from 'react';
import { addLotEvent, addLotImage } from '@/app/lib/actions';
import { Plus, Camera, X } from 'lucide-react';
import { SubmitButton } from '@/app/ui/submit-button';
import { formatDate, formatDateTime } from '@/app/lib/formatters';
import type { LotEvent, LotImage } from '@prisma/client';

type LotEventWithImages = LotEvent & { images: LotImage[] };

export function LotTimeline({ lotId, events }: { lotId: number, events: LotEventWithImages[] }) {
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [uploadingEventId, setUploadingEventId] = useState<number | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const closeUpload = () => {
        setUploadingEventId(null);
        setPreview(null);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Timeline</h2>
                <button
                    onClick={() => setIsAddingEvent(!isAddingEvent)}
                    className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md flex items-center shadow-sm transition-colors"
                >
                    <Plus className="w-4 h-4 mr-1" /> Add Event
                </button>
            </div>

            {isAddingEvent && (
                <form action={async (formData) => {
                    await addLotEvent(lotId, formData);
                    setIsAddingEvent(false);
                }} className="mb-8 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 animation-fadeIn">
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-3">New Event</h3>
                    <div className="space-y-3">
                        <input
                            name="title"
                            placeholder="Event Title (e.g. Sprouting, Watering)"
                            className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        <textarea
                            name="description"
                            placeholder="Description..."
                            className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                        />
                        <input
                            type="date"
                            name="date"
                            defaultValue={new Date().toISOString().split('T')[0]}
                            className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsAddingEvent(false)}
                                className="text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200 px-3 py-1.5"
                            >
                                Cancel
                            </button>
                            <SubmitButton
                                className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-blue-700 shadow-sm"
                            >
                                Save Event
                            </SubmitButton>
                        </div>
                    </div>
                </form>
            )}

            <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8 pb-4">
                {events.length === 0 ? (
                    <div className="ml-8 text-gray-500 dark:text-gray-400 text-sm italic py-4">No events recorded.</div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="ml-8 relative">
                            <span className="absolute -left-[2.45rem] top-1.5 h-4 w-4 rounded-full bg-white dark:bg-gray-800 border-4 border-blue-500 ring-2 ring-white dark:ring-gray-800" />

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 inline-block mt-1">
                                            {formatDateTime(event.date)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setUploadingEventId(uploadingEventId === event.id ? null : event.id)}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                    >
                                        <Camera className="w-3 h-3 mr-1" /> Add Photo
                                    </button>
                                </div>

                                {event.description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{event.description}</p>}

                                {/* Event Images */}
                                {event.images && event.images.length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-3">
                                        {event.images.map((img: LotImage) => (
                                            <div
                                                key={img.id}
                                                className="relative aspect-square rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 border dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => setLightboxImage(img.url)}
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={img.url} alt={img.caption || "Event image"} className="object-cover w-full h-full" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Image Upload Form for this Event */}
                                {uploadingEventId === event.id && (
                                    <form action={async (formData) => {
                                        await addLotImage(lotId, formData);
                                        closeUpload();
                                    }} className="mt-4 p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 shadow-sm animation-fadeIn">
                                        <input type="hidden" name="eventId" value={event.id} />
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                {preview && (
                                                    <div className="h-12 w-12 relative rounded overflow-hidden bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 shrink-0">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    name="image"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="block w-full text-xs text-gray-500 dark:text-gray-400
                                                        file:mr-2 file:py-1 file:px-2
                                                        file:rounded-full file:border-0
                                                        file:text-xs file:font-semibold
                                                        file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300
                                                        hover:file:bg-blue-100 dark:hover:file:bg-blue-900/70"
                                                    required
                                                />
                                            </div>
                                            <input
                                                name="caption"
                                                placeholder="Caption..."
                                                className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border p-1.5 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={closeUpload}
                                                    className="text-gray-500 dark:text-gray-400 text-xs hover:text-gray-700 dark:hover:text-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                                <SubmitButton
                                                    className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700"
                                                    pendingText="Uploading..."
                                                >
                                                    Upload
                                                </SubmitButton>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animation-fadeIn"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-w-5xl max-h-screen">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={lightboxImage}
                            alt="Full View"
                            className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
                        />
                        <button
                            className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2 hover:bg-gray-200 shadow-lg"
                            onClick={() => setLightboxImage(null)}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Keeping LotGallery for backward compatibility or for "Orphan" images not attached to events, 
// though the new requirement suggests focusing on Event-based images.
export function LotGallery({ lotId, images }: { lotId: number, images: LotImage[] }) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Gallery</h2>
                <button
                    onClick={() => setIsUploading(!isUploading)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                    <Camera className="w-4 h-4 mr-1" /> Upload Photo
                </button>
            </div>

            {isUploading && (
                <form action={async (formData) => {
                    await addLotImage(lotId, formData);
                    setIsUploading(false);
                    setPreview(null);
                }} className="mb-6 p-4 bg-gray-50 rounded border">
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            {preview && (
                                <div className="h-20 w-20 relative rounded overflow-hidden bg-gray-200">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                                </div>
                            )}
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                required
                            />
                        </div>
                        <input
                            name="caption"
                            placeholder="Caption (optional)"
                            className="w-full border p-2 rounded text-sm"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => { setIsUploading(false); setPreview(null); }}
                                className="text-gray-500 text-sm hover:underline"
                            >
                                Cancel
                            </button>
                            <SubmitButton
                                className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
                                pendingText="Uploading..."
                            >
                                Upload
                            </SubmitButton>
                        </div>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.length === 0 ? (
                    <p className="col-span-full text-gray-500 text-sm text-center py-4">No photos yet.</p>
                ) : (
                    images.map((img) => (
                        <div
                            key={img.id}
                            className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setLightboxImage(img.url)}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={img.url}
                                alt={img.caption || 'Lot Image'}
                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            />
                            {img.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                                    {img.caption}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animation-fadeIn"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-w-5xl max-h-screen">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={lightboxImage}
                            alt="Full View"
                            className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
                        />
                        <button
                            className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2 hover:bg-gray-200 shadow-lg"
                            onClick={() => setLightboxImage(null)}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
