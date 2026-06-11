"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@nextui-org/react";
import { FaCalendar, FaClock } from "react-icons/fa6";

interface Props {
    endDate: string;
    hasWinner: boolean;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function calculateTimeLeft(endDate: string): TimeLeft | null {
    const difference = new Date(endDate).getTime() - new Date().getTime();

    if (difference <= 0) return null;

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
    };
}

function formatSorteoDate(endDate: string): { day: string; time: string } {
    const date = new Date(endDate);
    const dayNames = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
    ];
    const monthNames = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
    ];

    const dayName = dayNames[date.getDay()];
    const dayNumber = date.getDate();
    const month = monthNames[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return {
        day: `${dayName} ${dayNumber} de ${month}`,
        time: `${hours}:${minutes} hs.`,
    };
}

export default function SorteoCountdown({ endDate, hasWinner }: Props) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(endDate));
        }, 1000);

        setTimeLeft(calculateTimeLeft(endDate));

        return () => clearInterval(timer);
    }, [endDate]);

    const { day, time } = formatSorteoDate(endDate);
    const isExpired = mounted && timeLeft === null;

    return (
        <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Info del sorteo en vivo */}
            <Card className="border border-border bg-card" shadow="none">
                <CardBody className="p-6 gap-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        SORTEO EN VIVO
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold">
                        El sorteo se realizará en vivo
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Podrás verlo desde esta página el día y horario indicado.
                    </p>

                    {/* Countdown */}
                    {mounted && (
                        <div className="mt-4">
                            {isExpired && !hasWinner ? (
                                <div className="bg-primary/10 rounded-lg p-4 text-center">
                                    <p className="text-sm font-semibold text-primary">
                                        Próximamente se anunciará el ganador
                                    </p>
                                </div>
                            ) : !isExpired ? (
                                <div className="grid grid-cols-4 gap-2">
                                    <CountdownUnit value={timeLeft!.days} label="Días" />
                                    <CountdownUnit value={timeLeft!.hours} label="Horas" />
                                    <CountdownUnit value={timeLeft!.minutes} label="Min" />
                                    <CountdownUnit value={timeLeft!.seconds} label="Seg" />
                                </div>
                            ) : null}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Fecha y hora */}
            <Card className="border border-border bg-card" shadow="none">
                <CardBody className="p-6 flex flex-col justify-center gap-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FaCalendar className="text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">
                                DÍA
                            </p>
                            <p className="text-lg font-bold">{day}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FaClock className="text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">
                                HORA
                            </p>
                            <p className="text-lg font-bold">{time}</p>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </section>
    );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center bg-primary/5 rounded-lg p-3">
            <span className="text-2xl font-bold text-text-color">
                {value.toString().padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
}
