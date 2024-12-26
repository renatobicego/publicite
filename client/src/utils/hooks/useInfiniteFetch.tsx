import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchDataByType, PubliciteDataTypes } from "../data/fetchDataByType";
import { toastifyError } from "../functions/toastify";
import { isLocationAwarePostType, useLocation } from "./useLocation";
import { useInfiniteScroll } from "./useInfiniteScroll";

interface FetchState {
  isLoading: boolean;
  hasMoreData: boolean;
  page: number;
  items: any[];
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
  const { coordinates, requestLocationPermission } = useLocation(postType);
  // get the busqueda from the url
  const searchParams = useSearchParams();
  const busqueda = searchParams.get("busqueda");

  // Function to load more data
  const loadMore = useCallback(async () => {
    // if isLoading, hasMoreData is false or errorOccurred, return
    if (state.isLoading || !state.hasMoreData || state.errorOccurred) return;
    // if postType is location aware and coordinates is null, request the permission
    if (isLocationAwarePostType(postType) && !coordinates) {
      try {
        await requestLocationPermission();
      } catch {
        updateState({ errorOccurred: true });
        return;
      }
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
  ]);

  // Trigger to reset state when postType or search term changes
  useEffect(() => {
    updateState({
      items: [],
      page: 1,
      errorOccurred: false,
      hasMoreData: true,
    });
  }, [postType, busqueda, updateState]);

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

  return { items: state.items, isLoading: state.isLoading };
};
