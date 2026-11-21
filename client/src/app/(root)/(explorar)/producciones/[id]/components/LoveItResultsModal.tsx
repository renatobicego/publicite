"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { getProductionLoveItResults } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionLoveItResults,
  ProductionOwnerInfo,
  ProductionPhotoVote,
} from "@/types/productionTypes";
import { resolveProductionFileUrl } from "../../productionMedia";
import { LOVE_IT_VOTES, voteMeta } from "../../productionCollections";
import { AuthorLink } from "./ProductionCommunity";

interface Props {
  folderId: string;
  albumName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const COUNT_FIELD: Record<
  ProductionPhotoVote,
  "fanCount" | "likeCount" | "maybeCount" | "noCount"
> = {
  [ProductionPhotoVote.fan]: "fanCount",
  [ProductionPhotoVote.like]: "likeCount",
  [ProductionPhotoVote.maybe]: "maybeCount",
  [ProductionPhotoVote.no]: "noCount",
};

const Thumb = ({ photoKey, name }: { photoKey?: string | null; name: string }) => (
  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-medium bg-default-100">
    {photoKey ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolveProductionFileUrl(photoKey)}
        alt={name}
        loading="lazy"
        className="h-full w-full object-contain"
      />
    ) : (
      "📷"
    )}
  </span>
);

/**
 * Resultados de Love It de un álbum, para el staff del blog: cada foto con sus
 * votos y quién votó qué, y cada persona con lo que eligió.
 */
const LoveItResultsModal = ({
  folderId,
  albumName,
  isOpen,
  onOpenChange,
}: Props) => {
  const [results, setResults] = useState<ProductionLoveItResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    getProductionLoveItResults(folderId)
      .then((res) => {
        if (isProductionActionError(res)) setError(res.error);
        else setResults(res);
      })
      .finally(() => setLoading(false));
  }, [isOpen, folderId]);

  // Fotos de más Fan a menos (desempata Me gusta).
  const photos = useMemo(
    () =>
      [...(results?.photos ?? [])].sort(
        (a, b) => b.fanCount - a.fanCount || b.likeCount - a.likeCount
      ),
    [results]
  );

  // Lo mismo, visto por persona.
  const people = useMemo(() => {
    const byUser = new Map<
      string,
      {
        user: string;
        info?: ProductionOwnerInfo | null;
        votes: { photo: (typeof photos)[number]; vote: ProductionPhotoVote }[];
      }
    >();
    for (const photo of photos) {
      for (const entry of photo.votes) {
        const person = byUser.get(entry.user) ?? {
          user: entry.user,
          info: entry.userInfo,
          votes: [],
        };
        person.votes.push({ photo, vote: entry.vote });
        byUser.set(entry.user, person);
      }
    }
    return [...byUser.values()].sort((a, b) => b.votes.length - a.votes.length);
  }, [photos]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <span>Resultados Love It</span>
              <span className="text-sm font-normal text-default-500">
                {albumName}
                {results &&
                  ` · ${results.votersCount} ${
                    results.votersCount === 1 ? "persona votó" : "personas votaron"
                  } · ${results.votesCount} votos`}
              </span>
            </ModalHeader>
            <ModalBody>
              {loading ? (
                <div className="flex justify-center py-10">
                  <Spinner />
                </div>
              ) : error ? (
                <p className="py-6 text-center text-sm text-danger">{error}</p>
              ) : !results || results.votesCount === 0 ? (
                <p className="py-10 text-center text-sm text-default-500">
                  Todavía nadie votó las fotos de este álbum.
                </p>
              ) : (
                <Tabs aria-label="Ver resultados" variant="underlined">
                  <Tab key="photos" title="Por foto">
                    <ul className="flex flex-col gap-2">
                      {photos.map((photo) => (
                        <li
                          key={photo.item}
                          className="rounded-xl border border-default-200 p-2"
                        >
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 text-left"
                            onClick={() =>
                              setOpenPhoto((current) =>
                                current === photo.item ? null : photo.item
                              )
                            }
                          >
                            <Thumb photoKey={photo.key} name={photo.name} />
                            <span className="flex min-w-0 flex-1 flex-col gap-1">
                              <span className="truncate text-sm font-medium">
                                {photo.name}
                              </span>
                              <span className="flex flex-wrap gap-1">
                                {LOVE_IT_VOTES.map((option) => (
                                  <Chip
                                    key={option.vote}
                                    size="sm"
                                    variant="flat"
                                    className={
                                      photo[COUNT_FIELD[option.vote]] === 0
                                        ? "opacity-40"
                                        : ""
                                    }
                                  >
                                    {option.emoji} {option.label}{" "}
                                    {photo[COUNT_FIELD[option.vote]]}
                                  </Chip>
                                ))}
                              </span>
                            </span>
                          </button>
                          {openPhoto === photo.item && (
                            <ul className="mt-2 flex flex-col gap-2 border-t border-default-100 pt-2">
                              {photo.votes.length === 0 ? (
                                <li className="text-xs text-default-500">
                                  Sin votos.
                                </li>
                              ) : (
                                photo.votes.map((entry) => (
                                  <li
                                    key={entry.user}
                                    className="flex items-center justify-between gap-2"
                                  >
                                    <AuthorLink info={entry.userInfo} small />
                                    <span className="shrink-0 text-sm">
                                      {voteMeta(entry.vote)?.emoji}{" "}
                                      {voteMeta(entry.vote)?.label}
                                    </span>
                                  </li>
                                ))
                              )}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </Tab>
                  <Tab key="people" title="Por persona">
                    <ul className="flex flex-col gap-3">
                      {people.map((person) => (
                        <li
                          key={person.user}
                          className="flex flex-col gap-2 rounded-xl border border-default-200 p-3"
                        >
                          <AuthorLink info={person.info} />
                          {LOVE_IT_VOTES.map((option) => {
                            const chosen = person.votes.filter(
                              (entry) => entry.vote === option.vote
                            );
                            if (chosen.length === 0) return null;
                            return (
                              <div key={option.vote} className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-default-600">
                                  {option.emoji} {option.label} ({chosen.length})
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {chosen.map(({ photo }) => (
                                    <span key={photo.item} title={photo.name}>
                                      <Thumb photoKey={photo.key} name={photo.name} />
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </li>
                      ))}
                    </ul>
                  </Tab>
                </Tabs>
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

export default LoveItResultsModal;
