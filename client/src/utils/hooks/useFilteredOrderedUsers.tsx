import { useState, useMemo } from "react";

export const useFilteredAndSortedUsers = (items: any[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "",
    direction: "",
  });
  const [filter, setFilter] = useState({
    location: "",
  });

  const hasSearchFilter = Boolean(searchTerm);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...items];

    // Search filter
    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (filter.location) {
      const locationTerms = Array.from(
        new Set(
          filter.location
            .toLowerCase()
            .split(",")
            .map((term) => term.trim())
        )
      );

      filteredUsers = filteredUsers.filter((user) => {
        const userLocation = user.countryRegion.toLowerCase();
        return locationTerms.every((term) => userLocation.includes(term));
      });
    }

    return filteredUsers;
  }, [hasSearchFilter, items, searchTerm, filter]);

  // Sorting logic
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