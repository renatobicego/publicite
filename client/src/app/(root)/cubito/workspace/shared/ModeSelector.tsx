"use client";

import { Select, SelectItem } from "@nextui-org/react";
import { CubitoMode } from "@/types/workspaceTypes";

interface ModeSelectorProps {
    activeMode: CubitoMode;
    onModeChange: (mode: CubitoMode) => void;
}

const MODES: { value: CubitoMode; label: string }[] = [
    { value: "general", label: "Asistente General" },
    { value: "disenador_grafico", label: "Diseñador Gráfico" },
    { value: "marketing", label: "Marketing" },
    { value: "especialista_negocios", label: "Especialista en Negocios" },
    { value: "branch", label: "Branding" },
    { value: "cliente_b2b", label: "Cliente B2B" },
    { value: "consultor_ventas", label: "Consultor de Ventas" },
    { value: "analista_mercado", label: "Analista de Mercado" },
];

export default function ModeSelector({ activeMode, onModeChange }: ModeSelectorProps) {
    return (
        <Select
            size="sm"
            variant="flat"
            selectedKeys={[activeMode]}
            onChange={(e) => onModeChange(e.target.value as CubitoMode)}
            className="max-w-[200px]"
            aria-label="Modo de Cubito"
            classNames={{
                trigger: "h-8 min-h-8",
                value: "text-xs",
            }}
        >
            {MODES.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                </SelectItem>
            ))}
        </Select>
    );
}
