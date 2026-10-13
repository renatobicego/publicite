"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Switch,
  useDisclosure,
} from "@nextui-org/react";
import {
  getProductionMap,
  getProductionTickets,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionFileType,
  ProductionItemKind,
  ProductionMapNode,
  ProductionTicket,
} from "@/types/productionTypes";
import TicketManagerModal from "./TicketManagerModal";

interface Props {
  productionId: string;
  productionTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se cambió algún ticket: el blog tiene que recargar. */
  onChanged: () => void;
  aliasCbu?: string | null;
  canManagePayout?: boolean;
  commissionPercent?: number | null;
}

/** Cómo se accede a un elemento del blog. */
type AccessState = "free" | "freeTicket" | "paid";

const BLOG_KEY = "__blog__";

const stateStyle: Record<
  AccessState,
  { label: string; box: string; badge: string; dot: string }
> = {
  free: {
    label: "Gratis",
    box: "border-success-300 bg-success-50",
    badge: "bg-success-100 text-success-800",
    dot: "bg-success-500",
  },
  freeTicket: {
    label: "Ticket gratuito",
    box: "border-primary-300 bg-primary-50",
    badge: "bg-primary-100 text-primary-800",
    dot: "bg-primary-500",
  },
  paid: {
    label: "Ticket pago",
    box: "border-warning-400 bg-warning-50",
    badge: "bg-warning-100 text-warning-800",
    dot: "bg-warning-500",
  },
};

const fileEmoji: Record<ProductionFileType, string> = {
  [ProductionFileType.photo]: "🖼️",
  [ProductionFileType.video]: "🎬",
  [ProductionFileType.audio]: "🎵",
  [ProductionFileType.writing]: "📄",
  [ProductionFileType.document]: "📎",
};

const nodeEmoji = (node: ProductionMapNode) =>
  node.kind === ProductionItemKind.folder
    ? "📁"
    : node.kind === ProductionItemKind.article
      ? "📝"
      : ((node.fileType && fileEmoji[node.fileType]) ?? "📄");

const stateOf = (ticket: ProductionTicket | null): AccessState =>
  !ticket ? "free" : ticket.isPaid ? "paid" : "freeTicket";

const priceOf = (ticket: ProductionTicket) =>
  `${ticket.currency} ${ticket.price.toLocaleString("es-AR")}`;

/** Ticket que aplica a un nodo: el propio o el heredado más cercano. */
interface Resolved {
  ticket: ProductionTicket | null;
  /** El ticket es de este mismo elemento (no heredado). */
  own: boolean;
  /** De dónde viene, si es heredado. */
  from?: string;
}

