"use client";
import SearchPosts from "@/app/components/inputs/SearchPosts";
import BoardGrid from "./BoardGrid";
import { getBoards } from "@/app/services/boardServices";
import { useInfiniteFetch } from "@/app/utils/hooks/useInfiniteFetch";
import { useMemo, useState } from "react";
import { Board } from "@/types/board";
const BoardsLogic = () => {
  const { items, isLoading } = useInfiniteFetch(getBoards, true);
  const [searchTerm, setSearchTerm] = useState("");
  const hasSearchFilter = Boolean(searchTerm);
  const filteredItems = useMemo(() => {
    let filteredBoards = [...items];
  
    if (hasSearchFilter) {
      filteredBoards = filteredBoards.filter((board: Board) => {
        // Convert search term to lowercase
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
        // Check if any annotations match
        const annotationMatch = board.annotations.some((annotation: string) =>
          annotation.toLowerCase().includes(lowerCaseSearchTerm),
        );
  
        // Check if any keywords match
        const keywordMatch = board.keywords.some((keyword: string) =>
          keyword.toLowerCase().includes(lowerCaseSearchTerm),
        );
  
        // Return true if either annotations or keywords match
        return annotationMatch || keywordMatch;
      });
    }
  
    return filteredBoards;
  }, [hasSearchFilter, items, searchTerm]);
  return (
    <section className="w-full flex-col flex gap-4">
      <h2>Pizarras</h2>
      <div className="flex gap-2">
        <SearchPosts searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
      </div>
      <BoardGrid items={filteredItems} isLoading={isLoading}/>
    </section>
  );
};

export default BoardsLogic;
