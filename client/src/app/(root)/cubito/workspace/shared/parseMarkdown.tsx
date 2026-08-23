"use client";

import React from "react";

export function parseInline(text: string): React.ReactNode {
    if (text.startsWith("### ")) {
        return (
            <h5 className="font-semibold mt-4 mb-2">
                {parseInline(text.replace(/^###\s*/, ""))}
            </h5>
        );
    }
    const elements: React.ReactNode[] = [];
    const regex = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(https?:\/\/[^\s),]+)/g;
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
        } else if (match[4]) {
            elements.push(<strong key={key++}>{match[5]}</strong>);
        } else if (match[6]) {
            elements.push(
                <a
                    key={key++}
                    href={match[6]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                >
                    {match[6]}
                </a>
            );
        }
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
        elements.push(<span key={key++}>{text.slice(lastIndex)}</span>);
    }
    return elements;
}

export function parseMarkdown(text: string): React.ReactNode {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
        const trimmedLine = line.trim();

        // Headers
        if (trimmedLine.startsWith("### ")) {
            if (inList && listItems.length > 0) {
                elements.push(<ul key={`list-${elements.length}`} className="list-disc space-y-1 ml-4">{listItems}</ul>);
                inList = false;
                listItems = [];
            }
            elements.push(
                <h4 key={idx} className="text-base font-semibold mt-3 mb-1">
                    {parseInline(trimmedLine.replace(/^###\s+/, ""))}
                </h4>
            );
            return;
        }

        if (trimmedLine.startsWith("## ")) {
            if (inList && listItems.length > 0) {
                elements.push(<ul key={`list-${elements.length}`} className="list-disc space-y-1 ml-4">{listItems}</ul>);
                inList = false;
                listItems = [];
            }
            elements.push(
                <h3 key={idx} className="text-lg font-semibold mt-4 mb-2">
                    {parseInline(trimmedLine.replace(/^##\s+/, ""))}
                </h3>
            );
            return;
        }

        // Numbered lists
        const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
        if (numberedMatch) {
            if (!inList) {
                inList = true;
                listItems = [];
            }
            listItems.push(
                <li key={idx} className="ml-4 mb-1">
                    {parseInline(numberedMatch[1])}
                </li>
            );
            return;
        }

        // Bullet lists (- item)
        const bulletMatch = trimmedLine.match(/^[-•]\s+(.+)$/);
        if (bulletMatch) {
            if (!inList) {
                inList = true;
                listItems = [];
            }
            listItems.push(
                <li key={idx} className="ml-4 mb-1">
                    {parseInline(bulletMatch[1])}
                </li>
            );
            return;
        }

        // Close open list
        if (inList && listItems.length > 0) {
            elements.push(
                <ul key={`list-${elements.length}`} className="list-disc space-y-1 ml-4">
                    {listItems}
                </ul>
            );
            inList = false;
            listItems = [];
        }

        // Empty line
        if (trimmedLine === "") {
            elements.push(<div key={idx} className="h-2" />);
            return;
        }

        // Regular paragraph
        elements.push(
            <p key={idx} className="leading-relaxed">
                {parseInline(trimmedLine)}
            </p>
        );
    });

    // Close any remaining list
    if (inList && listItems.length > 0) {
        elements.push(
            <ul key={`list-${elements.length}`} className="list-disc space-y-1 ml-4">
                {listItems}
            </ul>
        );
    }

    return <>{elements}</>;
}
