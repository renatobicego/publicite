import SearchPosts from "@/app/components/inputs/SearchPosts";
import { mockedUsers } from "@/app/utils/data/mockedData";
import { useInfiniteFetch } from "@/app/utils/hooks/useInfiniteFetch";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import UsersGrid from "./UsersGrid";
import Order, { SortOption } from "@/app/components/inputs/Order";
import FilterUsers from "./FilterUsers";

const UsersLogic = () => {
  const searchParams = useSearchParams();
  const busqueda = searchParams.get("busqueda");
  // Function to simulate fetching data
  const fetchMockedData = async () => {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return [...mockedUsers]; // Return the same mocked data
  };

  const { items, isLoading } = useInfiniteFetch(fetchMockedData, true); // Always fetch more
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "",
    direction: "",
  });
  const hasSearchFilter = Boolean(searchTerm);
  const [filter, setFilter] = useState({
    location: "",
  });

  const filteredItems = useMemo(() => {
    let filteredUsers = [...items];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter.location) {
      const locationTerms = Array.from(
        new Set(
          filter.location
            .toLowerCase()
            .split(",")
            .map((term) => term.trim())
        )
      );

      // Remove the last element and filter users
      filteredUsers = filteredUsers.filter((user) => {
        const userLocation = user.countryRegion.toLowerCase();

        return locationTerms
          .every((term) => userLocation.includes(term));
      });
    }

    return filteredUsers;
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

  const sortOptions: SortOption[] = [
    { label: "A-Z", key: "aZ", direction: "ascending" },
    { label: "Z-A", key: "zA", direction: "descending" },
  ];

  return (
    <section className="w-full flex-col flex gap-4">
      <h2>Perfiles</h2>
      <div className="flex gap-2">
        <SearchPosts searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
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
