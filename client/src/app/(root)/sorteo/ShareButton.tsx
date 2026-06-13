"use client";

import { Button } from "@nextui-org/react";
import { FaShareNodes } from "react-icons/fa6";
import { toast } from "react-toastify";

export default function ShareButton() {
    const handleShare = async () => {
        const shareData = {
            title: "Sorteo Anteojos Oficiales Selección Argentina - Publicité",
            text: "Participá del sorteo de anteojos oficiales de la Selección Argentina ⭐⭐⭐ Colección Mundial 2026. Sorteo en vivo el 27 de Junio a las 22hs.",
            url: `${window.location.origin}/sorteo`,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // User cancelled share
                if ((err as Error).name !== "AbortError") {
                    copyToClipboard(shareData.url);
                }
            }
        } else {
            copyToClipboard(shareData.url);
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("¡Link copiado al portapapeles!");
    };

    return (
        <Button
            className="w-full max-w-md font-semibold"
            color="primary"
            variant="flat"
            startContent={<FaShareNodes />}
            size="lg"
            onClick={handleShare}
        >
            Compartir sorteo
        </Button>
    );
}
