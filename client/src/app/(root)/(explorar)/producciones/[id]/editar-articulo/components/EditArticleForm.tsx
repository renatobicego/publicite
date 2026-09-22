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
    <section className="w-full flex flex-col gap-6 md:gap-8">
      <Input
        isRequired
        label="Título"
        placeholder="Título del artículo"
        value={title}
        onValueChange={setTitle}
        maxLength={200}
      />
      <BlockEditor
        ref={editorRef}
        initialData={initialData.current}
        onChange={(data) => {
          latestContent.current = data;
        }}
      />
      <menu className="flex gap-4">
        <PrimaryButton onClick={handleSave} disabled={busy}>
          {busy ? "Guardando…" : "Guardar cambios"}
        </PrimaryButton>
        <SecondaryButton onClick={backToItem} disabled={busy}>
          Cancelar
        </SecondaryButton>
      </menu>
    </section>
  );
};

export default EditArticleForm;
