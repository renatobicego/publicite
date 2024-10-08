import { Group } from "@/types/userTypes";
import { useState, useMemo } from "react";

export const useFilteredAndSortedGroups = (items: any[]) => {
  // Search term used in post grid
  const [searchTerm, setSearchTerm] = useState("");

  // Sorting key and direction
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "",
    direction: "",
  });
  const hasSearchFilter = Boolean(searchTerm);

  // Filtered items
  const filteredItems = useMemo(() => {
    let filteredGroups = [...items];

    // Search filter
    if (hasSearchFilter) {
      filteredGroups = filteredGroups.filter(
        (group: Group) =>
          group.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredGroups;
  }, [hasSearchFilter, items, searchTerm]);

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
    sortedItems,
  };
};
