"use client";
import SelectPostType from "@/components/inputs/SelectPostType";
import { postTypesItems } from "@/utils/data/selectData";
import { POSTS } from "@/utils/data/urls";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import PostListLogic from "./PostListLogic";
import { fetchDataByType } from "@/utils/data/fetchDataByType";

const PostsList = () => {
  const [postType, setPostType] = useState<"good" | "service" | "petition">("good");
  const pathname = usePathname();
  
  // Function to determine the title based on path and post type
  const titleToShow = () => {
    const typeSelected = postTypesItems.find(
      (pType) => pType.value === postType
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
      <PostListLogic postType={postType} />
    </section>
  );
};

export default PostsList;
