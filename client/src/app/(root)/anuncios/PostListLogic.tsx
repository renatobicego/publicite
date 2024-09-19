import PostsGrid from "@/app/components/grids/PostGrid";
import PostGridList from "@/app/components/grids/PostGridList";
import Filter from "@/app/components/inputs/Filter";
import FilterOrder from "@/app/components/inputs/Filter";
import Order from "@/app/components/inputs/Order";
import SearchPosts from "@/app/components/inputs/SearchPosts";
import { mockedPosts } from "@/app/utils/data/mockedData";
import { useInfiniteFetch } from "@/app/utils/hooks/useInfiniteFetch";
import { Switch } from "@nextui-org/react";
import { useMemo, useState } from "react";

const PostListLogic = () => {
  const [showAsList, setShowAsList] = useState(false);
  // Function to simulate fetching data
  const fetchMockedData = async () => {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return [...mockedPosts]; // Return the same mocked data
  };

  const { items, isLoading } = useInfiniteFetch(fetchMockedData, true); // Always fetch more
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "",
    direction: "",
  });
  const hasSearchFilter = Boolean(searchTerm);
  const [filter, setFilter] = useState({
    category: [] as string[],
    priceRange: [0, 2000000000]
  })

  const filteredItems = useMemo(() => {
    let filteredPosts = [...items];

    if (hasSearchFilter) {
      filteredPosts = filteredPosts.filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filter.category.length > 0) {
      filteredPosts = filteredPosts.filter((post) =>
        filter.category.includes(post.category._id),
      );
    }

    if (filter.priceRange[0] !== 0 || filter.priceRange[1] !== 2000000000) {
      filteredPosts = filteredPosts.filter((post) =>
        post.price >= filter.priceRange[0] && post.price <= filter.priceRange[1]
      );
    }
    return filteredPosts;
  }, [hasSearchFilter, items, searchTerm, filter]);

  const sortedItems = useMemo(() => {
    if (!sortDescriptor.column) {
      return filteredItems;
    }
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items, filteredItems]);

  return (
    <>
      <div className="flex gap-2">
        <SearchPosts searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        <Filter filter={filter} setFilter={setFilter}/>
        <Order sortDescriptor={sortDescriptor} setSortDescriptor={setSortDescriptor}/>
        <Switch
          color="secondary"
          isSelected={showAsList}
          onValueChange={setShowAsList}
          className="min-w-fit"
        >
          Mostrar en Lista
        </Switch>
      </div>
      {showAsList ? (
        <PostGridList items={sortedItems} isLoading={isLoading} />
      ) : (
        <PostsGrid posts={sortedItems} isLoading={isLoading} />
      )}
    </>
  );
};

export default PostListLogic;