const TicketBadge = ({ info }: { info: Resolved }) => {
  const style = stateStyle[stateOf(info.ticket)];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badge}`}
    >
      {info.ticket?.isPaid ? priceOf(info.ticket) : style.label}
      {info.ticket && !info.own && <span aria-hidden>↳</span>}
    </span>
  );
};

const describe = (name: string, info: Resolved) => {
  const state = stateStyle[stateOf(info.ticket)].label;
  const origin = !info.ticket
    ? ""
    : info.own
      ? " (ticket propio)"
      : ` (heredado de ${info.from})`;
  return `${name}: ${state}${origin}. Tocá para configurar su ticket.`;
};

/**
 * Mapa del blog (staff): todo el árbol dibujado como recuadros anidados
 * —carpetas que contienen carpetas y archivos— pintados según cómo se accede
 * a cada cosa: gratis, con ticket gratuito o con ticket pago. Un ticket se
 * hereda hacia adentro; el borde punteado marca lo heredado. Tocar un recuadro
 * abre su ticket.
 */
const ProductionMapModal = ({
  productionId,
  productionTitle,
  isOpen,
  onOpenChange,
  onChanged,
  aliasCbu,
  canManagePayout,
  commissionPercent,
}: Props) => {
  const [nodes, setNodes] = useState<ProductionMapNode[] | null>(null);
  const [tickets, setTickets] = useState<ProductionTicket[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Qué estados se muestran resaltados; el resto queda atenuado.
  const [shown, setShown] = useState<Record<AccessState, boolean>>({
    free: true,
    freeTicket: true,
    paid: true,
  });
  const [showFiles, setShowFiles] = useState(true);

  // Destino del TicketManagerModal: un nodo o el blog entero (BLOG_KEY).
  const ticketModal = useDisclosure();
  const [target, setTarget] = useState<ProductionMapNode | typeof BLOG_KEY>(
    BLOG_KEY
  );

  const load = useCallback(async () => {
    const [map, list] = await Promise.all([
      getProductionMap(productionId),
      getProductionTickets(productionId),
    ]);
    if (isProductionActionError(map)) {
      setError(map.error);
      return;
    }
    if (isProductionActionError(list)) {
      setError(list.error);
      return;
    }
    setError(null);
    setNodes(map);
    setTickets(list);
  }, [productionId]);

  useEffect(() => {
    if (!isOpen) return;
    setNodes(null);
    load();
  }, [isOpen, load]);

  const { children, resolved, blogTicket, totals } = useMemo(() => {
    const children = new Map<string, ProductionMapNode[]>();
    (nodes ?? []).forEach((node) => {
      const key = node.parent ?? BLOG_KEY;
      children.set(key, [...(children.get(key) ?? []), node]);
    });
    const ticketByTarget = new Map(
      tickets.map((ticket) => [ticket.target ?? BLOG_KEY, ticket])
    );
    const blogTicket = ticketByTarget.get(BLOG_KEY) ?? null;

    const resolved = new Map<string, Resolved>();
    const totals: Record<AccessState, number> = {
      free: 0,
      freeTicket: 0,
      paid: 0,
    };
    const walk = (parentKey: string, inherited: Resolved) => {
      (children.get(parentKey) ?? []).forEach((node) => {
        const own = ticketByTarget.get(node._id);
        const current: Resolved = own
          ? { ticket: own, own: true }
          : { ...inherited, own: false };
        resolved.set(node._id, current);
        if (node.kind !== ProductionItemKind.folder) {
          totals[stateOf(current.ticket)]++;
        }
        walk(
          node._id,
          own ? { ticket: own, own: false, from: node.name } : inherited
        );
      });
    };
    walk(BLOG_KEY, { ticket: blogTicket, own: false, from: "todo el blog" });
    return { children, resolved, blogTicket, totals };
  }, [nodes, tickets]);

  const openTicket = (next: ProductionMapNode | typeof BLOG_KEY) => {
    setTarget(next);
    ticketModal.onOpen();
  };

  const renderNode = (node: ProductionMapNode): React.ReactNode => {
    const info = resolved.get(node._id) ?? { ticket: null, own: false };
    const state = stateOf(info.ticket);
    const style = stateStyle[state];
    const dimmed = !shown[state];
    const border = info.ticket && !info.own ? "border-dashed" : "border-solid";

    if (node.kind !== ProductionItemKind.folder) {
      if (!showFiles) return null;
      return (
        <button
          key={node._id}
          type="button"
          onClick={() => openTicket(node)}
          title={describe(node.name, info)}
          className={`flex w-28 flex-col items-center gap-1 rounded-lg border-2 px-2 py-2 text-center transition hover:shadow-md sm:w-32 ${style.box} ${border} ${
            dimmed ? "opacity-25" : ""
          }`}
        >
          <span className="text-2xl leading-none" aria-hidden>
            {nodeEmoji(node)}
          </span>
          <span className="line-clamp-2 w-full break-words text-xs font-medium">
            {node.name}
          </span>
          <TicketBadge info={info} />
        </button>
      );
    }

    const inside = children.get(node._id) ?? [];
    const files = inside.filter((n) => n.kind !== ProductionItemKind.folder);
    return (
      <div
        key={node._id}
        className={`flex w-full flex-col gap-2 rounded-xl border-2 p-2 sm:p-3 ${style.box} ${border} ${
          dimmed ? "opacity-40" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => openTicket(node)}
          title={describe(node.name, info)}
          className="flex w-full flex-wrap items-center gap-2 rounded-lg px-1 py-0.5 text-left hover:bg-content1/60"
        >
          <span className="text-xl leading-none" aria-hidden>
            📁
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">
            {node.name}
          </span>
          <span className="text-xs text-default-500">
            {files.length === 1 ? "1 archivo" : `${files.length} archivos`}
          </span>
          <TicketBadge info={info} />
        </button>
        {inside.length > 0 && (
          <div className="flex flex-wrap gap-2">{inside.map(renderNode)}</div>
        )}
      </div>
    );
  };

  const blogInfo: Resolved = { ticket: blogTicket, own: true };
  const blogStyle = stateStyle[stateOf(blogTicket)];
  const rootNodes = children.get(BLOG_KEY) ?? [];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span>Mapa de tickets del blog</span>
                <span className="text-xs font-normal text-default-500">
                  Qué es gratis y qué va con ticket. Un ticket se hereda hacia
                  adentro de la carpeta (borde punteado y ↳). Tocá un recuadro
                  para configurar su ticket.
                </span>
              </ModalHeader>
              <ModalBody className="gap-4">
                {/* Leyenda: cada color es también un filtro */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-default-200 bg-default-50 px-3 py-2.5">
                  {(Object.keys(stateStyle) as AccessState[]).map((state) => (
                    <Switch
                      key={state}
                      size="sm"
                      isSelected={shown[state]}
                      onValueChange={(value) =>
                        setShown((current) => ({ ...current, [state]: value }))
                      }
                    >
                      <span className="flex items-center gap-1.5 text-sm">
                        <span
                          className={`h-3 w-3 rounded-full ${stateStyle[state].dot}`}
                          aria-hidden
                        />
                        {stateStyle[state].label}
                        <span className="text-xs text-default-500">
                          ({totals[state]})
                        </span>
                      </span>
                    </Switch>
                  ))}
                  <Switch
                    size="sm"
                    isSelected={showFiles}
                    onValueChange={setShowFiles}
                    className="sm:ml-auto"
                  >
                    <span className="text-sm">Mostrar archivos</span>
                  </Switch>
                </div>

                {error ? (
                  <p className="py-8 text-center text-sm text-danger">
                    {error}
                  </p>
                ) : !nodes ? (
                  <div className="flex justify-center py-12">
                    <Spinner />
                  </div>
                ) : (
                  <div
                    className={`flex flex-col gap-3 rounded-2xl border-2 p-3 sm:p-4 ${blogStyle.box}`}
                  >
                    <button
                      type="button"
                      onClick={() => openTicket(BLOG_KEY)}
                      title={describe(productionTitle, blogInfo)}
                      className="flex w-full flex-wrap items-center gap-2 rounded-lg px-1 py-0.5 text-left hover:bg-content1/60"
                    >
                      <span className="text-2xl leading-none" aria-hidden>
                        🏠
                      </span>
                      <span className="min-w-0 flex-1 truncate font-semibold">
                        {productionTitle}
                      </span>
                      <span className="text-xs text-default-500">
                        Todo el blog
                      </span>
                      <TicketBadge info={blogInfo} />
                    </button>
                    {rootNodes.length === 0 ? (
                      <p className="py-6 text-center text-sm text-default-500">
                        El blog todavía no tiene contenido.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {rootNodes.map(renderNode)}
                      </div>
                    )}
                  </div>
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

      <TicketManagerModal
        productionId={productionId}
        targetId={target === BLOG_KEY ? undefined : target._id}
        targetName={target === BLOG_KEY ? productionTitle : target.name}
        isOpen={ticketModal.isOpen}
        onOpenChange={ticketModal.onOpenChange}
        onChanged={() => {
          load();
          onChanged();
        }}
        aliasCbu={aliasCbu}
        canManagePayout={canManagePayout}
        commissionPercent={commissionPercent}
        hasContent={
          target !== BLOG_KEY && target.kind !== ProductionItemKind.folder
            ? true
            : undefined
        }
      />
    </>
  );
};

export default ProductionMapModal;
