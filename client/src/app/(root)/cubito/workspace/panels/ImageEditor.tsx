"use client";

import { useState, useRef, useCallback } from "react";
import { Cropper, CropperRef } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Slider } from "@nextui-org/react";
import {
    FaCrop,
    FaRotateRight,
    FaRotateLeft,
    FaArrowsLeftRight,
    FaArrowsUpDown,
    FaSun,
    FaCircleHalfStroke,
    FaCheck,
    FaXmark,
    FaArrowRotateLeft,
} from "react-icons/fa6";

interface ImageEditorProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    onSave: (editedImageUrl: string) => void;
}

interface Adjustments {
    brightness: number;
    contrast: number;
    saturate: number;
}

export default function ImageEditor({ isOpen, onClose, imageUrl, onSave }: ImageEditorProps) {
    const cropperRef = useRef<CropperRef>(null);
    const [adjustments, setAdjustments] = useState<Adjustments>({
        brightness: 100,
        contrast: 100,
        saturate: 100,
    });
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    const resetAll = useCallback(() => {
        setAdjustments({ brightness: 100, contrast: 100, saturate: 100 });
        setFlipH(false);
        setFlipV(false);
        setRotation(0);
        if (cropperRef.current) {
            cropperRef.current.reset();
        }
    }, []);

    const handleRotateRight = () => {
        setRotation((prev) => prev + 90);
        if (cropperRef.current) {
            cropperRef.current.rotateImage(90);
        }
    };

    const handleRotateLeft = () => {
        setRotation((prev) => prev - 90);
        if (cropperRef.current) {
            cropperRef.current.rotateImage(-90);
        }
    };

    const handleFlipH = () => {
        setFlipH((prev) => !prev);
        if (cropperRef.current) {
            cropperRef.current.flipImage(true, false);
        }
    };

    const handleFlipV = () => {
        setFlipV((prev) => !prev);
        if (cropperRef.current) {
            cropperRef.current.flipImage(false, true);
        }
    };

    const handleSave = async () => {
        if (!cropperRef.current) return;
        setIsSaving(true);

        try {
            const canvas = cropperRef.current.getCanvas();
            if (!canvas) {
                setIsSaving(false);
                return;
            }

            // Apply CSS filters to a new canvas
            const finalCanvas = document.createElement("canvas");
            finalCanvas.width = canvas.width;
            finalCanvas.height = canvas.height;
            const ctx = finalCanvas.getContext("2d");
            if (!ctx) {
                setIsSaving(false);
                return;
            }

            // Apply filters
            ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturate}%)`;
            ctx.drawImage(canvas, 0, 0);

            // Convert to blob and create object URL
            const blob = await new Promise<Blob | null>((resolve) =>
                finalCanvas.toBlob(resolve, "image/png", 0.92)
            );

            if (!blob) {
                setIsSaving(false);
                return;
            }

            const editedUrl = URL.createObjectURL(blob);
            onSave(editedUrl);
            onClose();
        } catch {
            // Error handling silently
        } finally {
            setIsSaving(false);
        }
    };

    const filterStyle = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturate}%)`;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="4xl"
            scrollBehavior="inside"
            classNames={{
                base: "max-h-[90vh]",
                body: "p-0",
            }}
        >
            <ModalContent>
                <ModalHeader className="flex items-center gap-2 border-b border-divider">
                    <FaCrop size={16} className="text-orange-500" />
                    <span>Editor de imagen</span>
                </ModalHeader>

                <ModalBody>
                    <div className="flex flex-col lg:flex-row gap-4 p-4">
                        {/* Cropper area */}
                        <div className="flex-1 min-h-[300px] max-h-[500px] bg-gray-900 rounded-xl overflow-hidden relative">
                            <div style={{ filter: filterStyle }} className="w-full h-full">
                                <Cropper
                                    ref={cropperRef}
                                    src={imageUrl}
                                    className="h-[400px] w-full"
                                    stencilProps={{
                                        movable: true,
                                        resizable: true,
                                    }}
                                    backgroundClassName="bg-gray-900"
                                />
                            </div>
                        </div>

                        {/* Controls sidebar */}
                        <div className="lg:w-64 space-y-4">
                            {/* Transform buttons */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Transformar
                                </p>
                                <div className="grid grid-cols-4 lg:grid-cols-2 gap-2">
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        onPress={handleRotateLeft}
                                        className="flex-col gap-1 h-14"
                                    >
                                        <FaRotateLeft size={14} />
                                        <span className="text-[10px]">Rotar izq</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        onPress={handleRotateRight}
                                        className="flex-col gap-1 h-14"
                                    >
                                        <FaRotateRight size={14} />
                                        <span className="text-[10px]">Rotar der</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={flipH ? "shadow" : "flat"}
                                        color={flipH ? "primary" : "default"}
                                        onPress={handleFlipH}
                                        className="flex-col gap-1 h-14"
                                    >
                                        <FaArrowsLeftRight size={14} />
                                        <span className="text-[10px]">Voltear H</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={flipV ? "shadow" : "flat"}
                                        color={flipV ? "primary" : "default"}
                                        onPress={handleFlipV}
                                        className="flex-col gap-1 h-14"
                                    >
                                        <FaArrowsUpDown size={14} />
                                        <span className="text-[10px]">Voltear V</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Adjustments */}
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Ajustes
                                </p>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <FaSun size={12} className="text-yellow-500" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            Brillo: {adjustments.brightness}%
                                        </span>
                                    </div>
                                    <Slider
                                        size="sm"
                                        step={5}
                                        minValue={20}
                                        maxValue={200}
                                        value={adjustments.brightness}
                                        onChange={(val) =>
                                            setAdjustments((prev) => ({
                                                ...prev,
                                                brightness: val as number,
                                            }))
                                        }
                                        className="max-w-full"
                                        color="warning"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <FaCircleHalfStroke size={12} className="text-blue-500" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            Contraste: {adjustments.contrast}%
                                        </span>
                                    </div>
                                    <Slider
                                        size="sm"
                                        step={5}
                                        minValue={20}
                                        maxValue={200}
                                        value={adjustments.contrast}
                                        onChange={(val) =>
                                            setAdjustments((prev) => ({
                                                ...prev,
                                                contrast: val as number,
                                            }))
                                        }
                                        className="max-w-full"
                                        color="primary"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs">🎨</span>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            Saturación: {adjustments.saturate}%
                                        </span>
                                    </div>
                                    <Slider
                                        size="sm"
                                        step={5}
                                        minValue={0}
                                        maxValue={200}
                                        value={adjustments.saturate}
                                        onChange={(val) =>
                                            setAdjustments((prev) => ({
                                                ...prev,
                                                saturate: val as number,
                                            }))
                                        }
                                        className="max-w-full"
                                        color="secondary"
                                    />
                                </div>
                            </div>

                            {/* Reset button */}
                            <Button
                                size="sm"
                                variant="flat"
                                color="danger"
                                startContent={<FaArrowRotateLeft size={12} />}
                                onPress={resetAll}
                                className="w-full"
                            >
                                Restaurar original
                            </Button>
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter className="border-t border-divider">
                    <Button
                        size="sm"
                        variant="flat"
                        startContent={<FaXmark size={12} />}
                        onPress={onClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        size="sm"
                        color="primary"
                        startContent={<FaCheck size={12} />}
                        onPress={handleSave}
                        isLoading={isSaving}
                    >
                        Aplicar cambios
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
