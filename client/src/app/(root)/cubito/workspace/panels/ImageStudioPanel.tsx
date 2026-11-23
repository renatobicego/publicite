"use client";

import { useCallback, useState } from "react";
import { Button, Tooltip } from "@nextui-org/react";
import {
    FaPlus,
    FaTrash,
    FaPenToSquare,
    FaDownload,
    FaFolderOpen,
    FaCheck,
    FaWandMagicSparkles,
} from "react-icons/fa6";
import { toastifyError } from "@/utils/functions/toastify";
import { compressDataUrl } from "@/utils/functions/compressDataUrl";
import SendToBlogModal from "@/app/(root)/(explorar)/producciones/components/SendToBlogModal";
import {
    MAX_STUDIO_IMAGES,
    MAX_STUDIO_REFERENCES,
    StudioImage,
    useWorkspace,
} from "../hooks/useWorkspace";
import { blobToDataUrl } from "../shared/blobToDataUrl";
import { dataUrlToFile } from "../shared/dataUrlToFile";
import ImageEditor from "./ImageEditor";

interface ImageStudioPanelProps {
    workspace: ReturnType<typeof useWorkspace>;
}

/** Nombre de archivo seguro para descargar o enviar al blog. */
const fileNameFor = (image: StudioImage) =>
    `${image.name.replace(/\.[^.]+$/, "").replace(/[^\p{L}\p{N}_-]+/gu, "-").slice(0, 50) || "imagen"}.jpg`;

/**
 * Panel izquierdo del Tablero de trabajo en el chat libre: el usuario sube sus
 * imágenes (o pasa las que generó Cubito), las edita y elige hasta
 * `MAX_STUDIO_REFERENCES` como referencia del generador de imágenes.
 * Las imágenes quedan en el navegador: no se suben hasta que se envían a un blog.
 */
