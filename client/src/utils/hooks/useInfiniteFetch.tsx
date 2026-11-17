import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ContactPostsVisibility,
  fetchDataByType,
  PubliciteDataTypes,
} from "../data/fetchDataByType";
import { toastifyError, toastifyWarn } from "../functions/toastify";
import { useInfiniteScroll } from "./useInfiniteScroll";
import {
  isLocationAwarePostType,
  useLocation,
} from "@/app/(root)/providers/LocationProvider";
import { INITIAL_LOCATION } from "@/components/modals/SelectManualLocation/ManualLocationPicker";

interface FetchState {
  isLoading: boolean; // loading state
  hasMoreData: boolean; // more data to load available for infinite scroll
  page: number; // current page of the infinite scroll (we use pagination under the hood)
  items: any[]; // array of items to display
  errorOccurred: boolean;
}
export const useInfiniteFetch = (
  postType: PubliciteDataTypes,
  visibility?: ContactPostsVisibility
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

  /*
  Un pedido a la vez por lista. Sin esto el efecto de abajo volvía a llamar a
  loadMore mientras se esperaba la ubicación (isLoading todavía estaba en false),
  y en desarrollo React corre los efectos dos veces. `generationRef` cambia con
  cada reseteo: si la búsqueda, la ubicación o la visibilidad cambian mientras
  hay un pedido en camino, su respuesta se descarta.
  */
  const inFlightRef = useRef(false);
  const generationRef = useRef(0);

  // Function to load more data
  const loadMore = useCallback(async () => {
    // if isLoading, hasMoreData is false or errorOccurred, return
    if (state.isLoading || !state.hasMoreData || state.errorOccurred) return;
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const generation = generationRef.current;
    try {
      // if postType is location aware and coordinates is null, request the permission
      if (
        isLocationAwarePostType(postType) &&
        (!coordinates || coordinates.latitude === INITIAL_LOCATION.lat) &&
        !manualLocation
      ) {
        try {
          // Con permiso, la ubicación llega al provider y el reseteo de abajo
          // vuelve a llamar a loadMore con ella: pedir ahora con la misma
          // ubicación era pedir dos veces. Sin permiso se sigue con la inicial.
          if (await requestLocationPermission(postType)) return;
        } catch {
          toastifyWarn(
            "Por favor, autoriza el acceso la localización en tu dispositivo o selecciona la ubicación manualmente.",
            "warn-location"
          );
          return;
        }
      }
      if (isLocationAwarePostType(postType) && !coordinates) {
        return;
      }
      // set isLoading to true
      updateState({ isLoading: true });
      try {
        // get data
        const data: any = await fetchDataByType(
          visibility
            ? ({ ...postType, visibility } as PubliciteDataTypes)
            : postType,
          busqueda,
          state.page,
          coordinates
        );
        // Cambió la búsqueda, la ubicación o la visibilidad: es de otra lista.
        if (generation !== generationRef.current) return;
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
        if (generation === generationRef.current) {
          toastifyError(error as string);
          updateState({ errorOccurred: true });
        }
      } finally {
        updateState({ isLoading: false });
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [
    state.isLoading,
    state.hasMoreData,
    state.errorOccurred,
    state.page,
    state.items,
    coordinates,
    postType,
    manualLocation,
    updateState,
    requestLocationPermission,
    visibility,
    busqueda,
  ]);

  // Trigger to reset state when postType or search term changes
  // Sólo si cambió de verdad (por valor): el doble efecto de desarrollo o una
  // ubicación igual a la anterior no vacían la lista ni descartan el pedido en curso.
  const paramsKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const key = JSON.stringify([
      busqueda,
      coordinates?.latitude ?? null,
      coordinates?.longitude ?? null,
      visibility ?? null,
    ]);
    if (paramsKeyRef.current === key) return;
    paramsKeyRef.current = key;
    generationRef.current += 1;
    updateState({
      items: [],
      page: 1,
      errorOccurred: false,
      hasMoreData: true,
    });
  }, [busqueda, updateState, coordinates, visibility]);

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
