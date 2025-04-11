"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchMagazines } from "./slices/magazineSlice";
import { fetchConfigData } from "./slices/configSlice";
import { toastifyError } from "@/utils/functions/toastify";
import {
  useActiveSubscriptions,
  useConfigData,
  useMagazinesData,
} from "./userDataProvider";
import { fetchSubscriptions } from "./slices/subscriptionsSlice";

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
  const { accountType } = useActiveSubscriptions();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userId && username) {
          if (!magazines) {
            await dispatch(fetchMagazines(userId) as any);
          }
          if (!configData) {
            await dispatch(fetchConfigData({ username, userId }) as any);
          }
          if (!accountType) {
            await dispatch(fetchSubscriptions(userId as string) as any);
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
