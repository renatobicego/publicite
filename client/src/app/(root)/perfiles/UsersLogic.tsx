import SearchPosts from "@/app/components/inputs/SearchPosts";
import { mockedUsers } from "@/app/utils/data/mockedData";
import { useInfiniteFetch } from "@/app/utils/hooks/useInfiniteFetch";
import { useSearchParams } from "next/navigation";
import UsersGrid from "./UsersGrid";
import Order, { SortOption } from "@/app/components/inputs/Order";
import FilterUsers from "./FilterUsers";
import { useFilteredAndSortedUsers } from "@/app/utils/hooks/useFilteredOrderedUsers";

const UsersLogic = () => {
  const searchParams = useSearchParams();
  const busqueda = searchParams.get("busqueda");

  const { items, isLoading } = useInfiniteFetch("users", true);

  // Use custom hook for filtering and sorting logic
  const {
    searchTerm,
    setSearchTerm,
    sortDescriptor,
    setSortDescriptor,
    setFilter,
    sortedItems,
  } = useFilteredAndSortedUsers(items);

  const sortOptions: SortOption[] = [
    { label: "A-Z", key: "aZ", direction: "ascending", column: "name" },
    { label: "Z-A", key: "zA", direction: "descending", column: "name" },
  ];

  return (
    <section className="w-full flex-col flex gap-4">
      <h2>Perfiles</h2>
      <div className="flex gap-2 items-center">
        <SearchPosts searchTerms={searchTerm} setSearchTerms={setSearchTerm} />
        <FilterUsers setFilter={setFilter} />
        <Order
          sortDescriptor={sortDescriptor}
          setSortDescriptor={setSortDescriptor}
          sortOptions={sortOptions}
        />
      </div>
      <UsersGrid items={sortedItems} isLoading={isLoading} />
    </section>
  );
};

export default UsersLogic;
