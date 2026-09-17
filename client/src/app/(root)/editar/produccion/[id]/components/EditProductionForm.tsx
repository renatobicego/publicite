"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { updateProduction } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { PRODUCTIONS } from "@/utils/data/urls";
import { ProductionResponse } from "@/types/productionTypes";

/** Edición del header del blog (título, descripción, bienvenida). */
const EditProductionForm = ({
  production,
}: {
  production: ProductionResponse;
}) => {
  const router = useRouter();
  const [title, setTitle] = useState(production.title);
  const [description, setDescription] = useState(production.description ?? "");
  const [welcomeText, setWelcomeText] = useState(production.welcomeText ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toastifyError("El título del blog es obligatorio");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await updateProduction(production._id, {
        title: title.trim(),
        description: description.trim(),
        welcomeText: welcomeText.trim(),
      });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Blog actualizado");
      router.push(`${PRODUCTIONS}/${production._id}`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full flex flex-col gap-4 max-w-2xl">
      <Input
        isRequired
        label="Título del blog"
        value={title}
        onValueChange={setTitle}
        maxLength={120}
      />
      <Textarea
        label="Descripción"
        value={description}
        onValueChange={setDescription}
        maxLength={500}
      />
      <Textarea
        label="Texto de bienvenida"
        value={welcomeText}
        onValueChange={setWelcomeText}
        maxLength={500}
      />
      <PrimaryButton onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </PrimaryButton>
    </section>
  );
};

export default EditProductionForm;
