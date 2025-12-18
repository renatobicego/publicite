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

  const parseInline = (text: string) => {
    // 👉 HEADERS ###
    if (text.startsWith("### ")) {
      return (
        <h5 className=" mt-4 mb-2">
          {parseInline(text.replace(/^###\s*/, ""))}
        </h5>
      );
    }
    const elements: React.ReactNode[] = [];

    // Primero links, luego bold
    const regex = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)/g;

    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
      // Texto previo
      if (match.index > lastIndex) {
        elements.push(
          <span key={key++}>{text.slice(lastIndex, match.index)}</span>
        );
      }

      // Link
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

      // Bold
      if (match[4]) {
        elements.push(<strong key={key++}>{match[5]}</strong>);
      }

      lastIndex = regex.lastIndex;
    }

    // Texto restante
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

      /** ## HEADINGS **/
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

      /** LISTAS NUMERADAS **/
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

      /** FIN DE LISTA **/
      if (inList && listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc space-y-1">
            {listItems}
          </ul>
        );
        inList = false;
        listItems = [];
      }

      /** LÍNEA VACÍA **/
      if (trimmedLine === "") {
        elements.push(<div key={idx} className="h-2" />);
        return;
      }

      /** PÁRRAFOS **/
      elements.push(
        <p key={idx} className="text-sm leading-relaxed">
          {parseInline(trimmedLine)}
        </p>
      );
    });

    /** LISTA FINAL **/
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
    <div className="fixed bottom-28 md:bottom-24 right-4 md:right-8 lg:right-12 xl:right-16 3xl:right-[6%] xl:bottom-32 z-50 w-96">
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
