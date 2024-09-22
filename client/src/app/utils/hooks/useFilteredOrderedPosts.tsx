import { useMemo, useState } from "react";

export const useFilteredAndSortedPosts = (items: any[]) => {
  // Modify searchTerm to hold two terms
  const [searchTerms, setSearchTerms] = useState<(string | undefined)[]>([]);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "",
    direction: "",
  });

  const hasSearchFilter = Boolean(searchTerms[0] || searchTerms[1]);

  const [filter, setFilter] = useState<{
    category: string[];
    priceRange: (number | undefined)[];
  }>({
    category: [],
    priceRange: [undefined, undefined],
  });

  const filteredItems = useMemo(() => {
    let filteredPosts = [...items];

    // Check if either search term is provided and filter based on that
    if (hasSearchFilter) {
      filteredPosts = filteredPosts.filter((post) => {
        const titleLowerCase = post.title.toLowerCase();
        const matchesFirstTerm = searchTerms[0]
          ? titleLowerCase.includes(searchTerms[0].toLowerCase())
          : true;
        const matchesSecondTerm = searchTerms[1]
          ? titleLowerCase.includes(searchTerms[1].toLowerCase())
          : true;

        // Post should match either of the search terms
        return matchesFirstTerm && matchesSecondTerm;
      });
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
  }, [hasSearchFilter, items, searchTerms, filter]);

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
    searchTerms,
    setSearchTerms,
    sortDescriptor,
    setSortDescriptor,
    filter,
    setFilter,
    sortedItems,
  };
};
