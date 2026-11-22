import { Chip, Link } from "@nextui-org/react";
import { AdSpacePost } from "@/types/postTypes";
import {
  AD_SPACE_EDITIONS,
  AD_SPACE_FIELD_LABEL,
  AdSpaceField,
  adSpaceCoverageLabel,
  adSpaceMediumOf,
} from "@/utils/data/adSpaces";

const formatValue = (field: AdSpaceField, value: unknown): string | null => {
  if (value === null || value === undefined || value === "") return null;
  if (Array.isArray(value)) return value.length ? value.join(", ") : null;
  switch (field) {
    case "illuminated":
      return value ? "Sí" : "No";
    case "edition":
      return AD_SPACE_EDITIONS.find((e) => e.value === value)?.label ?? null;
    case "followers":
      return Number(value).toLocaleString("es-AR");
    default:
      return String(value);
  }
};

/** Datos del espacio publicitario en el detalle del anuncio. */
const AdSpaceDetails = ({ post }: { post: AdSpacePost }) => {
  const adSpace = post.adSpace;
  const info = adSpaceMediumOf(adSpace?.medium);
  if (!adSpace || !info) return null;
  const Icon = info.icon;

  const rows: { label: string; value: React.ReactNode }[] = [];
  const push = (label: string, value: React.ReactNode | null) => {
    if (value !== null && value !== undefined && value !== "") rows.push({ label, value });
  };

  push(info.mediaNameLabel, adSpace.mediaName);
  if (info.reach === "area") {
    const area = adSpaceCoverageLabel(adSpace.coverageArea);
    push(
      "Alcance del medio",
      area ? `${area}${adSpace.coverageName ? ` (${adSpace.coverageName})` : ""}` : null
    );
  }
  if (info.reach === "place") push("Dirección", adSpace.placeAddress ?? null);
  for (const field of info.fields) {
    if (field === "band" && adSpace.band) continue; // va junto a la frecuencia
    const label =
      field === "frequency" && adSpace.band
        ? `Frecuencia (${adSpace.band})`
        : AD_SPACE_FIELD_LABEL[field];
    push(label, formatValue(field, (adSpace as any)[field]));
  }
  push("Audiencia estimada", adSpace.audience ?? null);
  if (adSpace.mediaUrl) {
    push(
      info.reach === "online" ? "Sitio o perfil" : "Link al medio",
      <Link
        href={adSpace.mediaUrl}
        isExternal
        showAnchorIcon
        size="sm"
        className="break-all"
      >
        {adSpace.mediaUrl}
      </Link>
    );
  }

  return (
    <section className="flex flex-col gap-2 rounded-xl border border-default-200 p-3">
      <h6 className="flex items-center gap-2 font-semibold">
        <Icon className="text-warning" /> Espacio publicitario · {info.label}
      </h6>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-light-text">{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      {adSpace.formats && adSpace.formats.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {adSpace.formats.map((format) => (
            <Chip key={format} size="sm" variant="flat" color="warning">
              {format}
            </Chip>
          ))}
        </div>
      )}
      <p className="text-xs text-light-text">
        Soonpublicité genera el contacto, no realiza ventas: la contratación y
        el pago se arreglan directamente con el anunciante.
      </p>
    </section>
  );
};

export default AdSpaceDetails;
