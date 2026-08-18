"use client";

import { Button } from "@nextui-org/react";
import { FaCamera, FaCube, FaBriefcase, FaGem, FaEllipsis } from "react-icons/fa6";
import { ValuacionCategory } from "@/types/workspaceTypes";

interface CategorySelectorProps {
    onSelect: (category: ValuacionCategory) => void;
}

const categories: { value: ValuacionCategory; label: string; icon: React.ReactNode }[] = [
    { value: "imagen", label: "Imagen", icon: <FaCamera size={20} /> },
    { value: "objeto", label: "Objeto", icon: <FaCube size={20} /> },
    { value: "servicio", label: "Servicio", icon: <FaBriefcase size={20} /> },
    { value: "bien", label: "Bien", icon: <FaGem size={20} /> },
    { value: "otro", label: "Otro", icon: <FaEllipsis size={20} /> },
];

export default function CategorySelector({ onSelect }: CategorySelectorProps) {
    return (
        <div className="flex flex-col items-center gap-6">
            <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    ¿Qué querés valuar?
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Seleccioná la categoría para comenzar el proceso de valuación
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md">
                {categories.map((cat) => (
                    <Button
                        key={cat.value}
                        variant="bordered"
                        className="h-20 flex-col gap-2 border-2 hover:border-warning hover:bg-warning-50"
                        onPress={() => onSelect(cat.value)}
                    >
                        <span className="text-warning">{cat.icon}</span>
                        <span className="text-sm">{cat.label}</span>
                    </Button>
                ))}
            </div>
        </div>
    );
}
