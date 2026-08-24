"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { fetchMagazines } from "./slices/magazineSlice";
import { fetchConfigData } from "./slices/configSlice";
import {
  useActiveSubscriptions,
  useConfigData,
  useMagazinesData,
} from "./userDataProvider";
import { fetchSubscriptions } from "./slices/subscriptionsSlice";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  const retryCount = useRef(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !username) return;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          if (!magazines) {
            await dispatch(fetchMagazines(userId) as any);
          }
          if (!configData) {
            await dispatch(fetchConfigData({ username, userId }) as any);
          }
          if (!accountType) {
            await dispatch(fetchSubscriptions(userId as string) as any);
          }
          // Si llegó acá sin error, salimos del loop
          retryCount.current = 0;
          return;
        } catch (error) {
          console.warn(
            `[DataInitializer] Intento ${attempt}/${MAX_RETRIES} falló:`,
            error
          );
          if (attempt < MAX_RETRIES) {
            await wait(RETRY_DELAY_MS * attempt);
          } else {
            console.error(
              "[DataInitializer] No se pudieron obtener los datos después de varios intentos."
            );
          }
        }
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [magazines, configData]);

  return null; // This component doesn't render anything visible
};

export default DataInitializer;
