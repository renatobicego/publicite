"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/** Acción que una pantalla le ofrece al súper botón Crear. */
export interface CreateAction {
  key: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  onAction: () => void;
}

export interface CreateActionsGroup {
  /** Título del grupo, ej. "Crear en «Mi blog»". */
  title: string;
  actions: CreateAction[];
}

interface CreateActionsContextValue {
  group: CreateActionsGroup | null;
  setGroup: (group: CreateActionsGroup | null) => void;
}

const CreateActionsContext = createContext<CreateActionsContextValue>({
  group: null,
  setGroup: () => {},
});

/**
 * Permite que la pantalla abierta (por ahora, el blog de Mis Producciones)
 * sume sus propias opciones arriba de todo en el súper botón Crear.
 */
export const CreateActionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [group, setGroup] = useState<CreateActionsGroup | null>(null);
  const value = useMemo(() => ({ group, setGroup }), [group]);
  return (
    <CreateActionsContext.Provider value={value}>
      {children}
    </CreateActionsContext.Provider>
  );
};

export const useCreateActions = () => useContext(CreateActionsContext).group;

/**
 * Registra las acciones mientras la pantalla está montada. `group` puede
 * cambiar en cada render (ej. al cambiar de carpeta): cada acción ejecuta
 * siempre su versión más nueva.
 */
export const useRegisterCreateActions = (group: CreateActionsGroup | null) => {
  const { setGroup } = useContext(CreateActionsContext);
  const latest = useRef(group);
  useEffect(() => {
    latest.current = group;
  });

  // Las acciones cambian de identidad en cada render: se comparan por lo que
  // se ve (título y claves) para no volver a registrarlas en bucle.
  const signature = group
    ? `${group.title}|${group.actions.map((action) => action.key).join(",")}`
    : "";

  useEffect(() => {
    if (!group) {
      setGroup(null);
      return;
    }
    setGroup({
      title: group.title,
      actions: group.actions.map((action) => ({
        ...action,
        onAction: () =>
          latest.current?.actions
            .find((current) => current.key === action.key)
            ?.onAction(),
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, setGroup]);

  useEffect(() => () => setGroup(null), [setGroup]);
};
