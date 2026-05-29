"use client";

import { useState } from "react";
import { Button } from "@nextui-org/react";
import { OrangeCubeIcon } from "./OrangeCubeIcon";
import { ChatWindow } from "./ChatWindow";
import { useChatbot } from "./useChatbot";
import { usePathname } from "next/navigation";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname()
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

  const hideButton = pathname.includes("/cubito")

  return (
    <>
      {/* Floating Button */}
      <Button
        isIconOnly
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-28 md:bottom-24 right-4 md:right-8 lg:right-12 xl:right-16 3xl:right-[6%] xl:bottom-32 
          z-40 bg-fondo hover:shadow-3xl transition-all duration-300 shadow w-16 h-16 md:w-14 md:h-14 xl:w-20 xl:h-20 pt-2
          ${hideButton ? "hidden" : ""}`}
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
          isLoading={status === "in_progress"}
          showCreateAdButton={showCreateAdButton}
          onStartCreateAd={handleStartCreateAd}
          wizard={wizard}
          onSubmitAd={handleSubmitAd}
          isSubmittingAd={isSubmittingAd}
        />
      )}
    </>
  );
}
