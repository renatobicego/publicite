"use client";
import SelectPostType from "@/components/inputs/SelectPostType";
import { postTypesItems } from "@/utils/data/selectData";
import {
  POST_BEST,
  POST_CONTACTS,
  POST_NEXT_TO_EXPIRE,
  POST_RECENTS,
  POSTS,
} from "@/utils/data/urls";
import { usePathname } from "next/navigation";
import { useState } from "react";
import PostListLogic from "./PostListLogic";
import SelectManualLocationModal from "@/components/modals/SelectManualLocation/SelectManualLocationModal";
import { PostsDataTypes } from "@/utils/data/fetchDataByType";

const PostsList = ({
  postTypeVisited,
  hideMap,
}: {
  postTypeVisited: PostsDataTypes;
  hideMap?: boolean;
}) => {
  const pathname = usePathname();

  // Function to determine the title based on path and post type
  const titleToShow = () => {
    const typeSelected =
      postTypeVisited.typeOfData === "posts" ||
      postTypeVisited.typeOfData === "contactPosts"
        ? postTypesItems.find(
            (pType) => pType.value === postTypeVisited.postType
          )?.label
        : "";

    switch (true) {
      case pathname.includes(`${POST_RECENTS}`):
        return "Anuncios de Hoy - " + typeSelected;
      case pathname.includes(`${POST_BEST}`):
        return "Mejor Puntuados - " + typeSelected;
      case pathname.includes(`${POST_NEXT_TO_EXPIRE}`):
        return "Próximos a Vencer - " + typeSelected;
      case pathname.includes(`${POST_CONTACTS}`):
        return "Anuncios de Contactos - " + typeSelected;
      case pathname.includes(POSTS):
        return "Recomendados - " + typeSelected;
      default:
        return "Anuncios - " + typeSelected;
    }
  };
  return (
    <section className="w-full flex-col flex gap-4 items-start">
      <SelectPostType
        postType={
          "postType" in postTypeVisited
            ? (postTypeVisited.postType as PostType)
            : "good"
        }
      />
      <h2>{titleToShow()}</h2>
      {!hideMap && <SelectManualLocationModal showAlways />}
      <PostListLogic postType={postTypeVisited} />
    </section>
  );
};

export default PostsList;
