"use client";
import SelectPostType from "@/components/inputs/SelectPostType";
import { postTypesItems } from "@/utils/data/selectData";
import { POSTS } from "@/utils/data/urls";
import { usePathname } from "next/navigation";
import { useState } from "react";
import PostListLogic from "./PostListLogic";

const PostsList = ({postTypeVisited} : {postTypeVisited: "good" | "service" | "petition"}) => {
  const pathname = usePathname();
  
  // Function to determine the title based on path and post type
  const titleToShow = () => {
    const typeSelected = postTypesItems.find(
      (pType) => pType.value === postTypeVisited
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
        return "Anuncios - " + typeSelected;
    }
  };
  return (
    <section className="w-full flex-col flex gap-4">
      <SelectPostType postType={postTypeVisited} />
      <h2>{titleToShow()}</h2>
      <PostListLogic postType={postTypeVisited} />
    </section>
  );
};

export default PostsList;
