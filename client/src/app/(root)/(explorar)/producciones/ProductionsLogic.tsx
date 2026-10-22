"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Chip, Link as UiLink, Tab, Tabs } from "@nextui-org/react";
import { FaPlus, FaUserFriends } from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";
import { MdContacts } from "react-icons/md";
import { findAllProductions } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import ErrorCard from "@/components/ErrorCard";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import SearchPosts from "@/components/inputs/SearchPosts";
import TabTitle from "@/components/solapas/TabTitle";
import SelectManualLocationModal from "@/components/modals/SelectManualLocation/SelectManualLocationModal";
import { INITIAL_LOCATION } from "@/components/modals/SelectManualLocation/ManualLocationPicker";
import { useLocation } from "@/app/(root)/providers/LocationProvider";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { CREATE_PRODUCTION, PROFILE } from "@/utils/data/urls";
import {
  ProductionAccessFilter,
  ProductionBehaviourType,
  ProductionExploreFilters,
  ProductionResponse,
} from "@/types/productionTypes";
import ProductionListCard from "./components/ProductionListCard";

const PAGE_SIZE = 20;

type AgendaRelation = NonNullable<ProductionExploreFilters["relation"]>;

/** Sub-solapas por el ticket del blog completo ("all" = sin filtrar). */
type AccessTab = ProductionAccessFilter | "all";
const ACCESS_TABS: { key: AccessTab; title: string }[] = [
  { key: "all", title: "Todos" },
  { key: ProductionAccessFilter.free, title: "Gratuitos" },
  { key: ProductionAccessFilter.freeTicket, title: "Ticket gratis" },
  { key: ProductionAccessFilter.paidTicket, title: "Ticket pago" },
];

const TITLES: Record<ProductionBehaviourType | "all", string> = {
  all: "Producciones",
  [ProductionBehaviourType.libre]: "Producciones Libres",
  [ProductionBehaviourType.agenda]: "Producciones de Contactos",
};

/**
 * Explorar de Producciones, con las mismas solapas que Anuncios:
 * - Todas (`behaviourType` sin valor): todo lo que el usuario puede ver; los
 *   blogs libres, sólo si está dentro de su radio.
 * - Libres: blogs libres de otros dentro del radio, con sub-solapas por el
 *   ticket del blog (Todos / Gratuitos / Ticket gratis / Ticket pago).
 * - Agenda de contactos: blogs de agenda de sus contactos, con sub-solapas
 *   por tipo de relación y, dentro de cada una, las mismas de ticket.
 * La búsqueda viaja en `?busqueda=` (como Anuncios) y la ubicación sale de
 * `LocationProvider`, con el mismo selector manual.
 */
