"use client";

import { useCallback } from "react";
import { Button, Image } from "@nextui-org/react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { useUploadThing } from "@/utils/uploadThing";
import { toastifyError } from "@/utils/functions/toastify";
import imageCompression from "browser-image-compression";
import { ReferenceImage } from "@/types/workspaceTypes";

interface ReferencesPanelProps {
    references: ReferenceImage[];
    onAdd: (image: ReferenceImage) => void;
    onRemove: (id: string) => void;
    onUpdateUrl: (id: string, newUrl: string) => void;
    activeModule?: string;
    onImageUploadedForMatch?: (url: string) => void;
}

export default function ReferencesPanel({ references, onAdd, onRemove, activeModule, onImageUploadedForMatch }: ReferencesPanelProps) {
    const { startUpload, isUploading } = useUploadThing("fileUploader", {
        onUploadError: (e) => {
            toastifyError(`Error al subir imagen: ${e.message}`);
        },
    });

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files).slice(0, 10 - references.length);

        try {
            const compressed = await Promise.all(
                fileArray.map((file) =>
                    imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true })
                )
            );

            const uploadRes = await startUpload(compressed);
            if (!uploadRes) return;

            const uploadedUrls: string[] = [];
            uploadRes.forEach((file) => {
                onAdd({
                    id: Math.random().toString(36).substring(2, 9),
                    url: file.url,
                    uploadedAt: new Date(),
                });
                uploadedUrls.push(file.url);
            });

            // Auto-trigger match when uploading images in match mode
            if (activeModule === "match" && onImageUploadedForMatch && uploadedUrls.length > 0) {
                onImageUploadedForMatch(uploadedUrls[0]);
            }
        } catch {
            toastifyError("Error al procesar las imágenes");
        }

        // Reset input
        e.target.value = "";
    }, [references.length, startUpload, onAdd]);

    return (
        <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Referencias
                </h3>
                <span className="text-xs text-gray-400">{references.length}/10</span>
            </div>

            {/* Upload button */}
            <label className="block">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading || references.length >= 10}
                />
                <Button
                    as="span"
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<FaPlus size={12} />}
                    className="w-full cursor-pointer"
                    isDisabled={isUploading || references.length >= 10}
                    isLoading={isUploading}
                >
                    {isUploading ? "Subiendo..." : "Agregar imágenes"}
                </Button>
            </label>

            {/* Image grid */}
            {references.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <p className="text-xs">Subí imágenes para usarlas en la valuación o match</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {references.map((ref) => (
                        <div key={ref.id} className="relative group rounded-lg overflow-hidden">
                            <Image
                                src={ref.url}
                                alt="Referencia"
                                className="w-full h-24 object-cover"
                                radius="sm"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="flat"
                                    className="bg-white/80 min-w-6 w-6 h-6"
                                    onPress={() => onRemove(ref.id)}
                                >
                                    <FaTrash size={10} className="text-danger" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
