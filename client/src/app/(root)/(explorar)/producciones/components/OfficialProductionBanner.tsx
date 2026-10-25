import Link from "next/link";
import { FaStar, FaUsers } from "react-icons/fa";
import { findProduction } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { OFFICIAL_PRODUCTION_ID } from "@/utils/data/officialProductionConfig";
import { PRODUCTIONS } from "@/utils/data/urls";
import { resolveProductionFileUrl } from "../productionMedia";

/**
 * Banner del blog oficial de Soonpublicité en el home. Es horizontal (más
 * ancho que alto), distinto de `ProductionListCard`. Si el blog no existe o
 * hay error, no renderiza nada.
 */
const OfficialProductionBanner = async () => {
  const production = await findProduction(OFFICIAL_PRODUCTION_ID);
  if (isProductionActionError(production) || !production?._id) return null;

  const coverUrl = resolveProductionFileUrl(production.headerPhotoKey);

  return (
    <section className="w-full">
      <Link
        href={`${PRODUCTIONS}/${production._id}`}
        className="group flex flex-col md:flex-row w-full overflow-hidden rounded-xl border border-default-200 bg-white hover:shadow-md transition-shadow duration-500"
      >
        <div className="relative w-full md:w-1/2 lg:w-3/5 aspect-[16/7] md:aspect-auto md:min-h-[220px] lg:min-h-[260px] bg-default-100 shrink-0">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={`Portada de ${production.title}`}
              className="absolute inset-0 size-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-white p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Soonpublicité"
                className="max-h-[60%] max-w-[70%] object-contain"
              />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-2 p-5 md:p-6 lg:p-8 min-w-0">
          <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Producción oficial de Soonpublicité
          </span>
          <h2 className="line-clamp-2">{production.title}</h2>
          {production.description && (
            <p className="text-light-text text-sm lg:text-base line-clamp-3">
              {production.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-light-text text-sm font-semibold">
            <span className="flex items-center gap-1">
              <FaUsers /> {production.fansCount}
            </span>
            {production.rating != null && (
              <span className="flex items-center gap-1">
                <FaStar /> {production.rating.toFixed(1)}
              </span>
            )}
          </div>
          <span className="mt-2 text-sm font-semibold text-primary group-hover:underline">
            Visitar el blog →
          </span>
        </div>
      </Link>
    </section>
  );
};

export default OfficialProductionBanner;
