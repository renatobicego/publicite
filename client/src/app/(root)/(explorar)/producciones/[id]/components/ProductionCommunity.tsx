"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Divider,
  Input,
  Textarea,
} from "@nextui-org/react";
import { FaStar, FaRegStar } from "react-icons/fa";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  getProductionReviews,
  createProductionReview,
  getProductionComments,
  createProductionComment,
  replyProductionComment,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionComment,
  ProductionReview,
} from "@/types/productionTypes";

interface Props {
  productionId: string;
  /** Staff puede responder comentarios. */
  isStaff: boolean;
  /**
   * El usuario puede reseñar el blog. El dueño/staff no puede reseñarse a sí
   * mismo, por eso el formulario de reseña se oculta cuando es `false`.
   */
  canReview: boolean;
}

const ownerName = (info: ProductionReview["authorInfo"]) =>
  info?.businessName ||
  [info?.name, info?.lastName].filter(Boolean).join(" ") ||
  info?.username ||
  info?.alias ||
  "Usuario";

const Stars = ({ value }: { value: number }) => (
  <span className="inline-flex text-warning">
    {[1, 2, 3, 4, 5].map((n) =>
      n <= value ? <FaStar key={n} /> : <FaRegStar key={n} />
    )}
  </span>
);

/** Reseñas y comentarios de un blog (REV-01). */
const ProductionCommunity = ({ productionId, isStaff, canReview }: Props) => {
  const [reviews, setReviews] = useState<ProductionReview[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [comments, setComments] = useState<ProductionComment[]>([]);

  const [newRating, setNewRating] = useState(5);
  const [newReview, setNewReview] = useState("");
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [rev, com] = await Promise.all([
      getProductionReviews(productionId),
      getProductionComments(productionId),
    ]);
    if (!isProductionActionError(rev)) {
      setReviews(rev.reviews);
      setAvgRating(rev.rating ?? null);
    }
    if (!isProductionActionError(com)) {
      setComments(com.comments);
    }
  }, [productionId]);

  useEffect(() => {
    load();
  }, [load]);

  const submitReview = async () => {
    if (!newReview.trim()) {
      toastifyError("Escribí tu reseña");
      return;
    }
    setBusy(true);
    try {
      const res = await createProductionReview({
        productionId,
        rating: newRating,
        review: newReview.trim(),
      });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Reseña publicada");
      setNewReview("");
      await load();
    } finally {
      setBusy(false);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    setBusy(true);
    try {
      const res = await createProductionComment({
        productionId,
        comment: newComment.trim(),
      });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      setNewComment("");
      await load();
    } finally {
      setBusy(false);
    }
  };

  const submitReply = async (commentId: string) => {
    const text = replyText[commentId]?.trim();
    if (!text) return;
    setBusy(true);
    try {
      const res = await replyProductionComment(commentId, text);
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="w-full max-w-3xl flex flex-col gap-6">
      {/* Reseñas */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Reseñas</h3>
          {avgRating != null && (
            <span className="text-sm text-default-500 flex items-center gap-1">
              <Stars value={Math.round(avgRating)} /> {avgRating.toFixed(1)}
            </span>
          )}
        </div>

        {canReview && (
          <Card shadow="sm">
            <CardBody className="gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNewRating(n)}
                    className="text-xl text-warning"
                    aria-label={`Calificar ${n}`}
                  >
                    {n <= newRating ? <FaStar /> : <FaRegStar />}
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Escribí tu reseña"
                value={newReview}
                onValueChange={setNewReview}
                maxLength={2000}
              />
              <PrimaryButton
                onClick={submitReview}
                disabled={busy}
                className="self-start"
              >
                Publicar reseña
              </PrimaryButton>
            </CardBody>
          </Card>
        )}

        {reviews.map((review) => (
          <Card key={review._id} shadow="sm">
            <CardBody className="gap-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {ownerName(review.authorInfo)}
                </span>
                <Stars value={review.rating} />
              </div>
              <p className="text-sm text-default-600">{review.review}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Divider />

      {/* Comentarios */}
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Comentarios</h3>
        <div className="flex gap-2 items-end">
          <Input
            placeholder="Escribí un comentario"
            value={newComment}
            onValueChange={setNewComment}
            maxLength={2000}
          />
          <PrimaryButton onClick={submitComment} disabled={busy}>
            Comentar
          </PrimaryButton>
        </div>

        {comments.map((comment) => (
          <Card key={comment._id} shadow="sm">
            <CardBody className="gap-2">
              <span className="font-medium text-sm">
                {ownerName(comment.userInfo)}
              </span>
              <p className="text-sm text-default-600">{comment.comment}</p>

              {comment.response && (
                <div className="ml-4 border-l-2 pl-3">
                  <span className="text-xs font-medium">
                    {ownerName(comment.response.userInfo)} (staff)
                  </span>
                  <p className="text-sm text-default-500">
                    {comment.response.comment}
                  </p>
                </div>
              )}

              {isStaff && !comment.response && (
                <div className="flex gap-2 items-end">
                  <Input
                    size="sm"
                    placeholder="Responder"
                    value={replyText[comment._id] ?? ""}
                    onValueChange={(v) =>
                      setReplyText((prev) => ({ ...prev, [comment._id]: v }))
                    }
                  />
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => submitReply(comment._id)}
                    isDisabled={busy}
                  >
                    Responder
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ProductionCommunity;
