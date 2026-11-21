"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch,
  Textarea,
} from "@nextui-org/react";
import { updateFolder } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  ProductionCollectionType,
  ProductionItemResponse,
} from "@/types/productionTypes";
import { resolveProductionFileUrl } from "../../productionMedia";
import { COLLECTION_TYPES } from "../../productionCollections";

interface Props {
  folder: ProductionItemResponse;
  /** Fotos de la carpeta, para elegir el afiche o la tapa. */
  photos: ProductionItemResponse[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const DESCRIPTION_MAX = 3000;

/**
 * Configuración de una carpeta como colección (staff): tipo (álbum, película,
 * serie, disco o carpeta común), texto, afiche y Love It en los álbumes.
 */
const CollectionSettingsModal = ({
  folder,
  photos,
  isOpen,
  onOpenChange,
  onSaved,
}: Props) => {
  const [name, setName] = useState(folder.name);
  const [type, setType] = useState<ProductionCollectionType | null>(
    folder.collectionType ?? null
  );
  const [description, setDescription] = useState(folder.description ?? "");
  const [coverItemId, setCoverItemId] = useState<string | null>(
    folder.coverItem ?? null
  );
  const [loveIt, setLoveIt] = useState(!!folder.loveItEnabled);
  const [saving, setSaving] = useState(false);

  // Cada vez que se abre arranca con lo guardado.
  useEffect(() => {
    if (!isOpen) return;
    setName(folder.name);
    setType(folder.collectionType ?? null);
    setDescription(folder.description ?? "");
    setCoverItemId(folder.coverItem ?? null);
    setLoveIt(!!folder.loveItEnabled);
  }, [isOpen, folder]);

  const isAlbum = type === ProductionCollectionType.album;
  const coverLabel =
    type === ProductionCollectionType.music ? "Tapa" : "Afiche o portada";

  const save = async (close: () => void) => {
    if (!name.trim()) {
      toastifyError("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const res = await updateFolder(folder._id, {
        name: name.trim(),
        collectionType: type,
        description: type ? description.trim() : "",
        coverItemId: type ? coverItemId : null,
        loveItEnabled: isAlbum && loveIt,
      });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess(type ? "Colección guardada" : "Carpeta guardada");
      close();
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const options: {
    key: ProductionCollectionType | null;
    label: string;
    emoji: string;
    description: string;
  }[] = [
    ...COLLECTION_TYPES,
    {
      key: null,
      label: "Carpeta común",
      emoji: "📁",
      description: "Sin presentación especial: sólo la grilla.",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Configurar colección
              <span className="text-sm font-normal text-default-500">
                Una colección es una carpeta dedicada a algo: un álbum, una
                película, una serie de videos o un disco.
              </span>
            </ModalHeader>
            <ModalBody className="gap-5">
              <Input
                label="Nombre"
                value={name}
                onValueChange={setName}
                maxLength={120}
                isRequired
              />

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Tipo</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {options.map((option) => {
                    const selected = type === option.key;
                    return (
                      <button
                        key={option.key ?? "folder"}
                        type="button"
                        onClick={() => setType(option.key)}
                        className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                          selected
                            ? "border-primary bg-primary/10"
                            : "border-default-200 hover:border-default-400"
                        }`}
                      >
                        <span className="text-2xl">{option.emoji}</span>
                        <span className="flex flex-col">
                          <span className="text-sm font-semibold">
                            {option.label}
                          </span>
                          <span className="text-xs text-default-500">
                            {option.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {isAlbum && (
                <div className="flex items-start justify-between gap-4 rounded-xl border border-pink-200 bg-pink-50 p-3 dark:border-pink-900 dark:bg-pink-950/30">
                  <div>
                    <p className="text-sm font-semibold">💖 Love It</p>
                    <p className="text-xs text-default-600">
                      Quien entra al álbum pasa las fotos una por una y vota cada
                      una: Fan, Me gusta, Más o menos o No. Vos ves qué votó cada
                      persona en «Resultados Love It». Si el álbum pide ticket,
                      sólo votan quienes lo tienen.
                    </p>
                  </div>
                  <Switch
                    isSelected={loveIt}
                    onValueChange={setLoveIt}
                    aria-label="Activar Love It"
                  />
                </div>
              )}

              {type && (
                <Textarea
                  label={
                    type === ProductionCollectionType.movie
                      ? "Sinopsis"
                      : "Descripción"
                  }
                  placeholder={
                    type === ProductionCollectionType.movie
                      ? "De qué se trata, dirección, elenco, año…"
                      : "Contá de qué se trata"
                  }
                  value={description}
                  onValueChange={setDescription}
                  maxLength={DESCRIPTION_MAX}
                  description={`${description.length} / ${DESCRIPTION_MAX}`}
                  minRows={3}
                />
              )}

              {type && type !== ProductionCollectionType.album && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">{coverLabel}</p>
                  {photos.length === 0 ? (
                    <p className="text-xs text-default-500">
                      Subí una foto a esta carpeta para usarla como{" "}
                      {coverLabel.toLowerCase()}.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setCoverItemId(null)}
                        className={`flex h-20 w-20 items-center justify-center rounded-medium border-2 p-1 text-center text-[11px] ${
                          !coverItemId
                            ? "border-primary"
                            : "border-default-200"
                        }`}
                      >
                        La primera foto
                      </button>
                      {photos.map((photo) => (
                        <button
                          key={photo._id}
                          type="button"
                          title={photo.name}
                          onClick={() => setCoverItemId(photo._id)}
                          className={`h-20 w-20 overflow-hidden rounded-medium border-2 bg-default-100 ${
                            coverItemId === photo._id
                              ? "border-primary"
                              : "border-default-200"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveProductionFileUrl(photo.key)}
                            alt={photo.name}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button
                color="primary"
                isLoading={saving}
                onPress={() => save(onClose)}
              >
                Guardar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CollectionSettingsModal;
