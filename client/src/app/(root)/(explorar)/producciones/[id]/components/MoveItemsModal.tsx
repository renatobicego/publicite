"use client";
import { useCallback, useEffect, useState } from "react";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";
import { FaChevronRight, FaFolder } from "react-icons/fa";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  getProductionItems,
  moveProductionItems,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionBreadcrumbItem,
  ProductionItemKind,
  ProductionItemResponse,
} from "@/types/productionTypes";

interface Props {
  productionId: string;
  /** Ítems a mover (todos del mismo nivel). */
  items: ProductionItemResponse[];
  /** Carpeta donde están hoy; `undefined` = raíz. */
  currentParentId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onMoved: () => void;
}

/**
 * Elige la carpeta de destino navegando el árbol del blog y mueve ahí los
 * ítems seleccionados. Una carpeta no se puede mover dentro de sí misma.
 */
const MoveItemsModal = ({
  productionId,
  items,
  currentParentId,
  isOpen,
  onOpenChange,
  onMoved,
}: Props) => {
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [folders, setFolders] = useState<ProductionItemResponse[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<ProductionBreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const movingIds = new Set(items.map((item) => item._id));

  const loadLevel = useCallback(
    async (levelId?: string) => {
      setLoading(true);
      try {
        const res = await getProductionItems(productionId, levelId);
        if (isProductionActionError(res)) {
          toastifyError(res.error);
          return;
        }
        setFolders(
          res.items.filter((item) => item.kind === ProductionItemKind.folder)
        );
        setBreadcrumb(res.breadcrumb);
        setParentId(levelId);
      } finally {
        setLoading(false);
      }
    },
    [productionId]
  );

  // Cada vez que se abre arranca en la raíz del blog.
  useEffect(() => {
    if (isOpen) loadLevel(undefined);
  }, [isOpen, loadLevel]);

  const isSameFolder = (parentId ?? null) === (currentParentId ?? null);

  const handleMove = async () => {
    setBusy(true);
    try {
      const res = await moveProductionItems(
        productionId,
        items.map((item) => item._id),
        parentId
      );
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess(
        res === 1 ? "Elemento movido" : `${res} elementos movidos`
      );
      onOpenChange(false);
      onMoved();
    } finally {
      setBusy(false);
    }
  };

  const destinationName = breadcrumb.at(-1)?.name ?? "Inicio";

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <span>
                Mover{" "}
                {items.length === 1
                  ? `"${items[0].name}"`
                  : `${items.length} elementos`}
              </span>
              <span className="text-xs font-normal text-default-500">
                Elegí la carpeta de destino.
              </span>
            </ModalHeader>
            <ModalBody>
              <Breadcrumbs size="sm">
                <BreadcrumbItem
                  onPress={() => loadLevel(undefined)}
                  isCurrent={!parentId}
                >
                  Inicio
                </BreadcrumbItem>
                {breadcrumb.map((crumb, index) => (
                  <BreadcrumbItem
                    key={crumb._id}
                    onPress={() => loadLevel(crumb._id)}
                    isCurrent={index === breadcrumb.length - 1}
                  >
                    {crumb.name}
                  </BreadcrumbItem>
                ))}
              </Breadcrumbs>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : folders.length === 0 ? (
                <p className="py-6 text-center text-sm text-default-500">
                  No hay carpetas acá adentro.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-default-100 rounded-xl border border-default-200">
                  {folders.map((folder) => {
                    const isMoving = movingIds.has(folder._id);
                    return (
                      <li key={folder._id}>
                        <button
                          type="button"
                          disabled={isMoving}
                          onClick={() => loadLevel(folder._id)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-default-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <FaFolder className="shrink-0 text-warning" />
                          <span className="min-w-0 flex-1 truncate">
                            {folder.name}
                          </span>
                          {isMoving ? (
                            <span className="text-xs text-default-500">
                              Se está moviendo
                            </span>
                          ) : (
                            <FaChevronRight className="shrink-0 text-xs text-default-400" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} isDisabled={busy}>
                Cancelar
              </Button>
              <PrimaryButton
                onClick={handleMove}
                isDisabled={busy || loading || isSameFolder}
              >
                {busy
                  ? "Moviendo…"
                  : isSameFolder
                    ? "Ya están acá"
                    : `Mover a "${destinationName}"`}
              </PrimaryButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default MoveItemsModal;
