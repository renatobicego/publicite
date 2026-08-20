"use client";

import { useState } from "react";
import { Button, Card, CardBody, Chip, Tooltip, Spinner } from "@nextui-org/react";
import { FaEye, FaTrash, FaDownload, FaNewspaper } from "react-icons/fa6";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { getValuacionPostDraft } from "@/services/workspaceServices";
import { useRouter } from "next-nprogress-bar";
import { toPng } from "html-to-image";
import type { useWorkspace } from "../hooks/useWorkspace";

interface ResultsPanelProps {
    workspace: ReturnType<typeof useWorkspace>;
}

export default function ResultsPanel({ workspace }: ResultsPanelProps) {
    const { savedValuaciones, savedMatchPosts, handleRestoreToBoard, handleDeleteValuacion, handleRemoveSavedMatch, isLoadingSaved } = workspace;
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const router = useRouter();

    const hasResults = savedValuaciones.length > 0 || savedMatchPosts.length > 0;

    // Generate a title for a valuación based on available data
    const getValuacionTitle = (v: (typeof savedValuaciones)[0]) => {
        if (v.title) return v.title;
        if (v.photoAnalysis?.brand) {
            const brand = v.photoAnalysis.brand;
            const model = v.photoAnalysis.model;
            return model ? `${brand} ${model}` : brand;
        }
        if (v.category) {
            const labels: Record<string, string> = {
                imagen: "Valuación de Imagen",
                objeto: "Valuación de Objeto",
                servicio: "Valuación de Servicio",
                bien: "Valuación de Bien",
                otro: "Valuación",
            };
            return labels[v.category] || "Valuación";
        }
        return "Valuación";
    };

    // Determine if the valuación represents a service
    const isServicio = (v: (typeof savedValuaciones)[0]) => {
        if (v.category === "servicio") return true;
        if (v.title && /servicio/i.test(v.title)) return true;
        return false;
    };

    const handleRestore = async (id: string) => {
        setLoadingAction(`restore-${id}`);
        await handleRestoreToBoard(id);
        setLoadingAction(null);
    };

    const handleDelete = async (id: string) => {
        setLoadingAction(`delete-${id}`);
        await handleDeleteValuacion(id);
        setLoadingAction(null);
    };

    const handlePublishAsAd = async (valuacionId: string, isService: boolean) => {
        setLoadingAction(`publish-${valuacionId}`);
        try {
            const draft = await getValuacionPostDraft(valuacionId);
            if (draft && "error" in draft) {
                toastifyError(draft.error);
                setLoadingAction(null);
                return;
            }
            // Navigate to create ad page with draft data as query params
            const params = new URLSearchParams();
            params.set("fromValuacion", valuacionId);
            if (draft.title) params.set("title", draft.title);
            if (draft.description) params.set("description", draft.description);
            if (draft.suggestedPrice) params.set("price", String(draft.suggestedPrice));
            if (draft.imageUrls && draft.imageUrls.length > 0) {
                params.set("images", draft.imageUrls.join(","));
            }
            if (isService) {
                params.set("type", "service");
            }
            router.push(`/crear/anuncio?${params.toString()}`);
        } catch {
            toastifyError("Error al preparar el anuncio");
        }
        setLoadingAction(null);
    };

    const handleDownloadSticker = async (valuacionId: string) => {
        setLoadingAction(`download-${valuacionId}`);
        try {
            // If the sticker is not currently rendered, open it first
            let stickerEl = document.getElementById("valuacion-sticker");
            if (!stickerEl) {
                await handleRestoreToBoard(valuacionId);
                // Wait for the DOM to render the sticker
                await new Promise((resolve) => setTimeout(resolve, 300));
                stickerEl = document.getElementById("valuacion-sticker");
            }
            if (!stickerEl) {
                toastifyError("No se pudo cargar la valuación para descargar");
                setLoadingAction(null);
                return;
            }
            const dataUrl = await toPng(stickerEl, { quality: 0.95, pixelRatio: 2 });
            const link = document.createElement("a");
            link.download = `valuacion-${valuacionId}.png`;
            link.href = dataUrl;
            link.click();
            toastifySuccess("Imagen descargada");
        } catch {
            toastifyError("Error al generar la imagen");
        }
        setLoadingAction(null);
    };

    return (
        <div className="p-3 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Resultados Guardados
            </h3>

            {!hasResults && !isLoadingSaved && (
                <div className="text-center py-8 text-gray-400">
                    <p className="text-xs">Los resultados guardados aparecen acá</p>
                </div>
            )}

            {isLoadingSaved && (
                <div className="flex justify-center py-8">
                    <Spinner size="sm" color="warning" />
                </div>
            )}

            {/* Saved Valuaciones */}
            {savedValuaciones.map((v) => (
                <Card key={v.id} className="shadow-sm">
                    <CardBody className="p-3 space-y-2">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {getValuacionTitle(v)}
                        </p>
                        <div className="flex items-center justify-between">
                            <Chip size="sm" color="warning" variant="flat">
                                Capa {v.layer}
                            </Chip>
                            <span className="text-xs text-gray-500">
                                {v.finalScore ? `★ ${v.finalScore.toFixed(1)}` : "—"}
                            </span>
                        </div>
                        {v.estimatedValues?.mercado && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Valor de mercado: <strong>USD {v.estimatedValues.mercado}</strong>
                            </p>
                        )}
                        <div className="flex gap-1 flex-wrap">
                            <Tooltip content="Ver informe" size="sm">
                                <Button
                                    size="sm"
                                    variant="flat"
                                    isIconOnly
                                    onPress={() => handleRestore(v.id)}
                                    isLoading={loadingAction === `restore-${v.id}`}
                                    isDisabled={!!loadingAction}
                                    aria-label="Ver informe"
                                >
                                    <FaEye size={12} />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Eliminar" size="sm" color="danger">
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color="danger"
                                    isIconOnly
                                    onPress={() => handleDelete(v.id)}
                                    isLoading={loadingAction === `delete-${v.id}`}
                                    isDisabled={!!loadingAction}
                                    aria-label="Eliminar"
                                >
                                    <FaTrash size={12} />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Descargar como imagen" size="sm">
                                <Button
                                    size="sm"
                                    variant="flat"
                                    isIconOnly
                                    isDisabled={!!loadingAction}
                                    isLoading={loadingAction === `download-${v.id}`}
                                    onPress={() => handleDownloadSticker(v.id)}
                                    aria-label="Descargar como imagen"
                                >
                                    <FaDownload size={12} />
                                </Button>
                            </Tooltip>
                            <Tooltip content={isServicio(v) ? "Publicar como servicio" : "Publicar como anuncio"} size="sm" color="primary">
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    isIconOnly
                                    onPress={() => handlePublishAsAd(v.id, isServicio(v))}
                                    isLoading={loadingAction === `publish-${v.id}`}
                                    isDisabled={!!loadingAction}
                                    aria-label={isServicio(v) ? "Publicar como servicio" : "Publicar como anuncio"}
                                >
                                    <FaNewspaper size={12} />
                                </Button>
                            </Tooltip>
                        </div>
                    </CardBody>
                </Card>
            ))}

            {/* Saved Matches */}
            {savedMatchPosts.length > 0 && (
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mt-4">
                    Matches guardados
                </h4>
            )}
            {savedMatchPosts.map((m) => (
                <Card key={m.postId} className="shadow-sm">
                    <CardBody className="p-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate flex-1">{m.title}</p>
                            <Chip size="sm" color="secondary" variant="flat">
                                {m.relevanceScore}%
                            </Chip>
                        </div>
                        {m.price > 0 && (
                            <p className="text-xs text-gray-500">${m.price}</p>
                        )}
                        <div className="flex gap-1 mt-2">
                            <Tooltip content="Quitar de guardados" size="sm" color="danger">
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color="danger"
                                    isIconOnly
                                    onPress={() => handleRemoveSavedMatch(m.postId)}
                                    isDisabled={!!loadingAction}
                                    aria-label="Quitar de guardados"
                                >
                                    <FaTrash size={12} />
                                </Button>
                            </Tooltip>
                            <Button
                                size="sm"
                                variant="flat"
                                color="primary"
                                as="a"
                                href={`/anuncios/${m.postId}`}
                                target="_blank"
                            >
                                Ver anuncio
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}
