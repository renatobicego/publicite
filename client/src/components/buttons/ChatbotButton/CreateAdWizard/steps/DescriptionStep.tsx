"use client";
import { Button, Textarea } from "@nextui-org/react";
import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa6";

interface DescriptionStepProps {
    onSubmit: (description?: string) => void;
}

const DescriptionStep = ({ onSubmit }: DescriptionStepProps) => {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        const trimmed = value.trim();
        if (trimmed.length > 2000) {
            setError("La descripción debe tener menos de 2000 caracteres");
            return;
        }
        setError("");
        onSubmit(trimmed || undefined);
    };

    return (
        <div className="flex flex-col gap-2 mt-2">
            <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Descripción de tu publicación..."
                minRows={2}
                maxRows={4}
                size="sm"
                variant="bordered"
                radius="lg"
            />
            {error && <p className="text-danger text-xs">{error}</p>}
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onPress={handleSubmit}
                    isDisabled={!value.trim()}
                    startContent={<FaPaperPlane size={12} />}
                    className="flex-1"
                >
                    Enviar
                </Button>
                <Button
                    size="sm"
                    variant="light"
                    onPress={() => onSubmit(undefined)}
                    className="flex-1"
                >
                    Continuar sin descripción
                </Button>
            </div>
        </div>
    );
};

export default DescriptionStep;
