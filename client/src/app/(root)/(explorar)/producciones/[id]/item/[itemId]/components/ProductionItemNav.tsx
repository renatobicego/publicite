"use client";
import { Button, Link } from "@nextui-org/react";
import { FaArrowLeft, FaArrowRight, FaEye, FaPen } from "react-icons/fa";

interface Props {
  /** Carpeta (o raíz del blog) donde está el ítem. */
  backHref: string;
  backLabel: string;
  /** Ítems vecinos de la misma carpeta; vacío si no hay. */
  previousHref?: string;
  nextHref?: string;
  position?: { current: number; total: number };
  isStaff: boolean;
  previewMode: boolean;
  itemHref: string;
  previewHref: string;
}

/**
 * Navegación del detalle de un ítem: volver a su carpeta y pasar al archivo
 * anterior o siguiente sin salir al listado. El staff además alterna la vista
 * previa de visitante.
 */
const ProductionItemNav = ({
  backHref,
  backLabel,
  previousHref,
  nextHref,
  position,
  isStaff,
  previewMode,
  itemHref,
  previewHref,
}: Props) => (
  <nav className="flex w-full flex-col gap-3">
    {previewMode && (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <FaEye className="text-primary" />
          Estás viendo este contenido como un visitante
        </p>
        <Button
          as={Link}
          href={itemHref}
          size="sm"
          color="primary"
          radius="full"
          startContent={<FaPen />}
        >
          Volver a editar
        </Button>
      </div>
    )}
    <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-default-200 bg-content1 px-3 py-2">
      <Button
        as={Link}
        href={backHref}
        size="sm"
        variant="light"
        radius="full"
        startContent={<FaArrowLeft />}
        className="max-w-full"
      >
        <span className="truncate">Volver a {backLabel}</span>
      </Button>
      <div className="flex items-center gap-1">
        {isStaff && !previewMode && (
          <Button
            as={Link}
            href={previewHref}
            size="sm"
            variant="light"
            radius="full"
            startContent={<FaEye />}
          >
            Ver como visitante
          </Button>
        )}
        {position && position.total > 1 && (
          <>
            <Button
              as={Link}
              href={previousHref ?? "#"}
              isIconOnly
              size="sm"
              variant="light"
              radius="full"
              aria-label="Anterior"
              title="Anterior"
              isDisabled={!previousHref}
            >
              <FaArrowLeft />
            </Button>
            <span className="min-w-[4rem] text-center text-xs text-default-500">
              {position.current} de {position.total}
            </span>
            <Button
              as={Link}
              href={nextHref ?? "#"}
              isIconOnly
              size="sm"
              variant="light"
              radius="full"
              aria-label="Siguiente"
              title="Siguiente"
              isDisabled={!nextHref}
            >
              <FaArrowRight />
            </Button>
          </>
        )}
      </div>
    </div>
  </nav>
);

export default ProductionItemNav;
