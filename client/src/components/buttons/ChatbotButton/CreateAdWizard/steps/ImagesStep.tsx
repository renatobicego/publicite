"use client";
import { Button } from "@nextui-org/react";
import { useRef, useState } from "react";
import { FaImage, FaPaperPlane } from "react-icons/fa6";

interface ImagesStepProps {
    onSubmit: (files: File[]) => void;
}

const ImagesStep = ({ onSubmit }: ImagesStepProps) => {
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
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

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
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

            {previews.length > 0 && (
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
            )}

            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onPress={() => inputRef.current?.click()}
                    startContent={<FaImage size={14} />}
                    className="flex-1"
                >
                    {files.length > 0 ? "Agregar más" : "Seleccionar imágenes"}
                </Button>
                {files.length > 0 && (
                    <Button
                        size="sm"
                        variant="flat"
                        color="success"
                        onPress={() => onSubmit(files)}
                        startContent={<FaPaperPlane size={12} />}
                        className="flex-1"
                    >
                        Confirmar ({files.length})
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ImagesStep;
