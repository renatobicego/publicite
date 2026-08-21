"use client";

import { Button } from "@nextui-org/react";
import { FaCube, FaBriefcase, FaGem, FaPalette, FaEllipsis } from "react-icons/fa6";
import { ValuacionCategory } from "@/types/workspaceTypes";

interface CategorySelectorProps {
    onSelect: (category: ValuacionCategory) => void;
}

/**
 * El orden y los textos importan: antes "Imagen" iba primera y con un ícono de
 * cámara, así que la gente que sólo quería subir una foto de su objeto la elegía
 * y Cubito terminaba valuando la fotografía en vez de lo que había en ella.
 * "Imagen" ahora se lee como lo que es: valuar una pieza gráfica.
 */
const categories: {
    value: ValuacionCategory;
    label: string;
    hint: string;
    icon: React.ReactNode;
}[] = [
    { value: "objeto", label: "Objeto", hint: "Algo físico que tenés", icon: <FaCube size={20} /> },
    { value: "bien", label: "Bien", hint: "Auto, inmueble, registrable", icon: <FaGem size={20} /> },
    { value: "servicio", label: "Servicio", hint: "Lo que hacés o vendés", icon: <FaBriefcase size={20} /> },
    { value: "imagen", label: "Imagen", hint: "Logo, diseño o ilustración", icon: <FaPalette size={20} /> },
    { value: "otro", label: "Otro", hint: "No entra en las anteriores", icon: <FaEllipsis size={20} /> },
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
                        className="h-24 flex-col gap-1 border-2 hover:border-warning hover:bg-warning-50"
                        onPress={() => onSelect(cat.value)}
                    >
                        <span className="text-warning">{cat.icon}</span>
                        <span className="text-sm">{cat.label}</span>
                        <span className="text-[10px] leading-tight text-gray-500 text-center whitespace-normal px-1">
                            {cat.hint}
                        </span>
                    </Button>
                ))}
            </div>
            <p className="text-xs text-gray-500 text-center max-w-md -mt-2">
                Podés adjuntar fotos en cualquiera de las categorías: se valúa lo que aparece
                en la foto, no la foto.
            </p>
        </div>
    );
}
