"use client";

import { Chip, Tooltip } from "@nextui-org/react";
import { FaCoins } from "react-icons/fa6";
import { TokenStatus } from "@/types/workspaceTypes";

interface TokenDisplayProps {
    tokenStatus: TokenStatus | null;
}

export default function TokenDisplay({ tokenStatus }: TokenDisplayProps) {
    if (!tokenStatus) return null;

    const { remaining, allowance, source } = tokenStatus;
    const percent = allowance > 0 ? (remaining / allowance) * 100 : 0;

    const color = percent > 50 ? "success" : percent > 20 ? "warning" : "danger";

    return (
        <Tooltip
            content={
                <div className="text-xs space-y-1 p-1">
                    <p><strong>Tokens disponibles:</strong> {remaining.toFixed(1)} / {allowance}</p>
                    <p><strong>Fuente:</strong> {source === "plan" ? "Plan propio" : "Comunidad"}</p>
                    {tokenStatus.resetsAt && (
                        <p><strong>Se renueva:</strong> {new Date(tokenStatus.resetsAt).toLocaleDateString()}</p>
                    )}
                </div>
            }
        >
            <Chip
                size="sm"
                variant="flat"
                color={color}
                startContent={<FaCoins size={10} />}
                className="cursor-help"
            >
                {remaining.toFixed(0)} tokens
            </Chip>
        </Tooltip>
    );
}
