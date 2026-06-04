"use client";
import { Button } from "@nextui-org/react";

interface ConditionStepProps {
    onSelect: (condition: "new" | "used") => void;
}

const ConditionStep = ({ onSelect }: ConditionStepProps) => {
    return (
        <div className="flex gap-2 mt-2">
            <Button
                size="sm"
                variant="flat"
                color="success"
                onPress={() => onSelect("new")}
                className="flex-1"
            >
                Nuevo
            </Button>
            <Button
                size="sm"
                variant="flat"
                color="warning"
                onPress={() => onSelect("used")}
                className="flex-1"
            >
                Usado
            </Button>
        </div>
    );
};

export default ConditionStep;
