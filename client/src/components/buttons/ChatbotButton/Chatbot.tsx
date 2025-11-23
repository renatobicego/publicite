"use client";

import { useState } from "react";
import { Button } from "@nextui-org/react";
import { sendMessageToAI } from "@/services/chatbotServices";
import { OrangeCubeIcon } from "./OrangeCubeIcon";
import { ChatWindow } from "./ChatWindow";
import { toastifyError } from "@/utils/functions/toastify";
import { UIMessage } from "ai";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "in_progress" | "error">(
    "idle"
  );

  const handleSendMessage = async (text: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "user",
        content: text,
        id: prevMessages.length.toString(),
        parts: [{ text, type: "text" }],
      },
    ]);
    try {
      const sessionId = sessionStorage.getItem("chatSessionId") || "";
      setStatus("in_progress");
      const response = await sendMessageToAI({
        sessionId,
        message: text,
      });
      if (!response || "botResponse" in response === false) {
        setStatus("error");
        toastifyError("Error al enviar el mensaje al chatbot.");
        return;
      }
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: response.botResponse,
          id: `${(prevMessages.length + 1).toString()}bot`,
          parts: [{ text: response.botResponse, type: "text" }],
        },
      ]);
      setStatus("idle");
      if (!sessionId && response.sessionId) {
        sessionStorage.setItem("chatSessionId", response.sessionId);
      }
    } catch (error) {
      setStatus("error");
      toastifyError("Error al enviar el mensaje al chatbot.");
    }
  };

  return (
    <>
      {/* Floating Button with Hero UI */}
      <Button
        isIconOnly
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-28 md:bottom-24 right-4 md:right-8 z-40 bg-fondo hover:shadow-3xl transition-all duration-300 shadow w-16 h-16 md:w-14 md:h-14 pt-2"
        aria-label="Open chat"
        radius="full"
        size="lg"
      >
        <OrangeCubeIcon />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          onClose={() => setIsOpen(false)}
          isLoading={status.toString() === "in_progress"}
        />
      )}
    </>
  );
}
