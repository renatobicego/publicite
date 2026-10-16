import { RefObject, useEffect, useState } from "react";

/** Alto en px de un elemento, actualizado cuando cambia de tamaño. */
const useElementHeight = (ref: RefObject<HTMLElement | null>) => {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setHeight(element.getBoundingClientRect().height)
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return height;
};

export default useElementHeight;
