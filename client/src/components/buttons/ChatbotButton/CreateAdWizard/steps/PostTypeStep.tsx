"use client";
import { Button } from "@nextui-org/react";
import { AdPostType } from "../types";

interface PostTypeStepProps {
    onSelect: (type: AdPostType) => void;
}

const PostTypeStep = ({ onSelect }: PostTypeStepProps) => {
    return (
        <div className="flex flex-col gap-2 mt-2">
            <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={() => onSelect("good")}
                className="w-full"
            >
                🛍️ Bien
            </Button>
            <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={() => onSelect("service")}
                className="w-full"
            >
                🔧 Servicio
            </Button>
            <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={() => onSelect("petition")}
                className="w-full"
            >
                🔎 Necesidad
            </Button>
        </div>
    );
};

export default PostTypeStep;
