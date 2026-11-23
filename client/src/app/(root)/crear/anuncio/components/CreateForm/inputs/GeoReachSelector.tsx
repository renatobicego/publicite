import { Slider, Spinner } from "@nextui-org/react";
import {
  GeoReachScope,
  GeoZoneLevel,
  ZONE_LEVELS_DESC,
  ZONE_LEVEL_LABEL,
} from "@/utils/data/geoReach";

type Choice = "world" | GeoZoneLevel | "radius";

const CHOICES: Choice[] = ["world", ...ZONE_LEVELS_DESC, "radius"];

/**
 * Cómo se limita dónde se ve un anuncio o un blog, como los discos de una
 * cerradura: del más grande (todo el mundo) al más chico (el barrio), o un
 * radio en km. Una zona es la división real (provincia, ciudad…): a diferencia
 * del radio, no cruza el límite (un anuncio sólo de CABA no llega a Montevideo).
 */
const GeoReachSelector = ({
  scope,
  zoneLevel,
  zoneNames,
  isLoadingZones,
  ratio,
  onChange,
  onRatioChange,
}: {
  scope: GeoReachScope;
  zoneLevel?: GeoZoneLevel | null;
  /** Nombre de cada zona del punto elegido (sin nombre = no disponible). */
  zoneNames: Partial<Record<GeoZoneLevel, string>>;
  isLoadingZones: boolean;
  /** En km. */
  ratio: number;
  onChange: (scope: GeoReachScope, zoneLevel: GeoZoneLevel | null) => void;
  onRatioChange: (ratio: number) => void;
}) => {
  const selected: Choice =
    scope === "zone" && zoneLevel ? zoneLevel : scope === "world" ? "world" : "radius";

  const select = (choice: Choice) => {
    if (choice === "world" || choice === "radius") onChange(choice, null);
    else onChange("zone", choice);
  };

  const missingSelectedZone =
    scope === "zone" && !!zoneLevel && !isLoadingZones && !zoneNames[zoneLevel];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">¿Dónde se ve?</span>
        {isLoadingZones && <Spinner size="sm" color="warning" />}
      </div>
      <div
        role="radiogroup"
        aria-label="Dónde se ve"
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2"
      >
        {CHOICES.map((choice, index) => {
          const isZone = choice !== "world" && choice !== "radius";
          const name =
            choice === "world"
              ? "Todos, estén donde estén"
              : choice === "radius"
                ? `${ratio} km a la redonda`
                : zoneNames[choice];
          const isDisabled = isZone && !isLoadingZones && !name;
          const isSelected = selected === choice;
          // Disco: cada nivel más chico que el anterior.
          const disc = 22 - Math.min(index, 5) * 3;
          return (
            <button
              key={choice}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isDisabled}
              onClick={() => select(choice)}
              className={`flex flex-col items-start gap-1 rounded-xl border-2 p-2 text-left transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-default-200 hover:border-default-400"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={`inline-block rounded-full border-2 ${
                    choice === "radius"
                      ? "border-dashed border-danger"
                      : isSelected
                        ? "border-primary bg-primary/20"
                        : "border-default-400"
                  }`}
                  style={{ width: disc, height: disc }}
                />
                <span className="text-sm font-semibold">
                  {choice === "world"
                    ? "Mundo"
                    : choice === "radius"
                      ? "Radio"
                      : ZONE_LEVEL_LABEL[choice]}
                </span>
              </span>
              <span className="text-xs text-default-500 line-clamp-2">
                {name ?? (isLoadingZones ? "Buscando…" : "No disponible acá")}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-default-500">
        {selected === "world"
          ? "Lo ve cualquier persona, en cualquier lugar."
          : selected === "radius"
            ? "Lo ve quien esté dentro del círculo, aunque sea de otra ciudad o de otro país."
            : `Lo ve sólo quien esté en ${zoneNames[selected] ?? `esa ${ZONE_LEVEL_LABEL[selected].toLowerCase()}`}, sin pasar su límite.`}
      </p>
      {missingSelectedZone && (
        <p className="text-xs text-danger">
          No reconocemos la zona &quot;{ZONE_LEVEL_LABEL[zoneLevel!]}&quot; de
          este punto. Elegí otra zona u otro punto en el mapa.
        </p>
      )}

      {selected === "radius" && (
        <Slider
          label="Radio de alcance"
          marks={[
            { value: 5, label: "5km" },
            { value: 50, label: "50km" },
            { value: 100, label: "100km" },
            { value: 200, label: "200km" },
          ]}
          minValue={1}
          maxValue={200}
          value={ratio}
          formatOptions={{ style: "unit", unit: "kilometer" }}
          onChange={(value) => onRatioChange(value as number)}
        />
      )}
    </div>
  );
};

export default GeoReachSelector;
