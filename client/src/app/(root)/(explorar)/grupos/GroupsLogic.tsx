import SearchPosts from "@/components/inputs/SearchPosts";
import { useInfiniteFetch } from "@/utils/hooks/useInfiniteFetch";
import Order, { SortOption } from "@/components/inputs/Order";
import { useFilteredAndSortedGroups } from "@/utils/hooks/useFIlteredOrderedGroups";
import GroupsGrid from "./GroupsGrid";

const GroupsLogic = () => {
  const { items, isLoading } = useInfiniteFetch("groups", true);

  // Use custom hook for filtering and sorting logic
  const {
    searchTerm,
    setSearchTerm,
    sortDescriptor,
    setSortDescriptor,
    sortedItems,
  } = useFilteredAndSortedGroups(items);

  const sortOptions: SortOption[] = [
    { label: "A-Z", key: "aZ", direction: "ascending", column: "name" },
    { label: "Z-A", key: "zA", direction: "descending", column: "name" },
  ];

  return (
    <section className="w-full flex-col flex gap-4">
      <h2>Grupos</h2>
      <div className="flex gap-2 items-center">
        <SearchPosts searchTerms={searchTerm} setSearchTerms={setSearchTerm} />
        <Order
          sortDescriptor={sortDescriptor}
          setSortDescriptor={setSortDescriptor}
          sortOptions={sortOptions}
        />
      </div>
      <GroupsGrid items={sortedItems} isLoading={isLoading} />
    </section>
  );
};

export default GroupsLogic;
