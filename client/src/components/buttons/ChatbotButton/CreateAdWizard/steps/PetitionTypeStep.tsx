"use client";
import { Button } from "@nextui-org/react";

interface PetitionTypeStepProps {
    onSelect: (type: "good" | "service") => void;
}

const PetitionTypeStep = ({ onSelect }: PetitionTypeStepProps) => {
    return (
        <div className="flex gap-2 mt-2">
            <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={() => onSelect("good")}
                className="flex-1"
            >
                Bien
            </Button>
            <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={() => onSelect("service")}
                className="flex-1"
            >
                Servicio
            </Button>
        </div>
    );
};

export default PetitionTypeStep;
