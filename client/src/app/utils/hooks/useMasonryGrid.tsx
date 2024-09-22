"use client"

import { useEffect, useState } from "react";

const useMasonryGrid = (items: any[], columnCounts: number[] = [1, 2, 3, 4]) => {
  // Create state to hold the columns
  const [columns, setColumns] = useState<any[][]>([[], [], [], []]);

  // Handle window resizing to dynamically update the columns
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      let columnCount = columnCounts[0];

      if (screenWidth >= 640 && screenWidth < 1024) {
        columnCount = columnCounts[1];
      } else if (screenWidth >= 1024 && screenWidth < 1536) {
        columnCount = columnCounts[2];
      } else if (screenWidth >= 1536) {
        columnCount = columnCounts[3];
      }

      // Distribute items into columns
      const newColumns: any[][] = Array(columnCount)
        .fill(null)
        .map(() => []);
      items.forEach((item: any, index) => {
        newColumns[index % columnCount].push(item);
      });

      setColumns(newColumns);
    };

    // Initialize the columns on mount
    handleResize();

    // Add event listener for window resizing
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, [columnCounts, items]);

  return {columns}
}

export default useMasonryGrid