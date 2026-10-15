"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
  Spinner,
  Button,
} from "@nextui-org/react";
import { getProductionConsumption } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { ProductionConsumption } from "@/types/productionTypes";
import { formatBytes } from "@/utils/functions/formatBytes";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const tokenSourceLabel: Record<string, string> = {
  plan: "Plan",
  free: "Gratuito",
  anonymous: "Anónimo",
};

/**
 * Control de Consumo del usuario (tokens de IA, almacenamiento y, si el límite
 * está activo, cupo de archivos por blog).
 * Es información general del usuario, por eso se muestra como modal del cartel
 * y no dentro de la solapa Producciones. Sólo carga en el propio cartel.
 */
const ConsumptionControlModal = ({ isOpen, onOpenChange }: Props) => {
  const [loading, setLoading] = useState(false);
  const [consumption, setConsumption] =
    useState<ProductionConsumption | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    (async () => {
      setLoading(true);
      const cons = await getProductionConsumption();
      if (active && !isProductionActionError(cons)) {
        setConsumption(cons);
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isOpen]);

  const filesLimitEnabled = !!consumption?.limits?.filesPerBlogLimitEnabled;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Control de Consumo</ModalHeader>
            <ModalBody className="gap-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : !consumption ? (
                <p className="text-sm text-default-500 py-4">
                  No se pudo cargar tu consumo.
                </p>
              ) : (
                <>
                  {consumption.tokens && (
                    <Card shadow="sm">
                      <CardBody className="gap-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            Tokens de IA (
                            {tokenSourceLabel[consumption.tokens.source] ??
                              consumption.tokens.source}
                            )
                          </span>
                          <span className="text-default-500">
                            {consumption.tokens.used} /{" "}
                            {consumption.tokens.allowance}
                          </span>
                        </div>
                        <Progress
                          aria-label="Tokens usados"
                          value={consumption.tokens.used}
                          maxValue={consumption.tokens.allowance || 1}
                          color="secondary"
                          size="sm"
                        />
                      </CardBody>
                    </Card>
                  )}
                  {consumption.limits?.storageLimitEnabled && (
                    <Card shadow="sm">
                      <CardBody className="gap-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            Almacenamiento
                          </span>
                          <span className="text-default-500">
                            {formatBytes(consumption.limits.storageUsedBytes)} /{" "}
                            {formatBytes(consumption.limits.storageBytesLimit)}
                          </span>
                        </div>
                        <Progress
                          aria-label="Almacenamiento usado"
                          value={consumption.limits.storageUsedBytes}
                          maxValue={consumption.limits.storageBytesLimit || 1}
                          color={
                            consumption.limits.storageAvailableBytes > 0
                              ? "primary"
                              : "danger"
                          }
                          size="sm"
                        />
                        <span className="text-xs text-default-400">
                          Te quedan{" "}
                          {formatBytes(
                            consumption.limits.storageAvailableBytes
                          )}{" "}
                          libres (total de todos tus blogs).
                        </span>
                      </CardBody>
                    </Card>
                  )}
                  {(!filesLimitEnabled || consumption.blogs.length === 0) &&
                    !consumption.tokens &&
                    !consumption.limits?.storageLimitEnabled && (
                      <p className="text-sm text-default-500 py-4">
                        Todavía no tenés consumo para mostrar.
                      </p>
                    )}
                  {/* El cupo por blog sólo se muestra con el límite activo. */}
                  {filesLimitEnabled &&
                    consumption.blogs.map((blog) => (
                      <Card key={blog.productionId} shadow="sm">
                        <CardBody className="gap-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium truncate">
                              {blog.title}
                            </span>
                            <span className="text-default-500">
                              {blog.filesCount} / {blog.filesPerBlogLimit}
                            </span>
                          </div>
                          <Progress
                            aria-label={`Archivos de ${blog.title}`}
                            value={blog.filesCount}
                            maxValue={blog.filesPerBlogLimit || 1}
                            color={
                              blog.filesAvailable > 0 ? "primary" : "danger"
                            }
                            size="sm"
                          />
                        </CardBody>
                      </Card>
                    ))}
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConsumptionControlModal;
