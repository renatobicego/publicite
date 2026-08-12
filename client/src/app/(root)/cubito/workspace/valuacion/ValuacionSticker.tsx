"use client";

import { Card, CardBody, Chip } from "@nextui-org/react";
import { FaStar, FaCamera, FaPen, FaRobot } from "react-icons/fa6";
import { ValuacionResult } from "@/types/workspaceTypes";
import RadarChart from "./RadarChart";

interface ValuacionStickerProps {
    result: ValuacionResult;
}

function StarRating({ score }: { score: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <FaStar
                    key={i}
                    size={12}
                    className={i <= Math.round(score) ? "text-warning" : "text-gray-300"}
                />
            ))}
        </div>
    );
}

const SOURCE_ICONS: Record<string, React.ReactNode> = {
    fotografica: <FaCamera size={10} className="text-blue-500" />,
    descriptiva: <FaPen size={10} className="text-green-500" />,
    inferencia_ia: <FaRobot size={10} className="text-purple-500" />,
};

export default function ValuacionSticker({ result }: ValuacionStickerProps) {
    const { photoAnalysis, descriptiveAnalysis, estimatedValues, dataSources } = result;

    // Build radar data
    const radarData: { label: string; value: number }[] = [];
    if (photoAnalysis) {
        radarData.push(
            { label: "Estado", value: photoAnalysis.scores.estado },
            { label: "Marca", value: photoAnalysis.scores.marca },
            { label: "Mercado", value: photoAnalysis.scores.mercado },
            { label: "Rareza", value: photoAnalysis.scores.rareza },
        );
    }
    radarData.push(
        { label: "Uso", value: descriptiveAnalysis.scores.uso },
        { label: "Vida Útil", value: descriptiveAnalysis.scores.vidaUtil },
        { label: "Mantenimiento", value: descriptiveAnalysis.scores.mantenimiento },
        { label: "Documentación", value: descriptiveAnalysis.scores.documentacion },
    );

    return (
        <Card className="shadow-lg border border-gray-200 dark:border-slate-600" id="valuacion-sticker">
            <CardBody className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Chip
                        color={result.layer === 3 ? "success" : result.layer === 2 ? "primary" : "warning"}
                        variant="flat"
                        size="sm"
                    >
                        Capa {result.layer} — {result.completionPercent}%
                    </Chip>
                    {result.versionsCount > 1 && (
                        <span className="text-xs text-gray-400">Versión {result.versionsCount}</span>
                    )}
                </div>

                {/* Final score */}
                <div className="text-center">
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        ★ {result.finalScore.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500">Puntuación Final</p>
                </div>

                {/* Radar chart */}
                <RadarChart data={radarData} />

                {/* Análisis Fotográfico */}
                {photoAnalysis && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                            <FaCamera size={12} className="text-blue-500" /> Análisis Fotográfico
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{photoAnalysis.description}</p>
                        {photoAnalysis.brand && (
                            <p className="text-xs"><strong>Marca:</strong> {photoAnalysis.brand} {photoAnalysis.model ? `— ${photoAnalysis.model}` : ""}</p>
                        )}
                        <div className="grid grid-cols-2 gap-1 text-xs">
                            <div className="flex justify-between items-center">
                                <span>Estado</span><StarRating score={photoAnalysis.scores.estado} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Marca</span><StarRating score={photoAnalysis.scores.marca} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Mercado</span><StarRating score={photoAnalysis.scores.mercado} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Rareza</span><StarRating score={photoAnalysis.scores.rareza} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Análisis Descriptivo */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <FaPen size={12} className="text-green-500" /> Análisis Descriptivo
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{descriptiveAnalysis.summary}</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="flex justify-between items-center">
                            <span>Uso</span><StarRating score={descriptiveAnalysis.scores.uso} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Vida Útil</span><StarRating score={descriptiveAnalysis.scores.vidaUtil} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Mantenimiento</span><StarRating score={descriptiveAnalysis.scores.mantenimiento} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Documentación</span><StarRating score={descriptiveAnalysis.scores.documentacion} />
                        </div>
                    </div>
                </div>

                {/* Valores Estimados */}
                {estimatedValues && (
                    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Valores Estimados</h4>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                                <p className="text-xs text-gray-500">Liquidación</p>
                                <p className="text-sm font-bold">{estimatedValues.liquidacion ? `USD ${estimatedValues.liquidacion}` : "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Mercado</p>
                                <p className="text-sm font-bold text-success">{estimatedValues.mercado ? `USD ${estimatedValues.mercado}` : "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Premium</p>
                                <p className="text-sm font-bold">{estimatedValues.premium ? `USD ${estimatedValues.premium}` : "—"}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confianza + Fuentes */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Confianza IA: {result.confidencePercent}%</span>
                    <div className="flex items-center gap-2">
                        {dataSources.some((d) => d.source === "fotografica") && SOURCE_ICONS.fotografica}
                        {dataSources.some((d) => d.source === "descriptiva") && SOURCE_ICONS.descriptiva}
                        {dataSources.some((d) => d.source === "inferencia_ia") && SOURCE_ICONS.inferencia_ia}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
