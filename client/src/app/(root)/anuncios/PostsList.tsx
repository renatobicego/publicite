"use client";
import SelectPostType from "@/app/components/inputs/SelectPostType";
import { postTypesItems } from "@/app/utils/data/selectData";
import { POSTS } from "@/app/utils/data/urls";
import { Selection } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import PostListLogic from "./PostListLogic";

const PostsList = () => {
  const [postType, setPostType] = useState<Selection>(new Set(["good"]));

  const pathname = usePathname();
  const titleToShow = () => {
    const typeSelected = postTypesItems.find(
      (pType) => pType.value === Array.from(postType)[0]
    )?.label;
    switch (pathname) {
      case POSTS:
        return "Recomendados - " + typeSelected;
      case `${POSTS}/recientes`:
        return "Anuncios de Hoy - " + typeSelected;
      case `${POSTS}/mejor-puntuados`:
        return "Mejor Puntuados - " + typeSelected;
      case `${POSTS}/proximos-a-vencer`:
        return "Próximos a Vencer - " + typeSelected;
      default:
        return "Anuncios";
    }
  };
  return (
    <section className="w-full flex-col flex gap-4">
      <SelectPostType postType={postType} setPostType={setPostType} />
      <h2>{titleToShow()}</h2>
      <PostListLogic />
    </section>
  );
};

export default PostsList;
