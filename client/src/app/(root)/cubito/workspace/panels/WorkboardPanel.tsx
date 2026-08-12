"use client";

import { Button } from "@nextui-org/react";
import { FaWandMagicSparkles, FaMagnifyingGlass } from "react-icons/fa6";
import { OrangeCubeIcon } from "@/components/buttons/ChatbotButton/OrangeCubeIcon";
import type { useWorkspace } from "../hooks/useWorkspace";
import CategorySelector from "../valuacion/CategorySelector";
import BriefProgress from "../valuacion/BriefProgress";
import ValuacionSticker from "../valuacion/ValuacionSticker";
import MatchResults from "../match/MatchResults";

interface WorkboardPanelProps {
    workspace: ReturnType<typeof useWorkspace>;
}

export default function WorkboardPanel({ workspace }: WorkboardPanelProps) {
    const { activeModule, valuacionStatus, valuacionResult, isProcessing } = workspace;

    // === IDLE STATE ===
    if (activeModule === "idle") {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6 p-8">
                <div className="w-20 h-20 opacity-50">
                    <OrangeCubeIcon />
                </div>
                <div>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Tablero de Trabajo
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Elegí un módulo para empezar a trabajar con Cubito
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        color="warning"
                        variant="shadow"
                        startContent={<FaWandMagicSparkles size={14} />}
                        onPress={() => workspace.setActiveModule("valuacion")}
                    >
                        Valuación IA
                    </Button>
                    <Button
                        color="secondary"
                        variant="shadow"
                        startContent={<FaMagnifyingGlass size={14} />}
                        onPress={() => workspace.setActiveModule("match")}
                    >
                        Match IA
                    </Button>
                </div>
            </div>
        );
    }

    // === VALUACIÓN ===
    if (activeModule === "valuacion") {
        // Category selection (before starting)
        if (valuacionStatus === "idle") {
            return (
                <div className="p-6">
                    <CategorySelector onSelect={workspace.handleStartValuacion} />
                </div>
            );
        }

        // Brief in progress
        if (valuacionStatus === "draft") {
            return (
                <div className="p-6">
                    <BriefProgress
                        layer={workspace.currentLayer}
                        completionPercent={workspace.completionPercent}
                        coveredFields={workspace.coveredFields}
                        briefComplete={workspace.briefComplete}
                    />
                </div>
            );
        }

        // Processing
        if (valuacionStatus === "processing" || isProcessing) {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="w-16 h-16 animate-pulse">
                        <OrangeCubeIcon />
                    </div>
                    <p className="text-sm text-gray-500">Generando valuación...</p>
                </div>
            );
        }

        // Result ready
        if ((valuacionStatus === "completed" || valuacionStatus === "saved") && valuacionResult) {
            return (
                <div className="p-4">
                    <ValuacionSticker result={valuacionResult} />
                    {valuacionStatus === "completed" && (
                        <div className="flex gap-2 mt-4 justify-center">
                            <Button size="sm" color="success" variant="shadow" onPress={workspace.handleSaveResult}>
                                Guardar
                            </Button>
                            <Button size="sm" color="danger" variant="flat" onPress={() => workspace.handleDeleteValuacion(valuacionResult.id)}>
                                Descartar
                            </Button>
                        </div>
                    )}
                </div>
            );
        }
    }

    // === MATCH ===
    if (activeModule === "match") {
        return (
            <div className="p-4">
                <MatchResults
                    status={workspace.matchStatus}
                    results={workspace.matchResults}
                    interpretation={workspace.matchInterpretation}
                    candidatesEvaluated={workspace.matchCandidatesEvaluated}
                    message={workspace.matchMessage}
                    savedPostIds={workspace.savedMatchPostIds}
                    onSave={workspace.handleSaveMatch}
                    isProcessing={workspace.isProcessing}
                />
            </div>
        );
    }

    return null;
}
