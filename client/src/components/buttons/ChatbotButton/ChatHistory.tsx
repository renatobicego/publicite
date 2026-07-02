"use client";

import { Button, ScrollShadow, Spinner } from "@nextui-org/react";
import { FaPlus, FaTrash, FaClock } from "react-icons/fa6";
import { ChatSessionSummary } from "@/types/chatbotTypes";

interface ChatHistoryProps {
    sessions: ChatSessionSummary[];
    isLoading: boolean;
    activeSessionId: string | null;
    onSelectSession: (sessionId: string) => void;
    onNewChat: () => void;
    onDeleteSession: (sessionId: string) => void;
    onClose?: () => void;
    variant?: "sidebar" | "panel";
}

export function ChatHistory({
    sessions,
    isLoading,
    activeSessionId,
    onSelectSession,
    onNewChat,
    onDeleteSession,
    onClose,
    variant = "panel",
}: ChatHistoryProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Ahora";
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays}d`;
        return date.toLocaleDateString("es-AR", {
            day: "numeric",
            month: "short",
        });
    };

    return (
        <div
            className={`flex flex-col h-full ${variant === "sidebar" ? "w-72 border-r border-gray-200 dark:border-slate-600" : "w-full"
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-600">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Historial de chats
                </h3>
                <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<FaPlus size={12} />}
                    onPress={onNewChat}
                    className="text-xs"
                >
                    Nuevo chat
                </Button>
            </div>

            {/* Session List */}
            <ScrollShadow className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Spinner size="sm" color="warning" />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-gray-400 dark:text-gray-500">
                        <FaClock size={24} className="mb-2 opacity-50" />
                        <p className="text-sm">No hay conversaciones previas</p>
                        <p className="text-xs mt-1">
                            Tus chats aparecerán acá cuando el historial esté disponible
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1 p-2">
                        {sessions.map((session) => (
                            <div
                                key={session.sessionId}
                                className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors
                  ${activeSessionId === session.sessionId
                                        ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                                        : "hover:bg-gray-100 dark:hover:bg-slate-700"
                                    }`}
                                onClick={() => onSelectSession(session.sessionId)}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                        {session.title}
                                    </p>
                                    {session.lastMessage && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                            {session.lastMessage}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        {formatDate(session.lastMessageAt)}
                                    </p>
                                </div>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                                    onPress={(e) => {
                                        onDeleteSession(session.sessionId);
                                    }}
                                    aria-label="Eliminar conversación"
                                >
                                    <FaTrash size={12} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollShadow>

            {/* Footer (optional close for panel variant) */}
            {onClose && variant === "panel" && (
                <div className="p-3 border-t border-gray-200 dark:border-slate-600">
                    <Button
                        size="sm"
                        variant="light"
                        onPress={onClose}
                        className="w-full text-xs"
                    >
                        Volver al chat
                    </Button>
                </div>
            )}
        </div>
    );
}
