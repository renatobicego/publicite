"use client";

import { Progress, Chip } from "@nextui-org/react";
import { FaCheck, FaCircle } from "react-icons/fa6";

interface BriefProgressProps {
    layer: 1 | 2 | 3;
    completionPercent: number;
    coveredFields: string[];
    briefComplete: boolean;
}

const ALL_FIELDS = [
    { key: "identificacion", label: "Identificación" },
    { key: "estado", label: "Estado" },
    { key: "antiguedad", label: "Antigüedad" },
    { key: "documentacion", label: "Documentación" },
    { key: "mantenimiento", label: "Mantenimiento" },
    { key: "danos", label: "Daños" },
    { key: "mercado", label: "Mercado" },
    { key: "precioReferencia", label: "Precio Ref." },
];

const LAYER_COLORS: Record<number, "warning" | "primary" | "success"> = {
    1: "warning",
    2: "primary",
    3: "success",
};

export default function BriefProgress({ layer, completionPercent, coveredFields, briefComplete }: BriefProgressProps) {
    return (
        <div className="space-y-4">
            {/* Layer indicator */}
            <div className="flex items-center justify-between">
                <Chip color={LAYER_COLORS[layer]} variant="flat" size="sm">
                    Capa {layer}
                </Chip>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {completionPercent}% completado
                </span>
            </div>

            {/* Progress bar */}
            <Progress
                value={completionPercent}
                color={LAYER_COLORS[layer]}
                size="md"
                className="w-full"
                aria-label="Progreso del brief"
            />

            {/* Fields checklist */}
            <div className="grid grid-cols-2 gap-2">
                {ALL_FIELDS.map((field) => {
                    const covered = coveredFields.includes(field.key);
                    return (
                        <div
                            key={field.key}
                            className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-md ${covered
                                    ? "bg-success-50 text-success-700"
                                    : "bg-gray-50 dark:bg-slate-800 text-gray-400"
                                }`}
                        >
                            {covered ? <FaCheck size={10} /> : <FaCircle size={6} />}
                            <span>{field.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Brief complete message */}
            {briefComplete && (
                <div className="bg-success-50 border border-success-200 rounded-lg p-3 text-center">
                    <p className="text-sm text-success-700 font-medium">
                        ✨ Brief completo — Podés generar el resultado
                    </p>
                </div>
            )}
        </div>
    );
}
