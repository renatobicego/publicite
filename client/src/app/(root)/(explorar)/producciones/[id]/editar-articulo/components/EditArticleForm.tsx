"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { OutputData } from "@editorjs/editorjs";
import { Input } from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import BlockEditor, {
  BlockEditorHandle,
} from "@/components/BlockEditor/BlockEditor";
import {
  deserializeBlocks,
  serializeBlocks,
} from "@/components/BlockEditor/blockEditorFormat";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { updateArticle } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { ProductionItemResponse } from "@/types/productionTypes";
import { PRODUCTIONS } from "@/utils/data/urls";

interface Props {
  item: ProductionItemResponse;
}

/** ¿El contenido del editor tiene al menos un bloque con datos? */
const hasContent = (content: OutputData | undefined): boolean =>
  !!content &&
  content.blocks.some((block) => {
    const data = block.data as Record<string, unknown> | undefined;
    if (!data) return false;
    if (typeof data.text === "string") return data.text.trim().length > 0;
    if (Array.isArray((data as any).items))
      return (data as any).items.length > 0;
    return Object.keys(data).length > 0;
  });

/**
 * Edición de un artículo existente. Reutiliza el `BlockEditor` sembrando el
 * contenido actual (`deserializeBlocks`) y persiste con `updateArticle`.
 */
const EditArticleForm = ({ item }: Props) => {
  const router = useRouter();
  const [title, setTitle] = useState(item.name);
  const [busy, setBusy] = useState(false);
  const editorRef = useRef<BlockEditorHandle>(null);
  // Contenido inicial del editor a partir de los bloques guardados.
  const initialData = useRef<OutputData>(deserializeBlocks(item.blocks));
  // Respaldo del contenido en vivo por si `save()` puntual falla.
  const latestContent = useRef<OutputData | undefined>(initialData.current);

  const backToItem = () => {
    router.push(`${PRODUCTIONS}/${item.production}/item/${item._id}`);
    router.refresh();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toastifyError("El título del artículo es obligatorio");
      return;
    }
    const content = (await editorRef.current?.save()) ?? latestContent.current;
    console.log(content)
    if (!hasContent(content)) {
      toastifyError("El artículo necesita contenido");
      return;
    }
    setBusy(true);
    try {
      const res = await updateArticle(item._id, {
        title: title.trim(),
        blocks: serializeBlocks(content!),
      });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Artículo actualizado");
      backToItem();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="w-full flex flex-col gap-5">
      {/* Título del artículo */}
      <div className="rounded-2xl border border-default-200 bg-content1 p-4 shadow-sm sm:p-6">
        <Input
          isRequired
          label="Título del artículo"
          labelPlacement="outside"
          placeholder="Escribí un título…"
          value={title}
          onValueChange={setTitle}
          maxLength={200}
          variant="bordered"
          classNames={{
            label: "text-sm font-medium text-default-700",
            input: "text-lg font-medium",
          }}
        />
      </div>

      {/* Editor de contenido */}
      <div className="rounded-2xl border border-default-200 bg-content1 shadow-sm">
        <div className="border-b border-default-100 px-4 py-3 sm:px-6">
          <h2 className="text-sm font-medium text-default-700">Contenido</h2>
          <p className="text-xs text-default-400">
            Escribí, agregá encabezados, listas, imágenes y enlaces.
          </p>
        </div>
        <div className="px-4 py-4 sm:px-6 sm:py-6">
          <BlockEditor
            ref={editorRef}
            initialData={initialData.current}
            onChange={(data) => {
              latestContent.current = data;
            }}
          />
        </div>
      </div>

      {/* Acciones */}
      <menu className="sticky bottom-4 flex flex-wrap justify-end gap-3 rounded-2xl border border-default-200 bg-content1 p-3 shadow-md">
        <SecondaryButton variant="light" onClick={backToItem} disabled={busy}>
          Cancelar
        </SecondaryButton>
        <PrimaryButton onClick={handleSave} disabled={busy}>
          {busy ? "Guardando…" : "Guardar cambios"}
        </PrimaryButton>
      </menu>
    </section>
  );
};

export default EditArticleForm;
