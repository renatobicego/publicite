import { Loader } from "@googlemaps/js-api-loader";
import { useCallback, useEffect, useRef, useState } from "react";

// Mismas opciones que los <Wrapper> de @googlemaps/react-wrapper: el Loader es
// un singleton y tira error si se lo crea con opciones distintas.
const getMapsLoader = () =>
  new Loader({
    apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
    libraries: ["places"],
  });

/** Espera a que la librería `places` esté lista (un solo script para toda la app). */
export const loadPlacesLibrary = () => getMapsLoader().importLibrary("places");

const DEBOUNCE_MS = 300;

/**
 * Sugerencias de Google Places. Reemplaza a `react-google-autocomplete`, que
 * creaba `AutocompleteService` apenas existía `window.google`, antes de que
 * cargara `places` (TypeError: reading 'AutocompleteService').
 */
const usePlacePredictions = (
  options: Omit<google.maps.places.AutocompletionRequest, "input"> = {}
) => {
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(
    null
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [placePredictions, setPlacePredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [isPlacePredictionsLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadPlacesLibrary()
      .then(({ AutocompleteService }) => {
        if (cancelled) return;
        serviceRef.current = new AutocompleteService();
        setIsLoaded(true);
      })
      .catch((error) => console.error("No se pudo cargar Google Places", error));
    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getPlacePredictions = useCallback(({ input }: { input: string }) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const requestId = ++requestIdRef.current;

    if (!input) {
      setPlacePredictions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    timeoutRef.current = setTimeout(() => {
      const service = serviceRef.current;
      if (!service) {
        setIsLoading(false);
        return;
      }
      service.getPlacePredictions(
        { ...optionsRef.current, input },
        (results) => {
          // Ignora respuestas viejas si el usuario siguió escribiendo.
          if (requestId !== requestIdRef.current) return;
          setPlacePredictions(results ?? []);
          setIsLoading(false);
        }
      );
    }, DEBOUNCE_MS);
  }, []);

  return {
    isLoaded,
    placePredictions,
    getPlacePredictions,
    isPlacePredictionsLoading,
  };
};

export default usePlacePredictions;
