"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@nextui-org/react";
import { OrangeCubeIcon } from "./OrangeCubeIcon";
import { ChatWindow } from "./ChatWindow";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const handleSendMessage = (text: string) => {
    sendMessage({ text });
  };

  return (
    <>
      {/* Floating Button with Hero UI */}
      <Button
        isIconOnly
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 md:right-8 z-40 bg-fondo hover:shadow-3xl transition-all duration-300 shadow w-16 h-16 md:w-14 md:h-14 pt-2"
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
