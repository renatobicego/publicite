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
import { Tabs, Link, Tab } from "@nextui-org/react";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { PROFILE } from "@/utils/data/urls";
import TabTitle from "@/components/solapas/TabTitle";
import { FaPlus, FaUserGroup } from "react-icons/fa6";
import { MdContacts } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";

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
            <Tab
              key="hierarchy"
              title={<TabTitle title="Todos" icon={<FaUserGroup />} />}
            />
            <Tab
              key="contacts"
              title={<TabTitle title="Contactos" icon={<MdContacts />} />}
            />
            <Tab
              key="friends"
              title={<TabTitle title="Amigos" icon={<FaUserFriends />} />}
            />
            <Tab
              key="topfriends"
              title={
                <TabTitle
                  title="Top Amigos"
                  icon={
                    <>
                      <FaPlus className="size-3 md:size-4 " />
                      <FaUserFriends className="size-4 md:size-5 " />
                    </>
                  }
                />
              }
            />
          </Tabs>
          <p className="text-sm">
            Únicamente aparecerán anuncios de relaciones activas. Para
            gestionarlas, ve a tu{" "}
            <Link
              className="text-primary"
              href={`${PROFILE}/${userIdLogged}/contactos`}
            >
              cartel
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
