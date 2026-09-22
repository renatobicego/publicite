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
import { serializeBlocks } from "@/components/BlockEditor/blockEditorFormat";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { createArticle } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { PRODUCTIONS } from "@/utils/data/urls";

interface Props {
  productionId: string;
  parentId?: string;
}

/** ¿El contenido del editor tiene al menos un bloque con datos? */
const hasContent = (content: OutputData | undefined): boolean =>
  !!content &&
  content.blocks.some((block) => {
    const data = block.data as Record<string, unknown> | undefined;
    if (!data) return false;
    // Bloques de texto: el string `text` no debe estar vacío.
    if (typeof data.text === "string") return data.text.trim().length > 0;
    // Listas: al menos un ítem.
    if (Array.isArray((data as any).items))
      return (data as any).items.length > 0;
    // Imágenes u otros bloques con datos propios cuentan como contenido.
    return Object.keys(data).length > 0;
  });

/**
 * Formulario de alta de artículo en página propia. Reemplaza al modal:
 * el editor ya no vive dentro de un `Modal`, lo que evita que `save()`
 * devuelva vacío por remonte/desmonte del editor.
 */
const CreateArticleForm = ({ productionId, parentId }: Props) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const editorRef = useRef<BlockEditorHandle>(null);
  // Respaldo del contenido en vivo por si `save()` puntual falla.
  const latestContent = useRef<OutputData | undefined>(undefined);

  const backToBlog = () => {
    router.push(`${PRODUCTIONS}/${productionId}`);
    router.refresh();
  };

  const handleCreate = async () => {
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
      const res = await createArticle({
        productionId,
        parentId,
        title: title.trim(),
        blocks: serializeBlocks(content!),
      });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Artículo creado");
      backToBlog();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="w-full max-w-3xl flex flex-col gap-4">
      <Input
        isRequired
        label="Título"
        placeholder="Título del artículo"
        value={title}
        onValueChange={setTitle}
        maxLength={200}
      />
      <div className="border rounded-lg p-2 min-h-[40vh]">
        <BlockEditor
          ref={editorRef}
          onChange={(data) => {
            latestContent.current = data;
          }}
        />
      </div>
      <div className="flex gap-2">
        <PrimaryButton onClick={handleCreate} disabled={busy}>
          {busy ? "Creando…" : "Crear artículo"}
        </PrimaryButton>
        <SecondaryButton onClick={backToBlog} disabled={busy}>
          Cancelar
        </SecondaryButton>
      </div>
    </section>
  );
};

export default CreateArticleForm;
