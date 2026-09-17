"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Link } from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  createProduction,
  getProductionLimits,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { PRODUCTIONS, SUBSCRIPTIONS, PACKS } from "@/utils/data/urls";
import { ProductionVisibility } from "@/types/productionTypes";

/**
 * Alta de un blog de Mis Producciones (personal o de grupo).
 * Gate de plan: consulta `getProductionLimits` antes de mostrar el formulario.
 */
const CreateProductionForm = ({ groupId }: { groupId?: string }) => {
  const router = useRouter();
  const [loadingLimits, setLoadingLimits] = useState(true);
  const [canCreate, setCanCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [welcomeText, setWelcomeText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const limits = await getProductionLimits();
      if (!active) return;
      if (isProductionActionError(limits)) {
        toastifyError(limits.error);
        setCanCreate(false);
      } else {
        const available = groupId
          ? limits.groupBlogsAvailable
          : limits.personalBlogsAvailable;
        setCanCreate(available > 0);
      }
      setLoadingLimits(false);
    })();
    return () => {
      active = false;
    };
  }, [groupId]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toastifyError("El título del blog es obligatorio");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createProduction({
        title: title.trim(),
        description: description.trim() || undefined,
        welcomeText: welcomeText.trim() || undefined,
        visibility: ProductionVisibility.public,
        groupId,
      });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Blog creado con éxito");
      router.push(`${PRODUCTIONS}/${res._id}`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingLimits) {
    return <p className="text-sm">Cargando…</p>;
  }

  if (!canCreate) {
    return (
      <section className="w-full flex flex-col items-center gap-4 rounded-lg border p-6">
        <h4 className="text-center">
          {groupId
            ? "Alcanzaste el límite de blogs de grupo de tu plan."
            : "Ya tenés tu blog personal. Tu plan permite un único blog personal."}
        </h4>
        <p className="text-sm text-center md:max-w-[60%]">
          Para crear un nuevo blog, cambiá de plan o comprá un pack de
          publicaciones.
        </p>
        <div className="flex gap-2 items-center">
          <PrimaryButton as={Link} href={SUBSCRIPTIONS}>
            Cambiar Plan
          </PrimaryButton>
          <SecondaryButton as={Link} href={PACKS}>
            Comprar Packs
          </SecondaryButton>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full flex flex-col gap-4 max-w-2xl">
      <Input
        isRequired
        label="Título del blog"
        placeholder="Mi blog"
        value={title}
        onValueChange={setTitle}
        maxLength={120}
      />
      <Textarea
        label="Descripción (opcional)"
        placeholder="De qué trata tu blog"
        value={description}
        onValueChange={setDescription}
        maxLength={500}
      />
      <Textarea
        label="Texto de bienvenida (opcional)"
        placeholder="Bienvenidos a mi blog"
        value={welcomeText}
        onValueChange={setWelcomeText}
        maxLength={500}
      />
      <PrimaryButton onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Creando…" : "Crear blog"}
      </PrimaryButton>
    </section>
  );
};

export default CreateProductionForm;
