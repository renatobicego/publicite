"use client";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import { CustomInputWithoutFormik } from "@/components/inputs/CustomInputs";
import { FaPaperPlane } from "react-icons/fa6";

interface TitleStepProps {
    onSubmit: (title: string) => void;
}

const TitleStep = ({ onSubmit }: TitleStepProps) => {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        const trimmed = value.trim();
        if (trimmed.length < 3) {
            setError("El título debe tener al menos 3 caracteres");
            return;
        }
        if (trimmed.length > 120) {
            setError("El título debe tener menos de 120 caracteres");
            return;
        }
        setError("");
        onSubmit(trimmed);
    };

    return (
        <div className="flex flex-col gap-2 mt-2">
            <div className="flex gap-2">
                <CustomInputWithoutFormik
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Título de tu publicación..."
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                />
                <Button
                    isIconOnly
                    size="sm"
                    radius="full"
                    onPress={handleSubmit}
                    isDisabled={!value.trim()}
                    className="text-white bg-service self-center"
                >
                    <FaPaperPlane size={12} />
                </Button>
            </div>
            {error && <p className="text-danger text-xs">{error}</p>}
        </div>
    );
};

export default TitleStep;
