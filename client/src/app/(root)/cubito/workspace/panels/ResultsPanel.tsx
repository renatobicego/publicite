"use client";

import { useState } from "react";
import { Button, Card, CardBody, Chip, Tooltip, Spinner } from "@nextui-org/react";
import { FaArrowRotateLeft, FaTrash, FaDownload, FaNewspaper } from "react-icons/fa6";
import { toastifyError } from "@/utils/functions/toastify";
import { getValuacionPostDraft } from "@/services/workspaceServices";
import { useRouter } from "next-nprogress-bar";
import type { useWorkspace } from "../hooks/useWorkspace";

interface ResultsPanelProps {
    workspace: ReturnType<typeof useWorkspace>;
}

export default function ResultsPanel({ workspace }: ResultsPanelProps) {
    const { savedValuaciones, savedMatchPostIds, matchResults, handleRestoreToBoard, handleDeleteValuacion, handleRemoveSavedMatch } = workspace;
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const router = useRouter();

    const savedMatches = matchResults.filter((m) => savedMatchPostIds.includes(m.postId));
    const hasResults = savedValuaciones.length > 0 || savedMatches.length > 0;

    // Generate a title for a valuación based on available data
    const getValuacionTitle = (v: (typeof savedValuaciones)[0]) => {
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

    const handlePublishAsAd = async (valuacionId: string) => {
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
            router.push(`/crear/anuncio?${params.toString()}`);
        } catch {
            toastifyError("Error al preparar el anuncio");
        }
        setLoadingAction(null);
    };

    return (
        <div className="p-3 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Resultados Guardados
            </h3>

            {!hasResults && (
                <div className="text-center py-8 text-gray-400">
                    <p className="text-xs">Los resultados guardados aparecen acá</p>
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
                            <Tooltip content="Volver a editar" size="sm">
                                <Button
                                    size="sm"
                                    variant="flat"
                                    isIconOnly
                                    onPress={() => handleRestore(v.id)}
                                    isLoading={loadingAction === `restore-${v.id}`}
                                    isDisabled={!!loadingAction}
                                    aria-label="Volver a editar"
                                >
                                    <FaArrowRotateLeft size={12} />
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
                                    aria-label="Descargar como imagen"
                                >
                                    <FaDownload size={12} />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Publicar como anuncio" size="sm" color="primary">
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    isIconOnly
                                    onPress={() => handlePublishAsAd(v.id)}
                                    isLoading={loadingAction === `publish-${v.id}`}
                                    isDisabled={!!loadingAction}
                                    aria-label="Publicar como anuncio"
                                >
                                    <FaNewspaper size={12} />
                                </Button>
                            </Tooltip>
                        </div>
                    </CardBody>
                </Card>
            ))}

            {/* Saved Matches */}
            {savedMatches.length > 0 && (
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mt-4">
                    Matches guardados
                </h4>
            )}
            {savedMatches.map((m) => (
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
