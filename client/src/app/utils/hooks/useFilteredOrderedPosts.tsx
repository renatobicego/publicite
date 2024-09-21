import { useMemo, useState } from "react";

export const useFilteredAndSortedPosts = (items: any[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "",
    direction: "",
  });
  const hasSearchFilter = Boolean(searchTerm);

  const [filter, setFilter] = useState<{
    category: string[];
    priceRange: (number | undefined)[];
  }>({
    category: [],
    priceRange: [undefined, undefined],
  });

  const filteredItems = useMemo(() => {
    let filteredPosts = [...items];

    if (hasSearchFilter) {
      filteredPosts = filteredPosts.filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter.category.length > 0) {
      filteredPosts = filteredPosts.filter((post) =>
        filter.category.includes(post.category._id)
      );
    }

    if (filter.priceRange[0] || filter.priceRange[1]) {
      filteredPosts = filteredPosts.filter((post) => {
        const minPrice = filter.priceRange[0]
          ? post.price >= filter.priceRange[0]
          : true;
        const maxPrice = filter.priceRange[1]
          ? post.price <= filter.priceRange[1]
          : true;
        return minPrice && maxPrice;
      });
    }

    return filteredPosts;
  }, [hasSearchFilter, items, searchTerm, filter]);

  const sortedItems = useMemo(() => {
    if (!sortDescriptor.column) {
      return filteredItems;
    }

    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  return {
    searchTerm,
    setSearchTerm,
    sortDescriptor,
    setSortDescriptor,
    filter,
    setFilter,
    sortedItems,
  };
};
