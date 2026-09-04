"use client";

import { useState, useRef, useEffect } from "react";
import { Button, ScrollShadow, Modal, ModalContent, ModalBody } from "@nextui-org/react";
import {
    FaWandMagicSparkles,
    FaMagnifyingGlass,
    FaArrowLeft,
    FaPaperPlane,
    FaImage,
    FaDownload,
    FaPenToSquare,
} from "react-icons/fa6";
import { OrangeCubeIcon } from "@/components/buttons/ChatbotButton/OrangeCubeIcon";
import { CustomInputWithoutFormik } from "@/components/inputs/CustomInputs";
import AvatarSelector from "../../avatars/AvatarSelector";
import { parseMarkdown } from "../shared/parseMarkdown";
import type { useWorkspace } from "../hooks/useWorkspace";
import CategorySelector from "../valuacion/CategorySelector";
import BriefProgress from "../valuacion/BriefProgress";
import ValuacionSticker from "../valuacion/ValuacionSticker";
import MatchResults from "../match/MatchResults";
import WorkspaceChat from "../WorkspaceChat";
import ImageEditor from "./ImageEditor";

interface WorkboardPanelProps {
    workspace: ReturnType<typeof useWorkspace>;
}

export default function WorkboardPanel({ workspace }: WorkboardPanelProps) {
    const { activeModule } = workspace;

    if (activeModule === "chat" || activeModule === "idle") {
        return <FreeChatPanel workspace={workspace} />;
    }

    return <ModulePanel workspace={workspace} />;
}

// =============================================================
// CHAT LIBRE - Estado por defecto del tablero
// =============================================================

