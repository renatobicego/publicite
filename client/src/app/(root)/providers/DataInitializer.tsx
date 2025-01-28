"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchMagazines } from "./slices/magazineSlice";
import { fetchConfigData } from "./slices/configSlice";
import { toastifyError } from "@/utils/functions/toastify";
import { useConfigData, useMagazinesData } from "./userDataProvider";

const DataInitializer = ({
  userId,
  username,
}: {
  userId?: string;
  username?: string | null;
}) => {
  const dispatch = useDispatch();
  const { magazines } = useMagazinesData();
  const { configData } = useConfigData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userId && username) {
          // Get the previous username from session storage
          const prevUsername = sessionStorage.getItem("prevUsername");
          // Check if the username has changed
          const hasUsernameChanged = prevUsername !== username;
          // Update sessionStorage ONLY if the username has changed
          if (hasUsernameChanged) {
            sessionStorage.setItem("prevUsername", username);
          }

          if (hasUsernameChanged || !magazines) {
            await dispatch(fetchMagazines(userId) as any);
          }
          if (hasUsernameChanged || !configData) {
            await dispatch(fetchConfigData({ username, userId }) as any);
          }
        }
      } catch (error) {
        toastifyError(
          "Error al obtener los datos del usuario. Por favor intenta de nuevo."
        );
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [magazines, configData]);

  return null; // This component doesn't render anything visible
};

export default DataInitializer;
