import { Button, Link } from "@nextui-org/react";
import { FaChevronLeft } from "react-icons/fa";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { ProductionBehaviourType } from "@/types/productionTypes";
import { PACKS, SUBSCRIPTIONS } from "@/utils/data/urls";

/**
 * Aviso de cupo agotado para un comportamiento de blog (como
 * `PostsLimitReached` de Anuncios). `onBack` vuelve a elegir comportamiento.
 */
const BlogLimitReached = ({
  behaviourType,
  count,
  limit,
  onBack,
}: {
  behaviourType?: ProductionBehaviourType;
  count?: number;
  limit?: number;
  onBack?: () => void;
}) => {
  const typeLabel = !behaviourType
    ? "blogs de grupo"
    : behaviourType === ProductionBehaviourType.agenda
      ? "blogs de agenda"
      : "blogs libres";
  return (
    <section className="w-full max-w-2xl flex flex-col items-center gap-4 rounded-lg border p-6">
      {onBack && (
        <Button
          startContent={<FaChevronLeft />}
          onPress={onBack}
          radius="full"
          size="sm"
          variant="light"
          className="self-start"
        >
          Volver
        </Button>
      )}
      <h4 className="text-center">
        Alcanzaste el límite de {typeLabel} de tu plan
        {limit !== undefined && count !== undefined
          ? ` (${count} de ${limit})`
          : ""}
        .
      </h4>
      <p className="text-sm text-center md:max-w-[80%]">
        Para crear uno nuevo, cambiá de plan o comprá un pack de
        publicaciones.
        {onBack && " También podés elegir el otro comportamiento."}
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
};

export default BlogLimitReached;
