"use client";
import { Button } from "@nextui-org/react";
import { WizardData } from "../types";

interface SummaryStepProps {
    data: WizardData;
    onConfirm: () => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

const postTypeLabels = {
    good: "Bien",
    service: "Servicio",
    petition: "Necesidad",
};

const behaviourLabels = {
    libre: "Libre",
    agenda: "Agenda",
};

const conditionLabels = {
    new: "Nuevo",
    used: "Usado",
};

const frequencyLabels: Record<string, string> = {
    hour: "por hora",
    day: "por día",
    week: "por semana",
    month: "por mes",
    year: "por año",
};

const SummaryStep = ({
    data,
    onConfirm,
    onCancel,
    isSubmitting,
}: SummaryStepProps) => {
    return (
        <div className="flex flex-col gap-2 mt-2">
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 text-xs space-y-1">
                <SummaryRow label="Tipo" value={postTypeLabels[data.postType!]} />
                <SummaryRow
                    label="Comportamiento"
                    value={behaviourLabels[data.postBehaviourType!]}
                />
                <SummaryRow label="Título" value={data.title!} />
                {data.description && (
                    <SummaryRow label="Descripción" value={data.description} />
                )}
                {data.price && (
                    <SummaryRow
                        label="Precio"
                        value={
                            data.price === 8613.10
                                ? "Negociable / a pactar"
                                : `$${data.price}${data.toPrice ? ` - $${data.toPrice}` : ""}${data.frequencyPrice ? ` ${frequencyLabels[data.frequencyPrice]}` : ""}`
                        }
                    />
                )}
                {data.condition && (
                    <SummaryRow
                        label="Condición"
                        value={conditionLabels[data.condition]}
                    />
                )}
                {data.petitionType && (
                    <SummaryRow
                        label="Tipo de necesidad"
                        value={data.petitionType === "good" ? "Bien" : "Servicio"}
                    />
                )}
                <SummaryRow label="Categoría" value={data.categoryLabel!} />
                <SummaryRow label="Ubicación" value={data.locationDescription!} />
                {data.images && (
                    <SummaryRow
                        label="Imágenes"
                        value={`${data.images.length} archivo${data.images.length > 1 ? "s" : ""}`}
                    />
                )}
            </div>

            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="flat"
                    color="success"
                    onPress={onConfirm}
                    isLoading={isSubmitting}
                    isDisabled={isSubmitting}
                    className="flex-1"
                >
                    {isSubmitting ? "Publicando..." : "Publicar"}
                </Button>
                <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    onPress={onCancel}
                    isDisabled={isSubmitting}
                    className="flex-1"
                >
                    Cancelar
                </Button>
            </div>
        </div>
    );
};

export default SummaryStep;

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-2">
            <span className="text-gray-500 dark:text-gray-400 font-medium">
                {label}:
            </span>
            <span className="text-right text-gray-800 dark:text-gray-200 max-w-[180px] truncate">
                {value}
            </span>
        </div>
    );
}