function FreeChatPanel({ workspace }: WorkboardPanelProps) {
    const {
        chatMessages,
        isChatProcessing,
        selectedAvatarId,
        setSelectedAvatarId,
        generatedImages,
        isGeneratingImage,
        handleSendChatMessage,
        handleGenerateImage,
        setActiveModule,
    } = workspace;

    const [inputValue, setInputValue] = useState("");
    const [isImageMode, setIsImageMode] = useState(false);
    const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isChatProcessing || isGeneratingImage) return;

        if (isImageMode) {
            handleGenerateImage(inputValue);
        } else {
            handleSendChatMessage(inputValue);
        }
        setInputValue("");
    };

    const getImageById = (id: string) => generatedImages.find((img) => img.id === id);

    return (
        <div className="flex flex-col h-full">
            {/* ===== MÓDULOS DESTACADOS ===== */}
            <div className="border-b border-divider bg-gradient-to-r from-orange-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 px-4 py-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    Herramientas IA
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => setActiveModule("valuacion")}
                        className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-700 border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 transition-all shadow-sm hover:shadow-md group"
                    >
                        <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FaWandMagicSparkles size={16} className="text-orange-600" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Valuación IA</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">Valuá objetos, servicios e imágenes</p>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveModule("match")}
                        className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-700 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all shadow-sm hover:shadow-md group"
                    >
                        <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FaMagnifyingGlass size={16} className="text-purple-600" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Match IA</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">Encontrá anuncios relevantes</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* ===== ÁREA DE CHAT ===== */}
            <ScrollShadow ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-3 py-12">
                        <div className="w-16 h-16 opacity-40">
                            <OrangeCubeIcon />
                        </div>
                        <div>
                            <p className="text-base font-medium text-gray-600 dark:text-gray-300">
                                Chateá con Cubito
                            </p>
                            <p className="text-sm text-gray-400 mt-1 max-w-sm">
                                Preguntame lo que quieras, pedí que genere imágenes, o usá las herramientas de Valuación y Match de arriba.
                            </p>
                        </div>
                    </div>
                ) : (
                    chatMessages.map((msg) => {
                        // Check if it's a generated image message
                        const isImageMsg = msg.role === "assistant" && msg.content.startsWith("__IMAGE__");
                        const imageId = isImageMsg ? msg.content.replace("__IMAGE__", "") : null;
                        const imageData = imageId ? getImageById(imageId) : null;

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === "user"
                                        ? "bg-service text-white rounded-br-none"
                                        : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-none"
                                        }`}
                                >
                                    {isImageMsg && imageData ? (
                                        <div className="space-y-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={imageData.base64.startsWith("data:") ? imageData.base64 : `data:image/png;base64,${imageData.base64}`}
                                                alt={imageData.prompt}
                                                onClick={() => {
                                                    const src = imageData.base64.startsWith("data:") ? imageData.base64 : `data:image/png;base64,${imageData.base64}`;
                                                    setPreviewImageUrl(src);
                                                }}
                                                className="rounded-lg w-full max-w-sm object-contain cursor-zoom-in transition-transform hover:scale-[1.02]"
                                            />
                                            <p className="text-xs opacity-70">&ldquo;{imageData.prompt}&rdquo;</p>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        const link = document.createElement("a");
                                                        link.href = imageData.base64.startsWith("data:") ? imageData.base64 : `data:image/png;base64,${imageData.base64}`;
                                                        link.download = `cubito-${imageData.id}.png`;
                                                        link.click();
                                                    }}
                                                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                                >
                                                    <FaDownload size={11} />
                                                    Descargar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const src = imageData.base64.startsWith("data:") ? imageData.base64 : `data:image/png;base64,${imageData.base64}`;
                                                        setEditingImageUrl(src);
                                                    }}
                                                    className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
                                                >
                                                    <FaPenToSquare size={11} />
                                                    Editar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm md:text-base leading-relaxed">
                                            {parseMarkdown(msg.content)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Loading indicator */}
                {(isChatProcessing || isGeneratingImage) && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm bg-gray-100 dark:bg-slate-700 rounded-bl-none">
                            <div className="flex items-center gap-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                </div>
                                <span className="text-xs text-gray-500">
                                    {isGeneratingImage ? "Generando imagen..." : "Cubito está pensando..."}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </ScrollShadow>

            {/* ===== INPUT AREA ===== */}
            <div className="border-t border-divider p-3 bg-white dark:bg-slate-900 shrink-0">
                <div className="flex items-center gap-2 mb-2">
                    <AvatarSelector
                        selectedAvatarId={selectedAvatarId}
                        onSelect={setSelectedAvatarId}
                        isDisabled={isChatProcessing || isGeneratingImage}
                    />
                    <Button
                        size="sm"
                        variant={isImageMode ? "shadow" : "flat"}
                        color={isImageMode ? "secondary" : "default"}
                        startContent={<FaImage size={12} />}
                        onPress={() => setIsImageMode(!isImageMode)}
                        className="min-w-fit"
                    >
                        {isImageMode ? "Modo imagen" : "Generar imagen"}
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <CustomInputWithoutFormik
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={
                            isImageMode
                                ? "Describí la imagen que querés generar..."
                                : "Escribí tu mensaje a Cubito..."
                        }
                        disabled={isChatProcessing || isGeneratingImage}
                    />
                    <Button
                        isIconOnly
                        type="submit"
                        radius="full"
                        isDisabled={isChatProcessing || isGeneratingImage || !inputValue.trim()}
                        className="text-white bg-service h-10 w-10"
                    >
                        <FaPaperPlane size={14} />
                    </Button>
                </form>
            </div>

            {/* Image Editor Modal for generated images */}
            {editingImageUrl && (
                <ImageEditor
                    isOpen={!!editingImageUrl}
                    onClose={() => setEditingImageUrl(null)}
                    imageUrl={editingImageUrl}
                    onSave={(editedUrl) => {
                        // Download the edited image
                        const link = document.createElement("a");
                        link.href = editedUrl;
                        link.download = `cubito-edited-${Date.now()}.png`;
                        link.click();
                        URL.revokeObjectURL(editedUrl);
                        setEditingImageUrl(null);
                    }}
                />
            )}

            {/* Image Preview (lightbox) for generated images */}
            <Modal
                isOpen={!!previewImageUrl}
                onClose={() => setPreviewImageUrl(null)}
                size="4xl"
                backdrop="blur"
                classNames={{ base: "bg-transparent shadow-none", body: "p-0" }}
            >
                <ModalContent>
                    <ModalBody>
                        {previewImageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={previewImageUrl}
                                alt="Vista previa"
                                className="w-full max-h-[85vh] object-contain rounded-xl"
                            />
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
}

// =============================================================
// PANEL DE MÓDULOS (Valuación / Match) - Cuando se selecciona uno
// =============================================================

function ModulePanel({ workspace }: WorkboardPanelProps) {
    const { activeModule, valuacionStatus, valuacionResult, isProcessing } = workspace;

    return (
        <div className="flex flex-col h-full">
            {/* Back button */}
            <div className="px-4 py-2 border-b border-divider flex items-center gap-2 bg-white dark:bg-slate-900">
                <Button
                    size="sm"
                    variant="light"
                    startContent={<FaArrowLeft size={12} />}
                    onPress={() => workspace.resetWorkspace()}
                >
                    Volver al chat
                </Button>
                <span className="text-xs font-medium text-gray-500">
                    {activeModule === "valuacion" ? "⚡ Valuación IA" : "🔍 Match IA"}
                </span>
            </div>

            {/* Main content area */}
            <div className="flex-1 overflow-y-auto">
                {activeModule === "valuacion" && renderValuacion(workspace, valuacionStatus, valuacionResult, isProcessing)}
                {activeModule === "match" && (
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
                )}
            </div>

            {/* Chat integrated in the panel */}
            <WorkspaceChat workspace={workspace} />
        </div>
    );
}

function renderValuacion(
    workspace: ReturnType<typeof useWorkspace>,
    valuacionStatus: string,
    valuacionResult: ReturnType<typeof useWorkspace>["valuacionResult"],
    isProcessing: boolean
) {
    // Category selection
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
                    briefItems={workspace.briefItems}
                    title={workspace.valuacionTitle}
                    briefComplete={workspace.briefComplete}
                />
            </div>
        );
    }

    // Processing
    if (valuacionStatus === "processing" || (isProcessing && valuacionStatus !== "completed")) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
                <div className="w-16 h-16 animate-pulse">
                    <OrangeCubeIcon />
                </div>
                <p className="text-sm text-gray-500">
                    {valuacionStatus === "processing" ? "Generando valuación..." : "Analizando imágenes y datos..."}
                </p>
                <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
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

    return null;
}
