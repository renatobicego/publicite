"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { useUser } from "@clerk/nextjs";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  createProductionReview,
  getProductionReviews,
  updateProductionReview,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { ProductionReview } from "@/types/productionTypes";

/** Ancla de la lista de reseñas (en `ProductionCommunity`). */
export const PRODUCTION_REVIEWS_ANCHOR = "resenas";

const ratingLabels = ["", "Malo", "Regular", "Bueno", "Muy bueno", "Excelente"];

/** Estrellas de sólo lectura; acepta medios puntos (promedio). */
export const RatingStars = ({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) => (
  <span
    className={`inline-flex gap-0.5 text-warning ${className}`}
    aria-label={`${value.toFixed(1)} de 5`}
  >
    {[1, 2, 3, 4, 5].map((n) =>
      value >= n - 0.25 ? (
        <FaStar key={n} />
      ) : value >= n - 0.75 ? (
        <FaStarHalfAlt key={n} />
      ) : (
        <FaRegStar key={n} />
      )
    )}
  </span>
);

interface Props {
  productionId: string;
  rating?: number | null;
  reviewsCount?: number | null;
  /** El staff no reseña su propio blog: sólo ve el puntaje. */
  canReview: boolean;
  /** Se llama al publicar o editar una reseña. */
  onReviewed: () => void;
}

/**
 * Puntaje del blog en el encabezado, con el botón para reseñar. La lista de
 * reseñas sigue abajo (`ProductionCommunity`); acá va lo que tiene que verse
 * apenas se entra al blog.
 */
const ProductionRating = ({
  productionId,
  rating,
  reviewsCount,
  canReview,
  onReviewed,
}: Props) => {
  const { user } = useUser();
  const myId = user?.publicMetadata?.mongoId as string | undefined;
  const modal = useDisclosure();

  const [mine, setMine] = useState<ProductionReview | null>(null);
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  // Si el usuario ya reseñó, el modal edita su reseña en vez de crear otra.
  useEffect(() => {
    if (!modal.isOpen || !myId) return;
    let cancelled = false;
    getProductionReviews(productionId, 1, 50).then((res) => {
      if (cancelled || isProductionActionError(res)) return;
      const existing = res.reviews.find((review) => review.author === myId);
      if (!existing) return;
      setMine(existing);
      setStars(existing.rating);
      setText(existing.review);
    });
    return () => {
      cancelled = true;
    };
  }, [modal.isOpen, myId, productionId]);

  const submit = async () => {
    if (stars < 1) {
      toastifyError("Elegí un puntaje");
      return;
    }
    if (!text.trim()) {
      toastifyError("Escribí tu reseña");
      return;
    }
    setBusy(true);
    try {
      const res = mine
        ? await updateProductionReview(mine._id, {
            rating: stars,
            review: text.trim(),
          })
        : await createProductionReview({
            productionId,
            rating: stars,
            review: text.trim(),
          });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess(mine ? "Reseña actualizada" : "Reseña publicada");
      setMine(res);
      modal.onClose();
      onReviewed();
    } finally {
      setBusy(false);
    }
  };

  const count = reviewsCount ?? 0;
  const shown = hovered || stars;

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-default-200 bg-default-50 px-4 py-3">
        <a
          href={`#${PRODUCTION_REVIEWS_ANCHOR}`}
          className="flex items-center gap-3 hover:opacity-80"
          title="Ver reseñas"
        >
          <span className="text-3xl font-bold leading-none">
            {rating != null && count > 0 ? rating.toFixed(1) : "–"}
          </span>
          <span className="flex flex-col gap-1">
            <RatingStars
              value={count > 0 ? (rating ?? 0) : 0}
              className="text-xl"
            />
            <span className="text-xs text-default-500">
              {count === 0
                ? "Todavía sin reseñas"
                : count === 1
                  ? "1 reseña"
                  : `${count} reseñas`}
            </span>
          </span>
        </a>
        {canReview && (
          <PrimaryButton
            startContent={<FaStar />}
            onClick={modal.onOpen}
            className="ml-auto"
          >
            Reseñar este blog
          </PrimaryButton>
        )}
      </div>

      <Modal isOpen={modal.isOpen} onOpenChange={modal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {mine ? "Editar tu reseña" : "Reseñar este blog"}
              </ModalHeader>
              <ModalBody className="gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex gap-1"
                    onMouseLeave={() => setHovered(0)}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setStars(n)}
                        onMouseEnter={() => setHovered(n)}
                        className="p-1 text-4xl text-warning transition-transform hover:scale-110 sm:text-5xl"
                        aria-label={`Calificar ${n} de 5`}
                        aria-pressed={stars === n}
                      >
                        {n <= shown ? <FaStar /> : <FaRegStar />}
                      </button>
                    ))}
                  </div>
                  <span className="h-5 text-sm font-medium text-default-600">
                    {shown ? ratingLabels[shown] : "Elegí un puntaje"}
                  </span>
                </div>
                <Textarea
                  label="Tu reseña"
                  placeholder="Contá qué te pareció el blog"
                  value={text}
                  onValueChange={setText}
                  maxLength={2000}
                  minRows={4}
                />
                <p className="text-xs text-default-500">
                  Pueden reseñar quienes accedieron al blog con un ticket.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} isDisabled={busy}>
                  Cancelar
                </Button>
                <PrimaryButton onClick={submit} isDisabled={busy}>
                  {busy
                    ? "Guardando…"
                    : mine
                      ? "Guardar cambios"
                      : "Publicar reseña"}
                </PrimaryButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductionRating;
