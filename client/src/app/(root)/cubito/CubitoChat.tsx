"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    ScrollShadow,
} from "@nextui-org/react";
import { FaPaperPlane } from "react-icons/fa6";
import { CustomInputWithoutFormik } from "@/components/inputs/CustomInputs";
import { useChatbot } from "@/components/buttons/ChatbotButton/useChatbot";
import { ActiveStepInput } from "@/components/buttons/ChatbotButton/CreateAdWizard/CreateAdWizard";
import { OrangeCubeIcon } from "@/components/buttons/ChatbotButton/OrangeCubeIcon";

export default function CubitoChat() {
    const {
        messages,
        status,
        showCreateAdButton,
        isSubmittingAd,
        wizard,
        handleSendMessage,
        handleStartCreateAd,
        handleSubmitAd,
    } = useChatbot();

    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isWizardActive =
        wizard.step !== "idle" &&
        wizard.step !== "done" &&
        wizard.step !== "error";

    const isLoading = status === "in_progress";

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, wizard.messages, wizard.step]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading && !isWizardActive) {
            handleSendMessage(inputValue);
            setInputValue("");
        }
    };

    const parseInline = (text: string) => {
        if (text.startsWith("### ")) {
            return (
                <h5 className="font-semibold mt-4 mb-2">
                    {parseInline(text.replace(/^###\s*/, ""))}
                </h5>
            );
        }
        const elements: React.ReactNode[] = [];
        const regex = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)/g;
        let lastIndex = 0;
        let match;
        let key = 0;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                elements.push(
                    <span key={key++}>{text.slice(lastIndex, match.index)}</span>
                );
            }
            if (match[1]) {
                elements.push(
                    <a
                        key={key++}
                        href={match[3]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                    >
                        {match[2]}
                    </a>
                );
            }
            if (match[4]) {
                elements.push(<strong key={key++}>{match[5]}</strong>);
            }
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < text.length) {
            elements.push(<span key={key++}>{text.slice(lastIndex)}</span>);
        }
        return elements;
    };

    const parseAndRenderText = (text: string) => {
        const lines = text.split("\n");
        const elements: React.ReactNode[] = [];
        let inList = false;
        let listItems: React.ReactNode[] = [];

        lines.forEach((line, idx) => {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith("## ")) {
                if (inList && listItems.length > 0) {
                    elements.push(
                        <ul key={`list-${elements.length}`} className="list-disc space-y-1">
                            {listItems}
                        </ul>
                    );
                    inList = false;
                    listItems = [];
                }
                elements.push(
                    <h2 key={idx} className="text-lg font-semibold mt-4 mb-2">
                        {parseInline(trimmedLine.replace(/^##\s+/, ""))}
                    </h2>
                );
                return;
            }

            const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
            if (numberedMatch) {
                if (!inList) {
                    inList = true;
                    listItems = [];
                }
                listItems.push(
                    <li key={idx} className="ml-4 mb-2">
                        {parseInline(numberedMatch[1])}
                    </li>
                );
                return;
            }

            if (inList && listItems.length > 0) {
                elements.push(
                    <ul key={`list-${elements.length}`} className="list-disc space-y-1">
                        {listItems}
                    </ul>
                );
                inList = false;
                listItems = [];
            }

            if (trimmedLine === "") {
                elements.push(<div key={idx} className="h-2" />);
                return;
            }

            elements.push(
                <p key={idx} className="text-sm md:text-base leading-relaxed">
                    {parseInline(trimmedLine)}
                </p>
            );
        });

        if (inList && listItems.length > 0) {
            elements.push(
                <ul key={`list-${elements.length}`} className="list-disc space-y-1">
                    {listItems}
                </ul>
            );
        }

        return elements;
    };

    return (
        <Card className="w-full max-w-3xl h-[calc(100vh-200px)] min-h-[500px] shadow-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            {/* Header */}
            <CardHeader className="flex items-center gap-3 border-b border-orange-200 dark:border-orange-900 bg-service text-white px-6 py-4">
                <div className="w-28 h-20">
                    <OrangeCubeIcon />
                </div>
                <div>
                    <h1 className="text-xl font-semibold">Cubito</h1>
                    <p className="text-xs text-orange-100">
                        Tu asistente de Publicite
                    </p>
                </div>
            </CardHeader>

            {/* Messages Container */}
            <CardBody className="flex-1 overflow-hidden p-0">
                <ScrollShadow className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 && !isWizardActive ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 gap-4">
                            <div className="w-20 h-20 opacity-50">
                                <OrangeCubeIcon />
                            </div>
                            <div>
                                <p className="text-lg font-medium">¡Hola! Soy Cubito</p>
                                <p className="text-sm mt-1">
                                    Preguntame lo que quieras sobre Publicite o pedime que te
                                    ayude a crear un anuncio.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Regular chat messages */}
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-lg px-5 py-3 rounded-2xl ${message.role === "user"
                                            ? "bg-service text-white rounded-br-none"
                                            : "bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 rounded-bl-none shadow-sm"
                                            }`}
                                    >
                                        {message.parts.map((part, idx) => {
                                            if (part.type === "text") {
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="text-sm md:text-base leading-relaxed"
                                                    >
                                                        {parseAndRenderText(part.text)}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Create Ad Button */}
                            {showCreateAdButton && (
                                <div className="flex justify-start">
                                    <Button
                                        size="md"
                                        color="primary"
                                        variant="shadow"
                                        onPress={handleStartCreateAd}
                                        className="mt-2"
                                    >
                                        Crear anuncio aquí
                                    </Button>
                                </div>
                            )}

                            {/* Wizard messages */}
                            {wizard.messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-lg px-5 py-3 rounded-2xl ${msg.role === "user"
                                            ? "bg-service text-white rounded-br-none"
                                            : "bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 rounded-bl-none shadow-sm"
                                            }`}
                                    >
                                        <div className="text-sm md:text-base leading-relaxed">
                                            {parseAndRenderText(msg.content)}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Active wizard step input */}
                            {isWizardActive && (
                                <div className="flex justify-start w-full">
                                    <div className="max-w-lg w-full">
                                        <ActiveStepInput
                                            step={wizard.step}
                                            wizard={wizard}
                                            onSubmitAd={handleSubmitAd}
                                            isSubmitting={isSubmittingAd}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 px-5 py-3 rounded-2xl rounded-bl-none shadow-sm">
                                <div className="flex space-x-2">
                                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" />
                                    <div
                                        className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.1s" }}
                                    />
                                    <div
                                        className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.2s" }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </ScrollShadow>
            </CardBody>

            {/* Input Form */}
            <div className="border-t border-gray-200 dark:border-slate-600 p-4 md:p-6 bg-white dark:bg-slate-800">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <CustomInputWithoutFormik
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={
                            isWizardActive
                                ? "Completá los pasos arriba..."
                                : "Escribí tu mensaje..."
                        }
                        disabled={isLoading || isWizardActive}
                    />
                    <Button
                        isIconOnly
                        type="submit"
                        radius="full"
                        disabled={isLoading || !inputValue.trim() || isWizardActive}
                        className="text-white bg-service h-12 w-12"
                        size="lg"
                    >
                        <FaPaperPlane size={18} />
                    </Button>
                </form>
            </div>
        </Card>
    );
}
