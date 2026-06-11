"use client";

import { useState } from "react";
import { Card, CardBody } from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import Link from "next/link";
import { FaUserPlus, FaCheck } from "react-icons/fa6";
import { registerParticipant } from "@/services/sorteoService";
import { toast } from "react-toastify";

interface Props {
    isLoggedIn: boolean;
    isParticipating: boolean;
    userId: string | null;
    giveawayId: string;
    participantsCount: number;
}

export default function SorteoParticipate({
    isLoggedIn,
    isParticipating: initialIsParticipating,
    userId,
    giveawayId,
    participantsCount,
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
            toast.error("Error al registrarse en el sorteo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cómo participar */}
            <Card className="border border-border bg-card" shadow="none">
                <CardBody className="p-6 gap-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        SUMATE AL SORTEO
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold">
                        Participá por estos anteojos oficiales
                    </h2>

                    <div className="flex flex-col gap-4">
                        <StepItem
                            number="1"
                            title="Registrate"
                            description="Crea tu cuenta o iniciá sesión."
                        />
                        <StepItem
                            number="2"
                            title="Participá"
                            description="Hacé click en el botón y quedás inscripto al sorteo."
                        />
                        <StepItem
                            number="3"
                            title="Asistí a la reunión"
                            description="El sorteo es exclusivo para asistentes registrados."
                        />
                    </div>
                </CardBody>
            </Card>

            {/* Acción */}
            <Card className="border border-border bg-card" shadow="none">
                <CardBody className="p-6 flex flex-col items-center justify-center gap-4 text-center">
                    {isLoggedIn ? (
                        isParticipating ? (
                            <>
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <FaCheck className="text-green-600 text-xl" />
                                </div>
                                <h3 className="text-lg font-semibold">¡Ya estás participando!</h3>
                                <p className="text-sm text-muted-foreground">
                                    Estás inscripto en el sorteo. ¡Mucha suerte!
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {participantsCount} participantes inscriptos
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <FaUserPlus className="text-primary text-xl" />
                                </div>
                                <h3 className="text-lg font-semibold">¿Querés participar?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Registrate y formá parte del sorteo.
                                </p>
                                <PrimaryButton
                                    className="w-full max-w-xs mt-2"
                                    onClick={handleParticipate}
                                    isLoading={loading}
                                >
                                    Participar del sorteo
                                </PrimaryButton>
                                <p className="text-xs text-muted-foreground">
                                    {participantsCount} participantes inscriptos
                                </p>
                            </>
                        )
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <FaUserPlus className="text-primary text-xl" />
                            </div>
                            <h3 className="text-lg font-semibold">¿Querés participar?</h3>
                            <p className="text-sm text-muted-foreground">
                                Registrate y formá parte del sorteo.
                            </p>
                            <Link href="/iniciar-sesion" className="w-full max-w-xs">
                                <PrimaryButton className="w-full">Iniciar Sesión</PrimaryButton>
                            </Link>
                            <p className="text-xs text-muted-foreground">¿No tenés cuenta?</p>
                            <Link href="/registrarse" className="w-full max-w-xs">
                                <SecondaryButton className="w-full">
                                    Crear Cuenta Gratis
                                </SecondaryButton>
                            </Link>
                            <p className="text-xs text-muted-foreground mt-2">
                                🔒 Es rápido, gratuito y seguro. Tus datos están protegidos.
                            </p>
                        </>
                    )}
                </CardBody>
            </Card>
        </section>
    );
}

function StepItem({
    number,
    title,
    description,
}: {
    number: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">{number}</span>
            </div>
            <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
