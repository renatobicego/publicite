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
import { FaKey } from "react-icons/fa";
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
import FanButton from "./FanButton";
import ProductionCommunity from "./ProductionCommunity";
import ReportModal from "./ReportModal";
import { FaFlag } from "react-icons/fa";

interface Props {
  initial: ProductionItemsResult;
}

/**
 * Vista de un blog de Mis Producciones: header, navegación por carpetas
 * (breadcrumb + grilla) y controles de staff según `viewer`.
 */
const ProductionBlog = ({ initial }: Props) => {
  const router = useRouter();
  const [data, setData] = useState<ProductionItemsResult>(initial);
  const [currentParentId, setCurrentParentId] = useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);

  const production = data.production;
  const canEdit = production.viewer?.canEdit;
  const canManageAccess = production.viewer?.canManageAccess;

  const accessKeyModal = useDisclosure();
  const accessSettings = useDisclosure();
  const reportModal = useDisclosure();

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
    [production._id]
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
        "¿Seguro que querés borrar el blog? Se borra todo su contenido y no se puede deshacer."
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

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <header className="w-full flex flex-col gap-3">
        {production.headerPhotoKey && (
          <Image
            removeWrapper
            alt={production.title}
            src={resolveProductionFileUrl(production.headerPhotoKey)}
            className="w-full max-h-60 object-cover rounded-lg"
          />
        )}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2>{production.title}</h2>
            {production.description && (
              <p className="text-sm text-default-600 mt-1">
                {production.description}
              </p>
            )}
          </div>
          {canEdit && (
            <div className="flex gap-2 flex-wrap">
              {canManageAccess && (
                <SecondaryButton
                  startContent={<FaKey />}
                  onClick={accessSettings.onOpen}
                >
                  Alcance y clave
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
        {production.welcomeText && (
          <p className="text-sm italic text-default-500">
            {production.welcomeText}
          </p>
        )}
        {production.viewer?.role !== "admin" && (
          <div className="flex items-center gap-2 flex-wrap">
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
      </header>

      {/* Breadcrumb del árbol */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
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

      {/* Grilla del nivel actual */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : data.items.length === 0 ? (
        <p className="text-sm text-default-500 py-10 text-center">
          Esta carpeta está vacía.
        </p>
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
        />
      )}
    </div>
  );
};

export default ProductionBlog;
