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
        className="fixed bottom-24 right-10 z-40 bg-fondo shadow-2xl hover:shadow-3xl transition-all duration-300"
        aria-label="Open chat"
      >
        <OrangeCubeIcon />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        // <ChatWindow
        //   messages={messages}
        //   onSendMessage={handleSendMessage}
        //   onClose={() => setIsOpen(false)}
        //   isLoading={status.toString() === "in_progress"}
        // />
        <></>
      )}
    </>
  );
}
