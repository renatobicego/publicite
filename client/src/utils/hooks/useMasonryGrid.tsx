"use client";

import { useEffect, useState } from "react";

const useMasonryGrid = (
  items: any[],
  columnCounts: number[] = [1, 2, 3, 4], // Default column counts
  screenSizes: number[] = [640, 1024, 1536] // Default breakpoints
) => {
  const [columns, setColumns] = useState<any[][]>([]);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;

      // Dynamically determine the number of columns based on screen width
      let columnCount = columnCounts[0]; // Default to the first column count

      for (let i = 0; i < screenSizes.length; i++) {
        if (screenWidth >= screenSizes[i]) {
          columnCount =
            columnCounts[i + 1] || columnCounts[columnCounts.length - 1];
        }
      }

      // Distribute items into columns
      const newColumns: any[][] = Array(columnCount)
        .fill(null)
        .map(() => []);

      items.forEach((item, index) => {
        newColumns[index % columnCount].push(item);
      });

      setColumns(newColumns);
    };

    // Initialize the grid on component mount
    handleResize();

    // Listen to window resize events
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, [columnCounts, items, screenSizes]);

  return { columns };
};

export default useMasonryGrid;
