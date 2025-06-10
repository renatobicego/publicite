import SearchPosts from "@/components/inputs/SearchPosts";
import Order, { SortOption } from "@/components/inputs/Order";
import { Switch } from "@nextui-org/react";
import FilterPosts from "./FilterPosts";
import { Dispatch, SetStateAction } from "react";

interface PostListHeaderProps {
  searchTerms: (string | undefined)[];
  setSearchTerms: Dispatch<SetStateAction<(string | undefined)[]>>;
  filter: { category: string[]; priceRange: (number | undefined)[] };
  setFilter: (filter: any) => void;
  sortDescriptor: { column: string; direction: string };
  setSortDescriptor: (sort: any) => void;
  showAsList?: boolean;
  setShowAsList?: (value: boolean) => void;
  showToggleList?: boolean;
  dontPushSearch?: boolean;
}

const PostListHeader = ({
  searchTerms,
  setSearchTerms,
  filter,
  setFilter,
  sortDescriptor,
  setSortDescriptor,
  showAsList,
  setShowAsList,
  showToggleList = true,
  dontPushSearch = false,
}: PostListHeaderProps) => {
  // Sorting options for the Order component
  const sortOptions: SortOption[] = [
    { label: "A-Z", key: "nameAsc", direction: "ascending", column: "title" },
    { label: "Z-A", key: "nameDesc", direction: "descending", column: "title" },
    {
      label: "Precio de mayor a menor",
      key: "priceDesc",
      direction: "descending",
      column: "price",
    },
    {
      label: "Precio de menor a mayor",
      key: "priceAsc",
      direction: "ascending",
      column: "price",
    },
  ];
  return (
    <div
      id="post-list-header"
      className="flex gap-2 items-center max-md:flex-wrap justify-end w-full"
    >
      <SearchPosts
        searchTerms={searchTerms}
        setSearchTerms={setSearchTerms}
        isMultiSearch
        dontPushSearch={dontPushSearch}
      />
      <FilterPosts filter={filter} setFilter={setFilter} />
      <Order
        sortDescriptor={sortDescriptor}
        setSortDescriptor={setSortDescriptor}
        sortOptions={sortOptions}
      />
      {showToggleList && (
        <Switch
          color="secondary"
          isSelected={showAsList}
          onValueChange={setShowAsList}
          className="min-w-fit"
          classNames={{
            label: "text-xs md:text-sm",
          }}
        >
          Mostrar en Lista
        </Switch>
      )}
    </div>
  );
};

export default PostListHeader;
