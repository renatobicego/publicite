import PrimaryButton from "@/components/buttons/PrimaryButton";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { PostBehaviourType } from "@/types/postTypes";
import { SUBSCRIPTIONS, PACKS } from "@/utils/data/urls";
import { Button, Link } from "@nextui-org/react";
import { FaChevronLeft } from "react-icons/fa";

const PostsLimitReached = ({
  limit,
  numberOfPosts,
  postBehaviourType,
  setPostBehaviourTypeToPrevious,
}: {
  limit: number;
  numberOfPosts: number;
  postBehaviourType: PostBehaviourType;
  setPostBehaviourTypeToPrevious: () => void;
}) => {
  const postBehaviourTypeLabel: Record<PostBehaviourType, string> = {
    agenda: "Agenda",
    libre: "Libre",
  };
  return (
    <section
      className="w-full flex flex-col items-center h-[110%] 
              backdrop-blur-md absolute mx-auto z-50
              box-shadow-[0px_4px_30px_rgba(0,0,0,0.1)] 
              rounded-lg -top-4 lg:-top-8 justify-start
              border border-transparent gap-4
            "
    >
      <Button
        startContent={<FaChevronLeft />}
        onPress={setPostBehaviourTypeToPrevious}
        radius="full"
        size="sm"
        variant="light"
        className="mt-8 md:mt-16 2xl:mt-24 "
      >
        Volver
      </Button>
      <h4 className="text-center">
        ¡Ups! Has alcanzado el límite de publicaciones activas.
      </h4>
      <h5 className="text-center">
        {numberOfPosts} / {limit} publicaciones de comportamiento{" "}
        <em>{postBehaviourTypeLabel[postBehaviourType]}</em> activas
      </h5>
      <p className="text-sm 2xl:text-base md:max-w-[50%] 2xl:max-w-[50%] 3xl:max-w-[30%] text-center">
        Para crear un nuevo anuncio, puedes cambiar de tipo de suscripción o
        comprar packs de publicaciones.
      </p>
      <div className="flex gap-2 items-center">
        <PrimaryButton as={Link} href={SUBSCRIPTIONS}>
          Cambiar Plan de Suscripción
        </PrimaryButton>
        <SecondaryButton as={Link} href={PACKS}>
          Comprar Packs
        </SecondaryButton>
      </div>
      <p className="text-xs text-center">
        También puedes modificar tus publicaciones activas en tu cartel de
        usuario.
      </p>
    </section>
  );
};

export default PostsLimitReached;
