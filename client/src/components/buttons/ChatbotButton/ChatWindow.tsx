"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import type { UIMessage } from "ai";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  ScrollShadow,
} from "@nextui-org/react";
import { FaPaperPlane, FaX } from "react-icons/fa6";
import { CustomInputWithoutFormik } from "@/components/inputs/CustomInputs";

interface ChatWindowProps {
  messages: UIMessage[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

export function ChatWindow({
  messages,
  onSendMessage,
  onClose,
  isLoading,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const parseAndRenderText = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      const trimmedLine = line.trim();

      // Detect numbered list items (e.g., "1. **Title**: description")
      const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
      if (numberedMatch) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        // Parse bold text within the line
        const content = numberedMatch[1];
        const boldRegex = /\*\*([^*]+)\*\*/g;
        const parts = content.split(boldRegex);

        listItems.push(
          <li key={idx} className="ml-4 mb-2">
            {parts.map((part, partIdx) =>
              partIdx % 2 === 1 ? (
                <strong key={partIdx}>{part}</strong>
              ) : (
                <span key={partIdx}>{part}</span>
              )
            )}
          </li>
        );
      } else {
        // End list if we encounter a non-list line
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${elements.length}`} className="list-disc space-y-1">
              {listItems}
            </ul>
          );
          inList = false;
          listItems = [];
        }

        // Handle empty lines
        if (trimmedLine === "") {
          elements.push(<div key={idx} className="h-2" />);
        } else {
          // Parse bold text in regular paragraphs
          const boldRegex = /\*\*([^*]+)\*\*/g;
          const parts = trimmedLine.split(boldRegex);

          elements.push(
            <p key={idx} className="text-sm leading-relaxed">
              {parts.map((part, partIdx) =>
                partIdx % 2 === 1 ? (
                  <strong key={partIdx}>{part}</strong>
                ) : (
                  <span key={partIdx}>{part}</span>
                )
              )}
            </p>
          );
        }
      }
    });

    // Don't forget remaining list items
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
    <div className="fixed bottom-28 md:bottom-24 right-4 md:right-8 z-50 w-96">
      <Card className="h-[500px] shadow-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <CardHeader className="flex items-center justify-between gap-3 border-b border-orange-200 dark:border-orange-900 bg-service text-white">
          <h2 className="text-lg font-semibold">Chatea con Cubito</h2>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            radius="full"
            onClick={onClose}
            className="text-white hover:bg-orange-700"
            aria-label="Close chat"
          >
            <FaX size={20} />
          </Button>
        </CardHeader>

        {/* Messages Container */}
        <CardBody className="flex-1 overflow-hidden p-0">
          <ScrollShadow className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <p>Preguntale a Cubito lo que quieras</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-xl ${
                      message.role === "user"
                        ? "bg-service text-white rounded-br-none"
                        : "bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 rounded-bl-none"
                    }`}
                  >
                    {message.parts.map((part, idx) => {
                      if (part.type === "text") {
                        return (
                          <div key={idx} className="text-sm leading-relaxed">
                            {parseAndRenderText(part.text)}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 px-4 py-2 rounded-xl rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
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
        <div className="border-t border-gray-200 dark:border-slate-600 p-3 bg-white dark:bg-slate-800">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <CustomInputWithoutFormik
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tu mensaje..."
              disabled={isLoading}
            />
            <Button
              isIconOnly
              type="submit"
              radius="full"
              disabled={isLoading || !inputValue.trim()}
              className="text-white bg-service"
            >
              <FaPaperPlane size={16} />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
