"use client";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    Textarea,
    useDisclosure,
} from "@nextui-org/react";
import { useRef, useState } from "react";
import { FaImage, FaPaperPlane, FaWandMagicSparkles } from "react-icons/fa6";
import { generateAdImageWithAI } from "@/services/chatbotServices";
import { toastifyError } from "@/utils/functions/toastify";

const PROMPT_MAX_LENGTH = 200;

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
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [prompt, setPrompt] = useState("");
    const [generating, setGenerating] = useState(false);
    const [showAiInput, setShowAiInput] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0) return;

        setFiles((prev) => [...prev, ...selectedFiles]);

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
                    "No pudimos generar la imagen. Intenta de nuevo."
                );
                return;
            }

            const dataUrl = res.imageBase64;
            const file = await dataUrlToFile(dataUrl, `ai-${Date.now()}.png`);

            setFiles((prev) => [...prev, file]);
            setPreviews((prev) => [...prev, dataUrl]);
            setPrompt("");
            setShowAiInput(false);
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

    const handlePreview = (src: string) => {
        setPreviewImage(src);
        onOpen();
    };

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

            {/* Previews */}
            {previews.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                    {previews.map((preview, idx) => (
                        <div key={idx} className="relative w-14 h-14">
                            {preview === "video" ? (
                                <div className="w-full h-full bg-gray-200 dark:bg-slate-600 rounded-lg flex items-center justify-center text-xs">
                                    Video
                                </div>
                            ) : (
                                <img
                                    src={preview}
                                    alt={`Preview ${idx}`}
                                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handlePreview(preview)}
                                />
                            )}
                            <button
                                onClick={() => removeFile(idx)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center"
                                type="button"
                            >
                                x
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* AI generation input */}
            {showAiInput && (
                <div className="flex flex-col gap-2">
                    <Textarea
                        value={prompt}
                        onValueChange={setPrompt}
                        maxLength={PROMPT_MAX_LENGTH}
                        minRows={2}
                        maxRows={4}
                        size="sm"
                        variant="bordered"
                        placeholder="Describe la imagen que quieras generar..."
                        isDisabled={generating}
                        description={`${prompt.length}/${PROMPT_MAX_LENGTH}`}
                    />
                    <div className="flex gap-2">
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
                            className="flex-1"
                        >
                            {generating ? "Generando..." : "Generar"}
                        </Button>
                        <Button
                            size="sm"
                            variant="light"
                            onPress={() => setShowAiInput(false)}
                            isDisabled={generating}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            {/* Action buttons */}
            {!showAiInput && (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => inputRef.current?.click()}
                            startContent={<FaImage size={14} />}
                            className="flex-1"
                        >
                            {files.length > 0 ? "Agregar imágenes" : "Subir imágenes"}
                        </Button>
                        <Button
                            size="sm"
                            variant="flat"
                            color="secondary"
                            onPress={() => setShowAiInput(true)}
                            startContent={<FaWandMagicSparkles size={14} />}
                            className="flex-1"
                        >
                            Generar con IA
                        </Button>
                    </div>

                    {files.length > 0 && (
                        <Button
                            size="sm"
                            variant="flat"
                            color="success"
                            onPress={() => onSubmit(files)}
                            startContent={<FaPaperPlane size={12} />}
                            className="w-full"
                        >
                            Confirmar ({files.length}{" "}
                            {files.length === 1 ? "imagen" : "imágenes"})
                        </Button>
                    )}
                </div>
            )}

            {/* Image preview modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" placement="center">
                <ModalContent>
                    {() => (
                        <ModalBody className="p-2">
                            {previewImage && (
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="w-full h-auto rounded-lg object-contain max-h-[70vh]"
                                />
                            )}
                        </ModalBody>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default ImagesStep;
