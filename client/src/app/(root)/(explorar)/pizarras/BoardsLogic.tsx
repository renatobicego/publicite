"use client";
import SearchPosts from "@/components/inputs/SearchPosts";
import BoardGrid from "./BoardGrid";
import { useInfiniteFetch } from "@/utils/hooks/useInfiniteFetch";
import { useMemo, useState } from "react";
import { Board } from "@/types/board";

const BoardsLogic = () => {
  const { items, isLoading } = useInfiniteFetch({ typeOfData: "boards" });
  const [searchTerms, setSearchTerms] = useState<(string | undefined)[]>([]);

  // Ensure searchTerms are non-empty strings
  const hasSearchFilter = Boolean(
    (searchTerms[0] && searchTerms[0].trim() !== "") ||
    (searchTerms[1] && searchTerms[1].trim() !== "")
  );

  const filteredItems = useMemo(() => {
    let filteredBoards = [...items];
  
    if (hasSearchFilter) {
      filteredBoards = filteredBoards.filter((board: Board) => {
        const firstSearchTerm = searchTerms[0]?.toLowerCase().trim();
        const secondSearchTerm = searchTerms[1]?.toLowerCase().trim();
  
        // Check if any annotations or keywords match the first term
        const firstTermMatch =
          !firstSearchTerm ||
          board.annotations.some((annotation: string) =>
            annotation.toLowerCase().includes(firstSearchTerm)
          ) ||
          board.keywords.some((keyword: string) =>
            keyword.toLowerCase().includes(firstSearchTerm)
          );
  
        // Check if any annotations or keywords match the second term (only if defined)
        const secondTermMatch =
          !secondSearchTerm || // If second search term is not defined, we allow the match
          board.annotations.some((annotation: string) =>
            annotation.toLowerCase().includes(secondSearchTerm)
          ) ||
          board.keywords.some((keyword: string) =>
            keyword.toLowerCase().includes(secondSearchTerm)
          );
  
        // Return true if firstTerm matches and secondTerm matches (if defined)
        return firstTermMatch && secondTermMatch;
      });
    }
  
    return filteredBoards;
  }, [hasSearchFilter, items, searchTerms]);
  

  return (
    <section className="w-full flex-col flex gap-4">
      <h2>Pizarras</h2>
      <div className="flex gap-2">
        <SearchPosts
          searchTerms={searchTerms}
          setSearchTerms={setSearchTerms}
          isMultiSearch
        />
      </div>
      <BoardGrid items={filteredItems} isLoading={isLoading}/>
    </section>
  );
};

export default BoardsLogic;
