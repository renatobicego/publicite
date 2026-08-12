"use client";

import { Button, Card, CardBody, Chip, Image } from "@nextui-org/react";
import { FaBookmark, FaArrowUpRightFromSquare } from "react-icons/fa6";
import { OrangeCubeIcon } from "@/components/buttons/ChatbotButton/OrangeCubeIcon";
import { MatchedPost } from "@/types/workspaceTypes";

interface MatchResultsProps {
    status: "idle" | "searching" | "results";
    results: MatchedPost[];
    interpretation: string | null;
    candidatesEvaluated: number;
    message: string | null;
    savedPostIds: string[];
    onSave: (postId: string) => void;
    isProcessing: boolean;
}

export default function MatchResults({
    status,
    results,
    interpretation,
    candidatesEvaluated,
    message,
    savedPostIds,
    onSave,
    isProcessing,
}: MatchResultsProps) {
    // Idle / initial
    if (status === "idle") {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="w-16 h-16 opacity-50">
                    <OrangeCubeIcon />
                </div>
                <p className="text-sm text-gray-500">
                    Describí lo que buscás, subí una imagen o seleccioná un anuncio de referencia
                </p>
            </div>
        );
    }

    // Searching
    if (status === "searching" || isProcessing) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-16 h-16 animate-pulse">
                    <OrangeCubeIcon />
                </div>
                <p className="text-sm text-gray-500">Buscando coincidencias...</p>
            </div>
        );
    }

    // No results
    if (results.length === 0 && message) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 p-6">
                <div className="w-16 h-16 opacity-30">
                    <OrangeCubeIcon />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
            </div>
        );
    }

    // Results
    return (
        <div className="space-y-3">
            {/* Interpretation header */}
            {interpretation && (
                <div className="bg-secondary-50 dark:bg-secondary-900/20 rounded-lg p-3">
                    <p className="text-xs text-secondary-700 dark:text-secondary-300">
                        <strong>Cubito interpretó:</strong> {interpretation}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {candidatesEvaluated} anuncios evaluados
                    </p>
                </div>
            )}

            {/* Match cards */}
            {results.map((match) => {
                const isSaved = savedPostIds.includes(match.postId);
                return (
                    <Card key={match.postId} className="shadow-sm">
                        <CardBody className="p-3">
                            <div className="flex gap-3">
                                {/* Image */}
                                <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-slate-800">
                                    {match.imageUrl ? (
                                        <Image
                                            src={match.imageUrl}
                                            alt={match.title}
                                            className="w-full h-full object-cover"
                                            radius="none"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                            Sin img
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-1">
                                        <p className="text-sm font-medium truncate">{match.title}</p>
                                        <Chip size="sm" color="secondary" variant="flat">
                                            {match.relevanceScore}%
                                        </Chip>
                                    </div>
                                    {match.price > 0 && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400">${match.price}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{match.matchReason}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-2 justify-end">
                                <Button
                                    size="sm"
                                    variant={isSaved ? "solid" : "flat"}
                                    color="warning"
                                    startContent={<FaBookmark size={10} />}
                                    onPress={() => onSave(match.postId)}
                                    isDisabled={isSaved}
                                >
                                    {isSaved ? "Guardado" : "Guardar"}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    startContent={<FaArrowUpRightFromSquare size={10} />}
                                    as="a"
                                    href={`/anuncios/${match.postId}`}
                                    target="_blank"
                                >
                                    Ver
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                );
            })}
        </div>
    );
}
