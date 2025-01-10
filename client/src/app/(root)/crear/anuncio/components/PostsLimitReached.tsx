import PrimaryButton from "@/components/buttons/PrimaryButton";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { PostBehaviourType } from "@/types/postTypes";
import { SUBSCRIPTIONS, PACKS } from "@/utils/data/urls";
import { Link } from "@nextui-org/react";

const PostsLimitReached = ({
  limit,
  numberOfPosts,
  postBehaviourType,
}: {
  limit: number;
  numberOfPosts: number;
  postBehaviourType: PostBehaviourType;
}) => {
  const postBehaviourTypeLabel: Record<PostBehaviourType, string> = {
    agenda: "Agenda",
    libre: "Libre",
  };
  return (
    <div
      className="w-full flex flex-col items-center h-[110%] 
              backdrop-blur-md absolute mx-auto z-50
              box-shadow-[0px_4px_30px_rgba(0,0,0,0.1)] 
              rounded-lg -top-8
              border border-transparent gap-4
            "
    >
      <h5 className="mt-28">
        ¡Ups! Has alcanzado el límite de publicaciones activas.
      </h5>
      <h6>
        {numberOfPosts} / {limit} publicaciones de comportamiento{" "}
        <em>{postBehaviourTypeLabel[postBehaviourType]}</em> activas
      </h6>
      <p className="lg:max-w-[60%] 2xl:max-w-[50%] 3xl:max-w-[30%] text-center">
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
      <p className="text-xs">
        También puedes modificar tus publicaciones activas en tu perfil.
      </p>
    </div>
  );
};

export default PostsLimitReached;