const ProductionsLogic = ({
  behaviourType,
}: {
  behaviourType?: ProductionBehaviourType;
}) => {
  const isAgenda = behaviourType === ProductionBehaviourType.agenda;
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const busqueda = searchParams.get("busqueda") || "";
  const { userIdLogged } = useUserData();
  const { coordinates, requestLocationPermission, manualLocation } =
    useLocation();

  const [relation, setRelation] = useState<AgendaRelation>("hierarchy");
  const [access, setAccess] = useState<AccessTab>("all");
  // "Todas" no tiene sub-solapas.
  const hasAccessTabs = !!behaviourType;
  const [productions, setProductions] = useState<ProductionResponse[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // La ubicación con la que se busca: la del dispositivo (si se autoriza) o la
  // elegida a mano. En Agenda no se usa.
  const [userLocation, setUserLocation] = useState<
    ProductionExploreFilters["userLocation"] | undefined
  >(undefined);

  // Igual que Anuncios: si todavía es la ubicación por defecto, se pide permiso
  // al dispositivo una vez; si la rechaza, se usa la que haya.
  useEffect(() => {
    if (isAgenda) return;
    let active = true;
    const resolve = async () => {
      let resolved = coordinates;
      if (
        !manualLocation &&
        (!coordinates || coordinates.latitude === INITIAL_LOCATION.lat)
      ) {
        try {
          // Cualquier tipo "location aware" sirve para pedir el permiso.
          resolved =
            (await requestLocationPermission({
              typeOfData: "posts",
              postType: "libre",
            })) ?? coordinates;
        } catch {
          resolved = coordinates;
        }
      }
      if (active) setUserLocation(resolved);
    };
    resolve();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAgenda, coordinates?.latitude, coordinates?.longitude, manualLocation]);

  const load = useCallback(
    async (pageToLoad: number) => {
      setIsLoading(true);
      const result = await findAllProductions(
        pageToLoad,
        PAGE_SIZE,
        busqueda || undefined,
        {
          behaviourType,
          userLocation: isAgenda ? null : userLocation ?? null,
          relation: isAgenda ? relation : undefined,
          access: hasAccessTabs && access !== "all" ? access : undefined,
        }
      );
      if (isProductionActionError(result)) {
        setError(result.error);
      } else {
        setError(null);
        setProductions((prev) =>
          pageToLoad === 1 ? result.productions : [...prev, ...result.productions]
        );
        setHasMore(result.hasMore);
        setPage(pageToLoad);
      }
      setIsLoading(false);
    },
    [behaviourType, busqueda, userLocation, isAgenda, relation, hasAccessTabs, access]
  );

  useEffect(() => {
    // Espera a resolver la ubicación (undefined) antes de la primera carga.
    if (!isAgenda && userLocation === undefined) return;
    load(1);
  }, [load, userLocation, isAgenda]);

  return (
    <section className="w-full flex-col flex gap-4">
      <div className="w-full flex items-center justify-between gap-4 flex-wrap">
        <h2>
          {TITLES[behaviourType ?? "all"]}
          {busqueda ? ` - «${busqueda}»` : ""}
        </h2>
        <PrimaryButton as={Link} href={CREATE_PRODUCTION}>
          Crear producción
        </PrimaryButton>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <SearchPosts searchTerms={[]} setSearchTerms={() => undefined} />
        {busqueda && (
          <Chip
            size="sm"
            variant="bordered"
            onClose={() => router.push(pathname)}
          >
            Búsqueda: {busqueda}
          </Chip>
        )}
      </div>

      {!isAgenda && <SelectManualLocationModal showAlways />}

      {isAgenda && (
        <>
          <Tabs
            selectedKey={relation}
            onSelectionChange={(key) => setRelation(key as AgendaRelation)}
            aria-label="solapas de blogs según el tipo de relación con el dueño"
            variant="underlined"
          >
            <Tab
              key="hierarchy"
              title={<TabTitle title="Todos" icon={<FaUserGroup />} />}
            />
            <Tab
              key="contacts"
              title={<TabTitle title="Contactos" icon={<MdContacts />} />}
            />
            <Tab
              key="friends"
              title={<TabTitle title="Amigos" icon={<FaUserFriends />} />}
            />
            <Tab
              key="topfriends"
              title={
                <TabTitle
                  title="Top Amigos"
                  icon={
                    <>
                      <FaPlus className="size-3 md:size-4 " />
                      <FaUserFriends className="size-5 md:size-6 " />
                    </>
                  }
                />
              }
            />
          </Tabs>
        </>
      )}

      {hasAccessTabs && (
        <Tabs
          selectedKey={access}
          onSelectionChange={(key) => setAccess(key as AccessTab)}
          aria-label="solapas de blogs según cómo se entra: sin ticket, ticket gratis o ticket pago"
          variant="bordered"
          size="sm"
          className="max-w-full overflow-x-auto"
        >
          {ACCESS_TABS.map((tab) => (
            <Tab key={tab.key} title={tab.title} />
          ))}
        </Tabs>
      )}

      {isAgenda && (
        <>
          <p className="text-sm">
            Únicamente aparecerán blogs de relaciones activas. Para
            gestionarlas, ve a tu{" "}
            <UiLink
              className="text-primary"
              href={`${PROFILE}/${userIdLogged}/contactos`}
            >
              cartel
            </UiLink>
          </p>
        </>
      )}

      {error ? (
        <ErrorCard message={error} />
      ) : productions.length === 0 && isLoading ? (
        <p className="text-sm text-default-500">Cargando producciones...</p>
      ) : productions.length === 0 ? (
        <p className="text-sm text-default-500">
          {busqueda
            ? "No se encontraron producciones para tu búsqueda."
            : "Todavía no hay producciones para mostrar."}
        </p>
      ) : (
        <>
          <div className="w-full grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 lg:gap-5 items-start">
            {productions.map((production) => (
              <ProductionListCard
                key={production._id}
                production={production}
              />
            ))}
          </div>
          {hasMore && (
            <SecondaryButton
              className="self-center"
              onClick={() => load(page + 1)}
              disabled={isLoading}
            >
              {isLoading ? "Cargando…" : "Ver más"}
            </SecondaryButton>
          )}
        </>
      )}
    </section>
  );
};

export default ProductionsLogic;
