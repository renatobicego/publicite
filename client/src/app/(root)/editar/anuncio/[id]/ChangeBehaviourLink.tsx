import PrimaryButton from "@/components/buttons/PrimaryButton";
import { PostBehaviourType } from "@/types/postTypes";
import { postsBehavioursTypes } from "@/utils/data/selectData";
import { EDIT_POST } from "@/utils/data/urls";
import { Link } from "@nextui-org/react";
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
      <PrimaryButton as={Link} href={`${EDIT_POST}/${id}/comportamiento`}>
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
