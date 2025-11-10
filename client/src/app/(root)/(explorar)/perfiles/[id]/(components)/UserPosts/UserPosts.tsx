import PostListHeader from "@/app/(root)/(explorar)/anuncios/components/PostListHeader";
import MasonryPostGrid from "@/components/grids/MasonryPostGrid";
import TabTitle from "@/components/solapas/TabTitle";
import { Post } from "@/types/postTypes";
import { useFilteredAndSortedPosts } from "@/utils/hooks/useFilteredOrderedPosts";
import { Tab, Tabs } from "@nextui-org/react";
import { FaCheck, FaRegCalendar, FaXmark } from "react-icons/fa6";
import { TbClockExclamation } from "react-icons/tb";

const UserPosts = ({
  posts,
  isMyProfile,
}: {
  posts: Post[];
  isMyProfile: boolean;
}) => {
  const {
    searchTerms,
    setSearchTerms,
    sortDescriptor,
    setSortDescriptor,
    filter,
    setFilter,
    sortedItems,
    setSolapaSelected,
    solapaSelected,
  } = useFilteredAndSortedPosts(posts, "active");
  return (
    <>
      <PostListHeader
        searchTerms={searchTerms}
        setSearchTerms={setSearchTerms}
        filter={filter}
        setFilter={setFilter}
        sortDescriptor={sortDescriptor}
        setSortDescriptor={setSortDescriptor}
        showToggleList={false}
        dontPushSearch
      />
      {isMyProfile && (
        <Tabs
          selectedKey={solapaSelected}
          onSelectionChange={(key) => {
            const keyParsed = key as
              | "active"
              | "nextToExpire"
              | "inactive"
              | "expired";
            setSolapaSelected(keyParsed);
          }}
          aria-label="solapas de tipos anuncios"
          variant={"underlined"}
        >
          <Tab
            key="active"
            title={<TabTitle title="Activos" icon={<FaCheck />} />}
          />
          <Tab
            key="nextToExpire"
            title={
              <TabTitle title="Próximos a Vencer" icon={<FaRegCalendar />} />
            }
          />
          <Tab
            key="inactive"
            title={<TabTitle title="Inactivos" icon={<FaXmark />} />}
          />
          <Tab
            key="expired"
            title={<TabTitle title="Vencidos" icon={<TbClockExclamation />} />}
          />
        </Tabs>
      )}
      <MasonryPostGrid
        posts={sortedItems}
        isGroupPost={false}
        showChangeExpirationDate={
          solapaSelected === "nextToExpire" || solapaSelected === "expired"
        }
        hideSaveMagazineButton={
          solapaSelected === "inactive" || solapaSelected === "expired"
        }
      />
    </>
  );
};

export default UserPosts;
