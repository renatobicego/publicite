import SearchPosts from "@/components/inputs/SearchPosts";
import { useInfiniteFetch } from "@/utils/hooks/useInfiniteFetch";
import UsersGrid from "./UsersGrid";
import Order, { SortOption } from "@/components/inputs/Order";
import FilterUsers from "./FilterUsers";
import { useFilteredAndSortedUsers } from "@/utils/hooks/useFilteredOrderedUsers";
import { useUserData } from "../../providers/userDataProvider";

const UsersLogic = () => {
  const { items, isLoading } = useInfiniteFetch({ typeOfData: "users" });

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

  const { userIdLogged } = useUserData();

  return (
    <section className="w-full flex-col flex gap-4">
      <h2>carteles de Usuario</h2>
      <div className="flex gap-2 items-center max-md:flex-wrap justify-end">
        <SearchPosts searchTerms={searchTerm} setSearchTerms={setSearchTerm} />
        {/* <FilterUsers setFilter={setFilter} /> */}
        <Order
          sortDescriptor={sortDescriptor}
          setSortDescriptor={setSortDescriptor}
          sortOptions={sortOptions}
        />
      </div>
      <UsersGrid
        items={sortedItems.filter((user) => user._id !== userIdLogged)}
        isLoading={isLoading}
      />
    </section>
  );
};

export default UsersLogic;
