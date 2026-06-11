import { GiveawayWinner } from "@/types/sorteo";
import { Card, CardBody, Image } from "@nextui-org/react";
import { FaTrophy } from "react-icons/fa6";

interface Props {
    winner: GiveawayWinner;
}

export default function SorteoWinner({ winner }: Props) {
    return (
        <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Info del ganador */}
            <Card className="border border-border bg-card" shadow="none">
                <CardBody className="p-6 gap-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        ÚLTIMO GANADOR
                    </span>

                    <div className="flex items-center gap-4">
                        <Image
                            src={winner.profilePhotoUrl}
                            alt={winner.username}
                            className="w-16 h-16 rounded-full object-cover"
                            removeWrapper
                        />
                        <div>
                            <p className="text-lg font-bold">{winner.username}</p>
                            <p className="text-sm text-muted-foreground">
                                Ganador del sorteo
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Felicitación */}
            <Card className="border border-border bg-card" shadow="none">
                <CardBody className="p-6 flex flex-col justify-center items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                        <FaTrophy className="text-yellow-600 text-xl" />
                    </div>
                    <h3 className="text-lg font-bold">
                        ¡Felicitaciones {winner.username.split(" ")[0]}!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Gracias a todos por participar. Nos vemos en la próxima reunión.
                    </p>
                </CardBody>
            </Card>
        </section>
    );
}
