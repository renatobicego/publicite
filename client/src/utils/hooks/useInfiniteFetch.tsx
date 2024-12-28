import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchDataByType, PubliciteDataTypes } from "../data/fetchDataByType";
import { toastifyError } from "../functions/toastify";
import { useInfiniteScroll } from "./useInfiniteScroll";
import {
  isLocationAwarePostType,
  useLocation,
} from "@/app/(root)/providers/LocationProvider";

interface FetchState {
  isLoading: boolean; // loading state
  hasMoreData: boolean; // more data to load available for infinite scroll
  page: number; // current page of the infinite scroll (we use pagination under the hood)
  items: any[]; // array of items to display
  errorOccurred: boolean;
}
export const useInfiniteFetch = (
  postType: PubliciteDataTypes,
  groupId?: string // group id is for getting posts of group members from within the group page
) => {
  // data to know the states of the fetch
  const [state, setState] = useState<FetchState>({
    isLoading: false,
    hasMoreData: true,
    page: 1,
    items: [],
    errorOccurred: false,
  });

  const updateState = useCallback((newState: Partial<FetchState>) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  }, []);
  // get the coordinates of the user and the function to request the permission
  const { coordinates, requestLocationPermission, manualLocation } =
    useLocation();
  // get the busqueda from the url
  const searchParams = useSearchParams();
  const busqueda = searchParams.get("busqueda");

  // Function to load more data
  const loadMore = useCallback(async () => {
    // if isLoading, hasMoreData is false or errorOccurred, return
    if (state.isLoading || !state.hasMoreData || state.errorOccurred) return;
    // if postType is location aware and coordinates is null, request the permission
    if (isLocationAwarePostType(postType) && !coordinates && !manualLocation) {
      try {
        await requestLocationPermission(postType);
      } catch {
        toastifyError(
          "Por favor, autoriza el acceso la localización en tu dispositivo o selecciona la ubicación manualmente."
        );
        return;
      }
    }
    if (!coordinates) {
      return;
    }
    // set isLoading to true
    updateState({ isLoading: true });
    try {
      // get data
      const data: any = await fetchDataByType(
        postType,
        busqueda,
        state.page,
        coordinates,
        groupId
      );
      // update state
      if (data.error) {
        toastifyError(data.error);
        updateState({ errorOccurred: true });
      } else {
        updateState({
          hasMoreData: data.hasMore,
          page: data.hasMore ? state.page + 1 : state.page,
          items: [...state.items, ...data.items],
          errorOccurred: false,
        });
      }
    } catch (error: any) {
      toastifyError(error as string);
      updateState({ errorOccurred: true });
    } finally {
      updateState({ isLoading: false });
    }
  }, [
    state,
    postType,
    busqueda,
    coordinates,
    groupId,
    updateState,
    requestLocationPermission,
    manualLocation,
  ]);

  // Trigger to reset state when postType or search term changes
  useEffect(() => {
    updateState({
      items: [],
      page: 1,
      errorOccurred: false,
      hasMoreData: true,
    });
  }, [postType, busqueda, updateState, coordinates]);

  // Effect to call `loadMore` only after `hasMoreData` is set to true
  useEffect(() => {
    if (
      state.hasMoreData &&
      !state.isLoading &&
      !state.errorOccurred &&
      state.page === 1
    ) {
      loadMore();
    }
  }, [
    state.hasMoreData,
    state.isLoading,
    state.errorOccurred,
    state.page,
    loadMore,
  ]);

  useInfiniteScroll(
    loadMore,
    state.isLoading,
    state.hasMoreData,
    state.errorOccurred
  );

  return {
    items: state.items,
    isLoading: state.isLoading,
  };
};
