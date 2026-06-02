"use client";
import { Button, Textarea } from "@nextui-org/react";
import { useRef, useState } from "react";
import { FaImage, FaPaperPlane, FaWandMagicSparkles } from "react-icons/fa6";
import { generateAdImageWithAI } from "@/services/chatbotServices";
import { toastifyError } from "@/utils/functions/toastify";

const PROMPT_MAX_LENGTH = 200;

type Mode = "choose" | "upload" | "ai";

interface ImagesStepProps {
    onSubmit: (files: File[]) => void;
}

const dataUrlToFile = async (
    dataUrl: string,
    filename: string
): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type || "image/png" });
};

const ImagesStep = ({ onSubmit }: ImagesStepProps) => {
    const [mode, setMode] = useState<Mode>("choose");
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [prompt, setPrompt] = useState("");
    const [generating, setGenerating] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0) return;

        setFiles((prev) => [...prev, ...selectedFiles]);

        // Generate previews
        selectedFiles.forEach((file) => {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    setPreviews((prev) => [...prev, ev.target?.result as string]);
                };
                reader.readAsDataURL(file);
            } else if (file.type.startsWith("video/")) {
                setPreviews((prev) => [...prev, "video"]);
            }
        });
    };

    const handleGenerate = async () => {
        const cleanPrompt = prompt.trim();
        if (!cleanPrompt || generating) return;

        setGenerating(true);
        try {
            const res = await generateAdImageWithAI(cleanPrompt);
            if (!res || "imageBase64" in res === false) {
                toastifyError(
                    (res && "error" in res && res.error) ||
                    "No pudimos generar la imagen. Intentá de nuevo."
                );
                return;
            }

            const dataUrl = res.imageBase64;
            const file = await dataUrlToFile(dataUrl, `ai-${Date.now()}.png`);

            setFiles((prev) => [...prev, file]);
            setPreviews((prev) => [...prev, dataUrl]);
            setPrompt("");
        } catch (error) {
            toastifyError("Error al generar la imagen con IA.");
        } finally {
            setGenerating(false);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const previewsGrid = previews.length > 0 && (
        <div className="flex gap-1 flex-wrap">
            {previews.map((preview, idx) => (
                <div key={idx} className="relative w-14 h-14">
                    {preview === "video" ? (
                        <div className="w-full h-full bg-gray-200 dark:bg-slate-600 rounded-lg flex items-center justify-center text-xs">
                            🎬
                        </div>
                    ) : (
                        <img
                            src={preview}
                            alt={`Preview ${idx}`}
                            className="w-full h-full object-cover rounded-lg"
                        />
                    )}
                    <button
                        onClick={() => removeFile(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center"
                        type="button"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );

    const confirmButton = files.length > 0 && (
        <Button
            size="sm"
            variant="flat"
            color="success"
            onPress={() => onSubmit(files)}
            startContent={<FaPaperPlane size={12} />}
            className="w-full"
        >
            Confirmar ({files.length})
        </Button>
    );

    // Paso 1: elegir entre generar con IA o subir imágenes propias
    if (mode === "choose") {
        return (
            <div className="flex flex-col gap-2 mt-2">
                <Button
                    size="sm"
                    variant="flat"
                    color="secondary"
                    onPress={() => setMode("ai")}
                    startContent={<FaWandMagicSparkles size={14} />}
                    className="w-full"
                >
                    Generar con IA
                </Button>
                <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onPress={() => setMode("upload")}
                    startContent={<FaImage size={14} />}
                    className="w-full"
                >
                    Subir mis imágenes
                </Button>
            </div>
        );
    }

    // Modo: generar con IA
    if (mode === "ai") {
        return (
            <div className="flex flex-col gap-2 mt-2">
                {previewsGrid}

                <Textarea
                    value={prompt}
                    onValueChange={setPrompt}
                    maxLength={PROMPT_MAX_LENGTH}
                    minRows={2}
                    maxRows={4}
                    size="sm"
                    variant="bordered"
                    placeholder="Describí la imagen que querés generar..."
                    isDisabled={generating}
                    description={`${prompt.length}/${PROMPT_MAX_LENGTH}`}
                />

                <Button
                    size="sm"
                    variant="flat"
                    color="secondary"
                    onPress={handleGenerate}
                    isLoading={generating}
                    isDisabled={!prompt.trim() || generating}
                    startContent={
                        !generating ? <FaWandMagicSparkles size={14} /> : undefined
                    }
                    className="w-full"
                >
                    {generating
                        ? "Generando..."
                        : files.length > 0
                            ? "Generar otra"
                            : "Generar imagen"}
                </Button>

                {confirmButton}

                <Button
                    size="sm"
                    variant="light"
                    onPress={() => setMode("choose")}
                    isDisabled={generating}
                    className="w-full"
                >
                    Volver
                </Button>
            </div>
        );
    }

    // Modo: subir imágenes propias
    return (
        <div className="flex flex-col gap-2 mt-2">
            <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
            />

            {previewsGrid}

            <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={() => inputRef.current?.click()}
                startContent={<FaImage size={14} />}
                className="w-full"
            >
                {files.length > 0 ? "Agregar más" : "Seleccionar imágenes"}
            </Button>

            {confirmButton}

            <Button
                size="sm"
                variant="light"
                onPress={() => setMode("choose")}
                className="w-full"
            >
                Volver
            </Button>
        </div>
    );
};

export default ImagesStep;
