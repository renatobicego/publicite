"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Divider,
  Input,
  Link,
} from "@nextui-org/react";
import { useUser } from "@clerk/nextjs";
import { FaTrash } from "react-icons/fa";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  getProductionReviews,
  getProductionComments,
  createProductionComment,
  replyProductionComment,
  deleteProductionComment,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionComment,
  ProductionOwnerInfo,
  ProductionReview,
} from "@/types/productionTypes";
import { PROFILE } from "@/utils/data/urls";
import {
  PickRatingStars,
  PRODUCTION_REVIEWS_ANCHOR,
  RatingStars,
} from "./ProductionRating";

interface Props {
  productionId: string;
  /** Staff puede responder y moderar (borrar) comentarios. */
  isStaff: boolean;
  /**
   * Vista previa de visitante: la acción se muestra pero no se ejecuta; en su
   * lugar se llama a esto (avisa que hay que volver a editar).
   */
  onBlocked?: () => void;
  /**
   * Abre el modal de reseña con el puntaje elegido. Sin esto (staff) no se
   * muestran las estrellas para calificar.
   */
  onReview?: (stars: number) => void;
}

const displayName = (info?: ProductionOwnerInfo | null) =>
  info?.businessName ||
  [info?.name, info?.lastName].filter(Boolean).join(" ") ||
  info?.username ||
  info?.alias ||
  "Usuario";

/**
 * Autor de una reseña o comentario: foto, nombre y @usuario. Todo el bloque
 * lleva al cartel del usuario.
 */
const AuthorLink = ({
  info,
  suffix,
  small,
}: {
  info?: ProductionOwnerInfo | null;
  suffix?: string;
  small?: boolean;
}) => {
  const content = (
    <>
      <Avatar
        src={info?.profilePhotoUrl || undefined}
        name={displayName(info)}
        showFallback
        className={`shrink-0 ${small ? "h-6 w-6 text-tiny" : "h-9 w-9"}`}
      />
      <span className="flex min-w-0 flex-col leading-tight">
        <span
          className={`truncate font-medium text-text-color ${
            small ? "text-xs" : "text-sm"
          }`}
        >
          {displayName(info)}
          {suffix && (
            <span className="font-normal text-default-500"> {suffix}</span>
          )}
        </span>
        {info?.username && (
          <span className="truncate text-xs text-default-500">
            @{info.username}
          </span>
        )}
      </span>
    </>
  );
  if (!info?._id) {
    return <div className="flex min-w-0 items-center gap-2">{content}</div>;
  }
  return (
    <Link
      href={`${PROFILE}/${info._id}`}
      className="flex min-w-0 items-center gap-2 hover:opacity-80"
    >
      {content}
    </Link>
  );
};

/** Reseñas y comentarios de un blog (REV-01). */
const ProductionCommunity = ({
  productionId,
  isStaff,
  onBlocked,
  onReview,
}: Props) => {
  const { user } = useUser();
  const myId = user?.publicMetadata?.mongoId as string | undefined;

  const [reviews, setReviews] = useState<ProductionReview[]>([]);
  const [comments, setComments] = useState<ProductionComment[]>([]);

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
    }
    if (!isProductionActionError(com)) {
      setComments(com.comments);
    }
  }, [productionId]);

  useEffect(() => {
    load();
  }, [load]);

  const submitComment = async () => {
    if (onBlocked) return onBlocked();
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

  const removeComment = async (commentId: string, isReply = false) => {
    if (onBlocked) return onBlocked();
    if (
      !confirm(
        isReply
          ? "¿Eliminar la respuesta?"
          : "¿Eliminar el comentario? También se borra su respuesta."
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await deleteProductionComment(commentId);
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess(isReply ? "Respuesta eliminada" : "Comentario eliminado");
      await load();
    } finally {
      setBusy(false);
    }
  };

  // Borra su autor; el staff del blog también puede (moderación).
  const canDelete = (comment: ProductionComment) =>
    isStaff || (!!myId && comment.user === myId);

  const DeleteButton = ({
    comment,
    isReply,
  }: {
    comment: ProductionComment;
    isReply?: boolean;
  }) => (
    <Button
      isIconOnly
      size="sm"
      variant="light"
      color="danger"
      aria-label={isReply ? "Eliminar respuesta" : "Eliminar comentario"}
      title="Eliminar"
      isDisabled={busy}
      onPress={() => removeComment(comment._id, isReply)}
    >
      <FaTrash />
    </Button>
  );

  return (
    <section className="w-full max-w-3xl flex flex-col gap-6">
      {/* Reseñas: las estrellas abren el mismo modal que el encabezado */}
      <div
        id={PRODUCTION_REVIEWS_ANCHOR}
        className="flex scroll-mt-24 flex-col gap-3"
      >
        <h3 className="text-lg font-semibold">Reseñas</h3>
        {onReview && (
          <Card shadow="sm">
            <CardBody className="items-center gap-1 py-4">
              <span className="text-sm text-default-600">
                ¿Qué te pareció este blog?
              </span>
              <PickRatingStars onPick={onReview} />
            </CardBody>
          </Card>
        )}
        {reviews.length === 0 && (
          <p className="text-sm text-default-500">
            Este blog todavía no tiene reseñas.
          </p>
        )}
        {reviews.map((review) => (
          <Card key={review._id} shadow="sm">
            <CardBody className="gap-2">
              <div className="flex items-center justify-between gap-3">
                <AuthorLink info={review.authorInfo} />
                <RatingStars
                  value={review.rating}
                  className="shrink-0 text-lg"
                />
              </div>
              <p className="whitespace-pre-line text-sm text-default-600">
                {review.review}
              </p>
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
            onKeyDown={(event) => {
              if (event.key === "Enter") submitComment();
            }}
          />
          <PrimaryButton onClick={submitComment} isDisabled={busy}>
            Comentar
          </PrimaryButton>
        </div>

        {comments.map((comment) => (
          <Card key={comment._id} shadow="sm">
            <CardBody className="gap-2">
              <div className="flex items-start justify-between gap-2">
                <AuthorLink info={comment.userInfo} />
                {canDelete(comment) && <DeleteButton comment={comment} />}
              </div>
              <p className="whitespace-pre-line text-sm text-default-600">
                {comment.comment}
              </p>

              {comment.response && (
                <div className="ml-4 flex flex-col gap-1 border-l-2 pl-3">
                  <div className="flex items-start justify-between gap-2">
                    <AuthorLink
                      info={comment.response.userInfo}
                      suffix="(staff)"
                      small
                    />
                    {canDelete(comment.response) && (
                      <DeleteButton comment={comment.response} isReply />
                    )}
                  </div>
                  <p className="whitespace-pre-line text-sm text-default-500">
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
