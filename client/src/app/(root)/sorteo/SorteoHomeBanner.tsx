"use client";

import { Card, CardBody, Image } from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import Link from "next/link";
import { FaGift } from "react-icons/fa6";
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
        <Card
            className="w-full border border-border bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden"
            shadow="none"
        >
            <CardBody className="p-5 flex flex-col md:flex-row items-center gap-5">
                {/* Icono / imagen */}
                <div className="shrink-0">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                        <FaGift className="text-primary text-2xl" />
                    </div>
                </div>

                {/* Texto */}
                <div className="flex-1 text-center md:text-left">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        GRAN SORTEO
                    </p>
                    <h3 className="text-lg font-bold mt-1">
                        Anteojos oficiales de la Selección Argentina ⭐⭐⭐
                    </h3>
                    <p className="text-sm text-gray-300 mt-1">
                        Colección Mundial 2026. ¡Participá y ganá!
                    </p>
                </div>

                {/* Acción */}
                <div className="flex flex-col gap-2 items-center shrink-0">
                    {isLoggedIn ? (
                        isParticipating ? (
                            <Link href="/sorteo">
                                <SecondaryButton>Ver sorteo</SecondaryButton>
                            </Link>
                        ) : (
                            <>
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
                            </>
                        )
                    ) : (
                        <Link href="/sorteo">
                            <PrimaryButton>Ver sorteo</PrimaryButton>
                        </Link>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
