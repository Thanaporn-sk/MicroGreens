'use client';



import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addLotEvent, addLotImage, updateLotEvent, deleteLotEvent, deleteLotImage } from '@/app/lib/actions';
import { Plus, Camera, X, Edit2, Trash2 } from 'lucide-react';
import { SubmitButton } from '@/app/ui/submit-button';
import { formatDate, formatDateTime } from '@/app/lib/formatters';
import type { LotEvent, LotImage } from '@prisma/client';

type LotEventWithImages = LotEvent & { images: LotImage[] };

// Confirmation Dialog Component
function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animation-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export function LotTimeline({ lotId, events }: { lotId: number, events: LotEventWithImages[] }) {
    const router = useRouter();
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [editingEventId, setEditingEventId] = useState<number | null>(null);
    const [editTimestamp, setEditTimestamp] = useState<number>(0);
    const [uploadingEventId, setUploadingEventId] = useState<number | null>(null);
    const [previews, setPreviews] = useState<string[]>([]);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ type: 'event' | 'image', id: number, eventId?: number } | null>(null);

    // Collect all images for slideshow
    const allImages = React.useMemo(() =>
        events.flatMap(event => event.images.map(img => img.url)),
        [events]
    );

    // Keyboard navigation for lightbox
    useEffect(() => {
        if (!lightboxImage) return;

        const currentIndex = allImages.indexOf(lightboxImage);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                const newIndex = currentIndex > 0 ? currentIndex - 1 : allImages.length - 1;
                setLightboxImage(allImages[newIndex]);
            } else if (e.key === 'ArrowRight') {
                const newIndex = currentIndex < allImages.length - 1 ? currentIndex + 1 : 0;
                setLightboxImage(allImages[newIndex]);
            } else if (e.key === 'Escape') {
                setLightboxImage(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxImage, allImages]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    const closeUpload = () => {
        setUploadingEventId(null);
        setPreviews([]);
    };

    const handleDeleteEvent = async (eventId: number) => {
        await deleteLotEvent(eventId, lotId);
    };

    const handleDeleteImage = async (imageId: number) => {
        await deleteLotImage(imageId, lotId);
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
                            type="datetime-local"
                            name="date"
                            defaultValue={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
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
                                {editingEventId === event.id ? (
                                    // Edit Form - key with editTimestamp ensures fresh data every time
                                    <form
                                        key={`edit-${event.id}-${editTimestamp}`}
                                        action={async (formData) => {
                                            await updateLotEvent(event.id, lotId, formData);
                                            setEditingEventId(null);
                                            router.refresh(); // Force reload fresh data
                                        }}
                                        className="space-y-3"
                                    >
                                        <input
                                            name="title"
                                            defaultValue={event.title}
                                            placeholder="Event Title"
                                            className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        <textarea
                                            name="description"
                                            defaultValue={event.description || ''}
                                            placeholder="Description..."
                                            className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                            rows={5}
                                        />
                                        <input
                                            type="datetime-local"
                                            name="date"
                                            defaultValue={new Date(new Date(event.date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                            className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <div className="flex justify-end gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditingEventId(null)}
                                                className="text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200 px-3 py-1.5"
                                            >
                                                Cancel
                                            </button>
                                            <SubmitButton
                                                className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-blue-700 shadow-sm"
                                            >
                                                Update Event
                                            </SubmitButton>
                                        </div>
                                    </form>
                                ) : (
                                    // Display Mode
                                    <>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 inline-block mt-1">
                                                    {formatDateTime(event.date)}
                                                </span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingEventId(event.id);
                                                        setEditTimestamp(Date.now());
                                                    }}
                                                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                                    title="Edit Event"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteDialog({ type: 'event', id: event.id })}
                                                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                                    title="Delete Event"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => setUploadingEventId(uploadingEventId === event.id ? null : event.id)}
                                                    className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 flex items-center bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                                                    title="Add Photos"
                                                >
                                                    <Camera className="w-3 h-3 mr-1" /> Add Photo
                                                </button>
                                            </div>
                                        </div>

                                        {event.description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed whitespace-pre-wrap">{event.description}</p>}

                                        {/* Event Images */}
                                        {event.images && event.images.length > 0 && (
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-3">
                                                {event.images.map((img: LotImage) => (
                                                    <div
                                                        key={img.id}
                                                        className="relative aspect-square rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 border dark:border-gray-600 group"
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={img.url}
                                                            alt={img.caption || "Event image"}
                                                            className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => setLightboxImage(img.url)}
                                                        />
                                                        <button
                                                            onClick={() => setDeleteDialog({ type: 'image', id: img.id, eventId: event.id })}
                                                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                            title="Delete Image"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
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
                                                    <div className="flex flex-col gap-3">
                                                        {previews.length > 0 && (
                                                            <div className="grid grid-cols-4 gap-2">
                                                                {previews.map((preview, idx) => (
                                                                    <div key={idx} className="h-16 w-16 relative rounded overflow-hidden bg-gray-100 dark:bg-gray-800 border dark:border-gray-700">
                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                        <img src={preview} alt={`Preview ${idx + 1}`} className="object-cover w-full h-full" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <input
                                                            type="file"
                                                            name="images"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={handleFileChange}
                                                            className="block w-full text-xs text-gray-500 dark:text-gray-400
                                                                file:mr-2 file:py-1 file:px-2
                                                                file:rounded-full file:border-0
                                                                file:text-xs file:font-semibold
                                                                file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300
                                                                hover:file:bg-blue-100 dark:hover:file:bg-blue-900/70"
                                                            required
                                                        />
                                                        {previews.length > 0 && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {previews.length} image{previews.length > 1 ? 's' : ''} selected
                                                            </p>
                                                        )}
                                                    </div>
                                                    <input
                                                        name="caption"
                                                        placeholder="Caption (optional)..."
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
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>



            {/* Lightbox Modal with Slideshow */}
            {lightboxImage && (() => {
                const currentIndex = allImages.indexOf(lightboxImage);

                const goToPrevious = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    const newIndex = currentIndex > 0 ? currentIndex - 1 : allImages.length - 1;
                    setLightboxImage(allImages[newIndex]);
                };

                const goToNext = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    const newIndex = currentIndex < allImages.length - 1 ? currentIndex + 1 : 0;
                    setLightboxImage(allImages[newIndex]);
                };

                return (
                    <div
                        className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 animation-fadeIn"
                        onClick={() => setLightboxImage(null)}
                    >
                        <div className="relative max-w-6xl max-h-screen w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            {/* Previous Button */}
                            {allImages.length > 1 && (
                                <button
                                    onClick={goToPrevious}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white rounded-full p-3 hover:bg-white dark:hover:bg-gray-700 shadow-xl transition-all z-10"
                                    title="Previous (←)"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}

                            {/* Image */}
                            <div className="relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={lightboxImage}
                                    alt={`Image ${currentIndex + 1} of ${allImages.length}`}
                                    className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl"
                                />

                                {/* Image Counter */}
                                {allImages.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                                        {currentIndex + 1} / {allImages.length}
                                    </div>
                                )}
                            </div>

                            {/* Next Button */}
                            {allImages.length > 1 && (
                                <button
                                    onClick={goToNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white rounded-full p-3 hover:bg-white dark:hover:bg-gray-700 shadow-xl transition-all z-10"
                                    title="Next (→)"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            )}

                            {/* Close Button */}
                            <button
                                className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-xl transition-all"
                                onClick={() => setLightboxImage(null)}
                                title="Close (Esc)"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                );
            })()}



            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog !== null}
                onClose={() => setDeleteDialog(null)}
                onConfirm={() => {
                    if (deleteDialog?.type === 'event') {
                        handleDeleteEvent(deleteDialog.id);
                    } else if (deleteDialog?.type === 'image') {
                        handleDeleteImage(deleteDialog.id);
                    }
                }}
                title={deleteDialog?.type === 'event' ? 'Delete Event' : 'Delete Image'}
                message={
                    deleteDialog?.type === 'event'
                        ? 'Are you sure you want to delete this event? All associated images will also be deleted. This action cannot be undone.'
                        : 'Are you sure you want to delete this image? This action cannot be undone.'
                }
            />
        </div>
    );
}

// Keeping LotGallery for backward compatibility or for "Orphan" images not attached to events
export function LotGallery({ lotId, images }: { lotId: number, images: LotImage[] }) {
    const [isUploading, setIsUploading] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
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
                    setPreviews([]);
                }} className="mb-6 p-4 bg-gray-50 rounded border">
                    <div className="space-y-3">
                        <div className="flex flex-col gap-4">
                            {previews.length > 0 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {previews.map((preview, idx) => (
                                        <div key={idx} className="h-20 w-20 relative rounded overflow-hidden bg-gray-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={preview} alt={`Preview ${idx + 1}`} className="object-cover w-full h-full" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input
                                type="file"
                                name="images"
                                accept="image/*"
                                multiple
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
                                onClick={() => { setIsUploading(false); setPreviews([]); }}
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