export default function ImageStudioPanel({ workspace }: ImageStudioPanelProps) {
    const {
        studioImages,
        selectedStudioIds,
        addStudioImages,
        removeStudioImage,
        updateStudioImage,
        toggleStudioSelection,
        clearStudioSelection,
        isGeneratingImage,
    } = workspace;

    const [isReading, setIsReading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [editingImage, setEditingImage] = useState<StudioImage | null>(null);
    const [imageForBlog, setImageForBlog] = useState<StudioImage | null>(null);

    const isFull = studioImages.length >= MAX_STUDIO_IMAGES;

    const addFiles = useCallback(
        async (files: File[]) => {
            const images = files.filter((file) => file.type.startsWith("image/"));
            if (images.length === 0) {
                if (files.length > 0) toastifyError("Sólo se pueden agregar imágenes");
                return;
            }
            setIsReading(true);
            try {
                const read = await Promise.all(
                    images
                        .slice(0, MAX_STUDIO_IMAGES - studioImages.length)
                        .map(async (file) => ({
                            dataUrl: await compressDataUrl(await blobToDataUrl(file)),
                            name: file.name,
                            source: "upload" as const,
                        }))
                );
                addStudioImages(read);
            } catch {
                toastifyError("No se pudieron leer las imágenes");
            } finally {
                setIsReading(false);
            }
        },
        [addStudioImages, studioImages.length]
    );

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = "";
        addFiles(files);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (isFull) return;
        addFiles(Array.from(e.dataTransfer.files));
    };

    const handleEditSave = async (editedBlobUrl: string) => {
        if (!editingImage) return;
        try {
            const blob = await (await fetch(editedBlobUrl)).blob();
            updateStudioImage(editingImage.id, await compressDataUrl(await blobToDataUrl(blob)));
        } catch {
            toastifyError("No se pudo guardar la imagen editada");
        } finally {
            URL.revokeObjectURL(editedBlobUrl);
            setEditingImage(null);
        }
    };

    const download = (image: StudioImage) => {
        const link = document.createElement("a");
        link.href = image.dataUrl;
        link.download = fileNameFor(image);
        link.click();
    };

    return (
        <div
            className={`p-3 space-y-3 min-h-full transition-colors ${isDragging ? "bg-orange-50 dark:bg-slate-800" : ""}`}
            onDragOver={(e) => {
                if (!e.dataTransfer.types.includes("Files")) return;
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
            }}
            onDrop={handleDrop}
        >
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tus imágenes
                </h3>
                <span className="text-xs text-gray-400">
                    {studioImages.length}/{MAX_STUDIO_IMAGES}
                </span>
            </div>

            <label className="block">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isReading || isFull}
                />
                <Button
                    as="span"
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<FaPlus size={12} />}
                    className="w-full cursor-pointer"
                    isDisabled={isReading || isFull}
                    isLoading={isReading}
                >
                    {isReading ? "Cargando..." : "Subir imágenes"}
                </Button>
            </label>

            {studioImages.length === 0 ? (
                <div className="text-center py-8 px-2 text-gray-400 border-2 border-dashed border-default-200 rounded-xl">
                    <p className="text-xs">
                        Subí o arrastrá tus fotos y elegí cuáles usar en el generador:
                        Cubito las toma como base para la imagen nueva.
                    </p>
                </div>
            ) : (
                <>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Tocá una imagen para usarla de referencia (hasta {MAX_STUDIO_REFERENCES}).
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {studioImages.map((image) => {
                            const order = selectedStudioIds.indexOf(image.id);
                            const isSelected = order >= 0;
                            return (
                                <div
                                    key={image.id}
                                    className={`relative group rounded-lg overflow-hidden ring-2 transition-all ${
                                        isSelected ? "ring-secondary" : "ring-transparent"
                                    }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleStudioSelection(image.id)}
                                        disabled={isGeneratingImage}
                                        aria-pressed={isSelected}
                                        aria-label={isSelected ? "Dejar de usar como referencia" : "Usar como referencia"}
                                        className="block w-full"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={image.dataUrl}
                                            alt={image.name}
                                            className="w-full h-24 object-cover"
                                        />
                                    </button>
                                    {isSelected && (
                                        <span className="absolute top-1 left-1 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-white text-[10px] font-bold pointer-events-none">
                                            {order + 1}
                                        </span>
                                    )}
                                    {image.source === "generated" && (
                                        <span className="absolute bottom-1 left-1 z-10 rounded bg-black/60 px-1 text-[9px] text-white pointer-events-none">
                                            Cubito
                                        </span>
                                    )}
                                    <div className="absolute top-1 right-1 z-10 flex flex-col gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <Tooltip content="Editar" placement="right">
                                            <Button isIconOnly size="sm" variant="flat" className="bg-white/90 min-w-6 w-6 h-6" onPress={() => setEditingImage(image)} aria-label="Editar">
                                                <FaPenToSquare size={10} className="text-primary" />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip content="Enviar a mi blog" placement="right">
                                            <Button isIconOnly size="sm" variant="flat" className="bg-white/90 min-w-6 w-6 h-6" onPress={() => setImageForBlog(image)} aria-label="Enviar a mi blog">
                                                <FaFolderOpen size={10} className="text-purple-600" />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip content="Descargar" placement="right">
                                            <Button isIconOnly size="sm" variant="flat" className="bg-white/90 min-w-6 w-6 h-6" onPress={() => download(image)} aria-label="Descargar">
                                                <FaDownload size={10} className="text-blue-600" />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip content="Quitar" placement="right">
                                            <Button isIconOnly size="sm" variant="flat" className="bg-white/90 min-w-6 w-6 h-6" onPress={() => removeStudioImage(image.id)} aria-label="Quitar">
                                                <FaTrash size={10} className="text-danger" />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {selectedStudioIds.length > 0 && (
                <div className="rounded-xl border border-secondary-200 bg-secondary-50 dark:bg-slate-800 p-2.5 space-y-1.5">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-secondary-700 dark:text-secondary-300">
                        <FaCheck size={10} />
                        {selectedStudioIds.length} de referencia
                    </p>
                    <p className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                        <FaWandMagicSparkles size={10} className="mt-0.5 shrink-0" />
                        Escribí en el modo imagen qué querés hacer con ellas: cambiar el fondo, combinarlas, darles otro estilo…
                    </p>
                    <Button size="sm" variant="light" color="secondary" className="h-6 px-2 text-xs" onPress={clearStudioSelection}>
                        Quitar selección
                    </Button>
                </div>
            )}

            {editingImage && (
                <ImageEditor
                    isOpen={!!editingImage}
                    onClose={() => setEditingImage(null)}
                    imageUrl={editingImage.dataUrl}
                    onSave={handleEditSave}
                />
            )}

            <SendToBlogModal
                isOpen={!!imageForBlog}
                onClose={() => setImageForBlog(null)}
                subject="la imagen"
                getFile={() => dataUrlToFile(imageForBlog!.dataUrl, fileNameFor(imageForBlog!))}
            />
        </div>
    );
}
