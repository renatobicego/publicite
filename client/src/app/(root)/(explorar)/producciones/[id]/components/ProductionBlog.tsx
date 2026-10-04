"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Breadcrumbs,
  BreadcrumbItem,
  Image,
  Spinner,
  useDisclosure,
} from "@nextui-org/react";
import { FaKey, FaLock, FaReceipt, FaShoppingCart } from "react-icons/fa";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { toastifyError } from "@/utils/functions/toastify";
import {
  ProductionItemKind,
  ProductionItemResponse,
  ProductionItemsResult,
  ProductionLockReason,
} from "@/types/productionTypes";
import {
  getProductionItems,
  deleteProduction,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { resolveProductionFileUrl } from "../../productionMedia";
import { EDIT_PRODUCTION, PRODUCTIONS } from "@/utils/data/urls";
import ProductionItemCard from "./ProductionItemCard";
import ProductionStaffToolbar from "./ProductionStaffToolbar";
import AccessKeyModal from "./AccessKeyModal";
import ProductionAccessSettings from "./ProductionAccessSettings";
import TicketManagerModal from "./TicketManagerModal";
import TicketCheckoutModal from "./TicketCheckoutModal";
import TicketSalesModal from "./TicketSalesModal";
import FanButton from "./FanButton";
import ProductionCommunity from "./ProductionCommunity";
import ReportModal from "./ReportModal";
import { FaFlag } from "react-icons/fa";

interface Props {
  initial: ProductionItemsResult;
}

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

// "Este blog tiene 3 archivos y tiene 2 carpetas con 5 archivos dentro."
// Los artículos cuentan como archivos.
const blogContentSummary = (
  rootFiles: number,
  folders: number,
  filesInFolders: number,
) => {
  const loose = plural(rootFiles, "archivo", "archivos");
  if (folders <= 0) return `Este blog tiene ${loose}.`;
  const inFolders = `${plural(folders, "carpeta", "carpetas")} con ${plural(
    filesInFolders,
    "archivo",
    "archivos",
  )} dentro`;
  return rootFiles > 0
    ? `Este blog tiene ${loose} y tiene ${inFolders}.`
    : `Este blog tiene ${inFolders}.`;
};

/**
 * Vista de un blog de Mis Producciones: header, navegación por carpetas
 * (breadcrumb + grilla) y controles de staff según `viewer`.
 */
const ProductionBlog = ({ initial }: Props) => {
  const router = useRouter();
  const [data, setData] = useState<ProductionItemsResult>(initial);
  const [currentParentId, setCurrentParentId] = useState<string | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(false);

  const production = data.production;
  const canEdit = production.viewer?.canEdit;
  const canManageAccess = production.viewer?.canManageAccess;

  const accessKeyModal = useDisclosure();
  const accessSettings = useDisclosure();
  const blogTicketModal = useDisclosure();
  const salesModal = useDisclosure();
  const reportModal = useDisclosure();
  const levelCheckout = useDisclosure();

  // Si el blog está bloqueado por clave, abrir el modal de ingreso.
  const lockedByKey =
    production.viewer?.lockReason === ProductionLockReason.accessKey;
  useEffect(() => {
    if (lockedByKey) {
      accessKeyModal.onOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedByKey]);

  const loadLevel = useCallback(
    async (parentId?: string) => {
      setLoading(true);
      try {
        const res = await getProductionItems(production._id, parentId);
        if (isProductionActionError(res)) {
          toastifyError(res.error);
          return;
        }
        setData(res);
        setCurrentParentId(parentId);
      } finally {
        setLoading(false);
      }
    },
    [production._id],
  );

  const reloadBlog = () => {
    router.refresh();
    loadLevel(currentParentId);
  };

  const handleOpen = (item: ProductionItemResponse) => {
    if (item.kind === ProductionItemKind.folder) {
      loadLevel(item._id);
      return;
    }
    // Archivos y artículos: al detalle del ítem.
    router.push(`${PRODUCTIONS}/${production._id}/item/${item._id}`);
  };

  const handleDeleteBlog = async () => {
    if (
      !confirm(
        "¿Seguro que querés borrar el blog? Se borra todo su contenido y no se puede deshacer.",
      )
    ) {
      return;
    }
    const res = await deleteProduction(production._id);
    if (isProductionActionError(res)) {
      toastifyError(res.error);
      return;
    }
    router.push(PRODUCTIONS);
    router.refresh();
  };

  // Ítems de este nivel bloqueados por un ticket heredado (del blog o de la
  // carpeta donde estamos): se compra una sola vez, desde el aviso del nivel.
  const inheritedLocked = data.items.filter(
    (item) =>
      !item.access?.canViewContent &&
      item.access?.lockReason === ProductionLockReason.ticket &&
      !!item.access.ticket &&
      item.access.ticket.target !== item._id,
  );
  const levelTicket = inheritedLocked[0]?.access.ticket ?? null;
  const levelTicketIsBlog = !!levelTicket && !levelTicket.target;
  const rootFilesCount = production.rootFilesCount ?? 0;
  const lockedFolders = inheritedLocked.filter(
    (item) => item.kind === ProductionItemKind.folder,
  ).length;

  const blogInitial = production.title?.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header: tarjeta con portada cuadrada, título, acciones y estadísticas */}
      <header className="w-full overflow-hidden rounded-2xl border border-default-200 bg-content1 shadow-sm">
        <div className="flex flex-col gap-5 p-4 sm:flex-row sm:p-6">
          {/* Portada cuadrada (respeta su relación de aspecto) */}
          <div className="mx-auto aspect-square w-40 shrink-0 overflow-hidden rounded-xl border border-default-200 bg-gradient-to-br from-primary/10 via-secondary/5 to-default-100 shadow-sm sm:mx-0 sm:w-44">
            {production.headerPhotoKey ? (
              <Image
                removeWrapper
                alt={production.title}
                src={resolveProductionFileUrl(production.headerPhotoKey)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-default-800">
                {blogInitial}
              </div>
            )}
          </div>

          {/* Info + acciones */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold leading-tight sm:text-2xl">
                  {production.title}
                </h2>
                {production.description && (
                  <p className="mt-1 text-sm text-default-500">
                    {production.description}
                  </p>
                )}
              </div>

              {/* Acciones de staff */}
              {canEdit && (
                <div className="flex flex-wrap gap-2">
                  {canManageAccess && (
                    <SecondaryButton
                      startContent={<FaKey />}
                      onClick={accessSettings.onOpen}
                    >
                      Alcance y clave
                    </SecondaryButton>
                  )}
                  {canManageAccess && (
                    <SecondaryButton
                      startContent={<FaReceipt />}
                      onClick={salesModal.onOpen}
                    >
                      Ventas de tickets
                    </SecondaryButton>
                  )}
                  <SecondaryButton
                    onClick={() =>
                      router.push(`${EDIT_PRODUCTION}/${production._id}`)
                    }
                  >
                    Editar blog
                  </SecondaryButton>
                  {production.viewer?.canDelete && (
                    <PrimaryButton variant="light" onClick={handleDeleteBlog}>
                      Borrar blog
                    </PrimaryButton>
                  )}
                </div>
              )}
            </div>

            {/* Texto de bienvenida */}
            {production.welcomeText && (
              <p className="mt-3 border-l-2 border-primary/40 pl-3 text-sm italic text-default-500">
                {production.welcomeText}
              </p>
            )}

            {/* Acciones de visitante (fan / denuncia) */}
            {production.viewer?.role !== "admin" && (
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                <FanButton
                  productionId={production._id}
                  isFan={production.viewer?.isFan ?? false}
                  fansCount={production.fansCount}
                  onChanged={reloadBlog}
                />
                <SecondaryButton
                  startContent={<FaFlag />}
                  onClick={reportModal.onOpen}
                >
                  Denunciar
                </SecondaryButton>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Breadcrumb del árbol + acciones de creación */}
      <div className="flex items-center justify-between gap-4 flex-wrap rounded-xl border border-default-200 bg-content1 px-4 py-2.5">
        <Breadcrumbs>
          <BreadcrumbItem
            onPress={() => loadLevel(undefined)}
            isCurrent={!currentParentId}
          >
            Inicio
          </BreadcrumbItem>
          {data.breadcrumb.map((crumb, index) => (
            <BreadcrumbItem
              key={crumb._id}
              onPress={() => loadLevel(crumb._id)}
              isCurrent={index === data.breadcrumb.length - 1}
            >
              {crumb.name}
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
        {canEdit && (
          <ProductionStaffToolbar
            productionId={production._id}
            parentId={currentParentId}
            onCreated={() => loadLevel(currentParentId)}
          />
        )}
      </div>

      {/* Aviso de ticket del nivel (visitante sin acceso) */}
      {!loading && levelTicket && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <FaLock className="mt-1 text-warning-600" />
            <div>
              <p className="text-sm font-medium">
                {levelTicketIsBlog
                  ? "Este blog requiere ticket"
                  : "Esta carpeta requiere ticket"}
              </p>
              <p className="text-xs text-default-600">
                {levelTicketIsBlog
                  ? blogContentSummary(
                      rootFilesCount,
                      production.foldersCount ?? 0,
                      Math.max(0, production.filesCount - rootFilesCount),
                    )
                  : `Esta carpeta tiene ${plural(
                      inheritedLocked.length - lockedFolders,
                      "archivo",
                      "archivos",
                    )}${
                      lockedFolders > 0
                        ? ` y ${plural(lockedFolders, "carpeta", "carpetas")}`
                        : ""
                    }.`}{" "}
                {levelTicket.isPaid
                  ? "Comprá el ticket para acceder a todo el contenido."
                  : "Obtené el ticket gratuito para acceder a todo el contenido."}
              </p>
            </div>
          </div>
          <PrimaryButton
            startContent={<FaShoppingCart />}
            onClick={levelCheckout.onOpen}
          >
            {levelTicket.isPaid
              ? `Comprar (${levelTicket.currency} ${levelTicket.price})`
              : "Obtener acceso"}
          </PrimaryButton>
        </div>
      )}

      {/* Grilla del nivel actual */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : data.items.length === 0 ? (
        <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-default-200 py-12 text-center">
          <span className="text-3xl">📂</span>
          <p className="text-sm font-medium text-default-600">
            Esta carpeta está vacía.
          </p>
          {canEdit && (
            <p className="text-xs text-default-400">
              Creá una carpeta, subí un archivo o escribí un artículo para
              empezar.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 lg:gap-5 items-start">
          {data.items.map((item) => (
            <ProductionItemCard
              key={item._id}
              item={item}
              onOpen={handleOpen}
              canEdit={canEdit}
              canManageAccess={canManageAccess}
              onItemChanged={() => loadLevel(currentParentId)}
              aliasCbu={production.aliasCbu}
              canManagePayout={production.viewer?.canManagePayout}
              commissionPercent={production.ticketCommissionPercent}
              hideCheckout={
                !!levelTicket && item.access?.ticket?._id === levelTicket._id
              }
            />
          ))}
        </div>
      )}

      {/* Reseñas y comentarios. El staff (dueño/moderador) no reseña su
          propio blog, sólo responde comentarios. */}
      <ProductionCommunity
        productionId={production._id}
        isStaff={!!canEdit}
        canReview={!canEdit}
      />

      {/* Denuncia del blog */}
      <ReportModal
        productionId={production._id}
        isOpen={reportModal.isOpen}
        onOpenChange={reportModal.onOpenChange}
      />

      {/* Modal de ingreso de clave (visitante) */}
      <AccessKeyModal
        productionId={production._id}
        isOpen={accessKeyModal.isOpen}
        onOpenChange={accessKeyModal.onOpenChange}
        onUnlocked={() => {
          accessKeyModal.onClose();
          reloadBlog();
        }}
      />

      {/* Config de alcance y clave (staff) */}
      {canManageAccess && (
        <ProductionAccessSettings
          production={production}
          isOpen={accessSettings.isOpen}
          onOpenChange={accessSettings.onOpenChange}
          onChanged={reloadBlog}
          onOpenTicket={() => {
            accessSettings.onClose();
            blogTicketModal.onOpen();
          }}
        />
      )}

      {/* Compra del ticket heredado del nivel (visitante) */}
      {levelTicket && (
        <TicketCheckoutModal
          ticketId={levelTicket._id}
          isOpen={levelCheckout.isOpen}
          onOpenChange={levelCheckout.onOpenChange}
          onPurchased={() => {
            levelCheckout.onClose();
            reloadBlog();
          }}
        />
      )}

      {/* Ventas de tickets de todo el blog (staff) */}
      {canManageAccess && (
        <TicketSalesModal
          productionId={production._id}
          isOpen={salesModal.isOpen}
          onOpenChange={salesModal.onOpenChange}
        />
      )}

      {/* Ticket de todo el blog (staff) */}
      {canManageAccess && (
        <TicketManagerModal
          productionId={production._id}
          targetName={production.title}
          isOpen={blogTicketModal.isOpen}
          onOpenChange={blogTicketModal.onOpenChange}
          onChanged={reloadBlog}
          aliasCbu={production.aliasCbu}
          canManagePayout={production.viewer?.canManagePayout}
          commissionPercent={production.ticketCommissionPercent}
          hasContent={production.filesCount > 0}
        />
      )}
    </div>
  );
};

export default ProductionBlog;
