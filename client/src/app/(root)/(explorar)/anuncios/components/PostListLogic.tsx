import PostsGrid from "@/components/grids/PostGrid";
import PostGridList from "@/components/grids/PostGridList";
import { useInfiniteFetch } from "@/utils/hooks/useInfiniteFetch";
import { useState } from "react";
import PostListHeader from "./PostListHeader";
import { useFilteredAndSortedPosts } from "@/utils/hooks/useFilteredOrderedPosts";
import { useSearchParams } from "next/navigation";
import {
  ContactPostsVisibility,
  PostsDataTypes,
} from "@/utils/data/fetchDataByType";
import { Tabs, Tab } from "@nextui-org/react";
import Link from "next/link";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { PROFILE } from "@/utils/data/urls";

const PostListLogic = ({ postType }: { postType: PostsDataTypes }) => {
  const [showAsList, setShowAsList] = useState(false);
  const [solapaSelected, setSolapaSelected] =
    useState<ContactPostsVisibility>("hierarchy");
  const isContactPosts = postType.typeOfData === "contactPosts";
  const { items, isLoading } = useInfiniteFetch(
    postType,
    isContactPosts ? solapaSelected : undefined
  );
  const { userIdLogged } = useUserData();
  const queryParams = useSearchParams();
  const querySearch = queryParams.get("busqueda") || "";
  const {
    searchTerms,
    setSearchTerms,
    sortDescriptor,
    setSortDescriptor,
    filter,
    setFilter,
    sortedItems,
  } = useFilteredAndSortedPosts(items);
  return (
    <>
      <PostListHeader
        searchTerms={searchTerms}
        setSearchTerms={setSearchTerms}
        filter={filter}
        setFilter={setFilter}
        sortDescriptor={sortDescriptor}
        setSortDescriptor={setSortDescriptor}
        showAsList={showAsList}
        setShowAsList={setShowAsList}
      />
      {isContactPosts && (
        <>
          <Tabs
            selectedKey={solapaSelected}
            onSelectionChange={(key) => {
              const keyParsed = key as ContactPostsVisibility;
              setSolapaSelected(keyParsed);
            }}
            aria-label="solapas de visibilidad de anuncios a partir del tipo de relación con el anunciante"
            variant={"underlined"}
          >
            <Tab key="hierarchy" title="Todos" />
            <Tab key="contacts" title="Contactos" />
            <Tab key="friends" title="Amigos" />
            <Tab key="topfriends" title="Top Amigos" />
          </Tabs>
          <p className="text-sm">
            Únicamente aparecerán anuncios de relaciones activas. Para
            gestionarlas, ve a tu{" "}
            <Link
              className="text-primary"
              href={`${PROFILE}/${userIdLogged}/contactos`}
            >
              perfil
            </Link>
          </p>
        </>
      )}
      {showAsList ? (
        <PostGridList
          items={sortedItems}
          isLoading={isLoading}
          isSearchDone={querySearch.length > 0}
        />
      ) : (
        <PostsGrid
          posts={sortedItems}
          isLoading={isLoading}
          isGroupPosts={postType.typeOfData === "groupPosts"}
          isSearchDone={querySearch.length > 0}
        />
      )}
    </>
  );
};

export default PostListLogic;
