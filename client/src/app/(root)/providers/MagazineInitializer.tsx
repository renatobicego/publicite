"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchMagazines } from "./slices/magazineSlice";

const MagazineInitializer = ({ userId }: { userId?: string }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (userId) {
      dispatch(fetchMagazines(userId) as any);
    }
  }, [dispatch, userId]);

  return null; // This component doesn't render anything visible
};

export default MagazineInitializer;
