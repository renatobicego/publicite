"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchMagazines } from "./slices/magazineSlice";
import { fetchConfigData } from "./slices/configSlice";

const DataInitializer = ({ userId, username }: { userId?: string, username?: string | null }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (userId && username) {
      dispatch(fetchMagazines(userId) as any);
      dispatch(fetchConfigData({ username, userId }) as any);
    }
  }, [dispatch, userId, username]);

  return null; // This component doesn't render anything visible
};

export default DataInitializer;
