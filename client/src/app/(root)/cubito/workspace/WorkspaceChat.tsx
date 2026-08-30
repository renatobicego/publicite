"use client";

import { useState, useRef, useEffect } from "react";
import { Button, ScrollShadow, Chip } from "@nextui-org/react";
import { FaPaperPlane, FaWandMagicSparkles, FaMagnifyingGlass, FaForward, FaRegCopy, FaCheck } from "react-icons/fa6";
import { CustomInputWithoutFormik } from "@/components/inputs/CustomInputs";
import type { useWorkspace } from "./hooks/useWorkspace";

interface WorkspaceChatProps {
    workspace: ReturnType<typeof useWorkspace>;
}

function CopyMessageButton({
    text,
    variant = "bot",
}: {
    text: string;
    variant?: "user" | "bot";
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!text) return;
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = text;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("No se pudo copiar el mensaje", err);
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Mensaje copiado" : "Copiar mensaje"}
            title={copied ? "Copiado" : "Copiar mensaje"}
            className={`mt-1 inline-flex items-center gap-1 text-xs transition-colors ${variant === "user"
                ? "text-orange-100 hover:text-white"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                }`}
        >
            {copied ? <FaCheck size={11} /> : <FaRegCopy size={11} />}
            <span>{copied ? "Copiado" : "Copiar"}</span>
        </button>
    );
}

export default function WorkspaceChat({ workspace }: WorkspaceChatProps) {
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        isProcessing,
        activeModule,
        valuacionStatus,
        briefComplete,
        limitReached,
        limitMessage,
        handleSendValuacionMessage,
        handleSkipQuestion,
        handleGenerateResult,
        handleSearchMatch,
        setActiveModule,
    } = workspace;

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isProcessing) return;

        if (activeModule === "valuacion" && valuacionStatus === "draft") {
            // Images come from references automatically inside the hook
            handleSendValuacionMessage(inputValue);
        } else if (activeModule === "match" || activeModule === "idle" || activeModule === "chat") {
            const imageUrls = workspace.references.map((r) => r.url).filter(Boolean);
            handleSearchMatch(inputValue, imageUrls.length > 0 ? imageUrls : undefined);
        }

        setInputValue("");
    };

    const isInputDisabled = isProcessing || limitReached || valuacionStatus === "processing" || valuacionStatus === "completed";

    return (
        <div className="border-t border-divider bg-white dark:bg-slate-900">
            {/* Messages area */}
            {messages.length > 0 && (
                <ScrollShadow ref={scrollRef} className="max-h-72 overflow-y-auto px-4 py-2 space-y-2">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-md px-3 py-2 rounded-xl text-sm ${msg.role === "user"
                                    ? "bg-service text-white rounded-br-none"
                                    : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-none"
                                    }`}
                            >
                                <div>{msg.content}</div>
                                <CopyMessageButton
                                    text={msg.content}
                                    variant={msg.role === "user" ? "user" : "bot"}
                                />
                            </div>
                        </div>
                    ))}
                    {isProcessing && (
                        <div className="flex justify-start">
                            <div className="max-w-md px-3 py-2 rounded-xl text-sm bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-none">
                                <div className="flex items-center gap-2">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                    </div>
                                    <span className="text-xs text-gray-500">Analizando...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </ScrollShadow>
            )}

            {/* Limit reached banner */}
            {limitReached && limitMessage && (
                <div className="px-4 py-2 bg-warning-50 border-t border-warning-200">
                    <p className="text-sm text-warning-700">
                        {limitMessage.split(/(https?:\/\/[^\s),]+)/).map((part, i) =>
                            part.match(/^https?:\/\//) ? (
                                <a
                                    key={i}
                                    href={part}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    {part}
                                </a>
                            ) : (
                                <span key={i}>{part}</span>
                            )
                        )}
                    </p>
                </div>
            )}

            {/* Action buttons + input */}
            <div className="px-4 py-3">
                {/* Module action buttons */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {activeModule === "idle" && (
                        <>
                            <Chip
                                startContent={<FaWandMagicSparkles size={12} />}
                                variant="flat"
                                color="warning"
                                className="cursor-pointer"
                                onClick={() => setActiveModule("valuacion")}
                            >
                                Valuación IA
                            </Chip>
                            <Chip
                                startContent={<FaMagnifyingGlass size={12} />}
                                variant="flat"
                                color="secondary"
                                className="cursor-pointer"
                                onClick={() => setActiveModule("match")}
                            >
                                Match IA
                            </Chip>
                        </>
                    )}

                    {activeModule === "valuacion" && valuacionStatus === "draft" && (
                        <>
                            <Button
                                size="sm"
                                variant="flat"
                                color="default"
                                startContent={<FaForward size={12} />}
                                onPress={handleSkipQuestion}
                                isDisabled={isProcessing}
                            >
                                Omitir
                            </Button>
                            {briefComplete && (
                                <Button
                                    size="sm"
                                    variant="shadow"
                                    color="success"
                                    startContent={<FaWandMagicSparkles size={12} />}
                                    onPress={handleGenerateResult}
                                    isDisabled={isProcessing}
                                >
                                    Generar Resultado
                                </Button>
                            )}
                        </>
                    )}
                </div>

                {/* Input form */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <CustomInputWithoutFormik
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={
                            activeModule === "valuacion" && valuacionStatus === "draft"
                                ? "Respondé la pregunta de Cubito..."
                                : activeModule === "match"
                                    ? "Describí qué buscás..."
                                    : "Escribí tu mensaje..."
                        }
                        disabled={isInputDisabled}
                    />
                    <Button
                        isIconOnly
                        type="submit"
                        radius="full"
                        isDisabled={isInputDisabled || !inputValue.trim()}
                        className="text-white bg-service h-10 w-10"
                    >
                        <FaPaperPlane size={14} />
                    </Button>
                </form>
            </div>
        </div>
    );
}
