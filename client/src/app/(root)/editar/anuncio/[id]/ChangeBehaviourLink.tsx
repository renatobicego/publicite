import PrimaryButton from "@/components/buttons/PrimaryButton";
import { PostBehaviourType } from "@/types/postTypes";
import { postsBehavioursTypes } from "@/utils/data/selectData";
import { POSTS } from "@/utils/data/urls";
import Link from "next/link";
import React from "react";

const ChangeBehaviourLink = ({
  id,
  postBehaviourType,
}: {
  id: string;
  postBehaviourType: PostBehaviourType;
}) => {
  return (
    <div className="flex flex-col gap-2 items-start">
      <PrimaryButton as={Link} href={`${POSTS}/${id}/comportamiento`}>
        Editar Comportamiento
      </PrimaryButton>
      <small>
        Cambiar comportamiento de {postsBehavioursTypes[postBehaviourType]} a{" "}
        {
          postsBehavioursTypes[
            postBehaviourType === "libre" ? "agenda" : "libre"
          ]
        }
      </small>
    </div>
  );
};

export default ChangeBehaviourLink;
