"use client";

import { Image, Chip } from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import Link from "next/link";
import { registerParticipant } from "@/services/sorteoService";
import { useState } from "react";
import { toast } from "react-toastify";

interface Props {
    isLoggedIn: boolean;
    isParticipating: boolean;
    userId: string | null;
    giveawayId: string;
}

export default function SorteoHomeBanner({
    isLoggedIn,
    isParticipating: initialIsParticipating,
    userId,
    giveawayId,
}: Props) {
    const [isParticipating, setIsParticipating] = useState(initialIsParticipating);
    const [loading, setLoading] = useState(false);

    const handleParticipate = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const result = await registerParticipant(userId, giveawayId);
            if ("error" in result) {
                toast.error(result.error);
            } else {
                setIsParticipating(true);
                toast.success("¡Te registraste en el sorteo!");
            }
        } catch {
            toast.error("Error al registrarse.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="w-full relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="flex flex-col lg:flex-row items-center gap-6 p-6 lg:p-10">
                {/* Texto */}
                <div className="flex flex-col gap-3 lg:w-1/2 text-white z-10">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        GRAN SORTEO
                    </span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                        Anteojos oficiales de la Selección Argentina ⭐⭐⭐
                    </h1>
                    <p className="text-lg text-gray-300">
                        Colección Mundial 2026. ¡Participá y ganá!
                    </p>
                    <Chip
                        className="mt-2 w-fit text-xs font-semibold"
                        color="warning"
                        variant="flat"
                    >
                        COLECCIÓN MUNDIAL 2026
                    </Chip>

                    {/* Botón de acción */}
                    <div className="mt-4">
                        {isLoggedIn ? (
                            isParticipating ? (
                                <Link href="/sorteo">
                                    <SecondaryButton>Ver sorteo</SecondaryButton>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <PrimaryButton
                                        onClick={handleParticipate}
                                        isLoading={loading}
                                    >
                                        Participar
                                    </PrimaryButton>
                                    <Link href="/sorteo">
                                        <span className="text-xs text-gray-400 hover:text-white underline">
                                            Ver más info
                                        </span>
                                    </Link>
                                </div>
                            )
                        ) : (
                            <Link href="/sorteo">
                                <PrimaryButton>Ver sorteo</PrimaryButton>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Imagen */}
                <div className="lg:w-1/2 flex justify-center">
                    <Image
                        src="/sorteo-lentes.png"
                        alt="Premio del sorteo"
                        className="object-contain max-h-[300px] lg:max-h-[400px]"
                        removeWrapper
                    />
                </div>
            </div>
        </section>
    );
}
