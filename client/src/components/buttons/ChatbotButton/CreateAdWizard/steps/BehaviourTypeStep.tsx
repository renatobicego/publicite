"use client";
import { Button } from "@nextui-org/react";
import { PostBehaviourType } from "@/types/postTypes";

interface BehaviourTypeStepProps {
    onSelect: (type: PostBehaviourType) => void;
}

const BehaviourTypeStep = ({ onSelect }: BehaviourTypeStepProps) => {
    return (
        <div className="flex flex-col gap-2 mt-2">
            <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={() => onSelect("libre")}
                className="w-full"
            >
                Geolocalizado (público, cerca tuyo)
            </Button>
            <Button
                size="sm"
                variant="flat"
                color="warning"
                onPress={() => onSelect("agenda")}
                className="w-full"
            >
                De agenda (sólo tus contactos)
            </Button>
        </div>
    );
};

export default BehaviourTypeStep;
