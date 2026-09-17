"use client";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import LinkTool from "@editorjs/link";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useUploadThing } from "@/utils/uploadThing";
import { toastifyError } from "@/utils/functions/toastify";
import { deleteFilesService } from "@/app/server/uploadThing";

/**
 * Métodos imperativos que el componente padre puede invocar a través del `ref`.
 */
export interface BlockEditorHandle {
  /** Devuelve el contenido actual del editor en formato Editor.js (`OutputData`). */
  save: () => Promise<OutputData | undefined>;
  /** Limpia el contenido del editor. */
  clear: () => Promise<void>;
}

interface BlockEditorProps {
  /** Contenido inicial (edición). Si no viene, arranca vacío. */
  initialData?: OutputData;
  /** Enfocar el editor al montar. Default: true. */
  autofocus?: boolean;
  /**
   * Si es `true`, cuando se elimina un bloque de imagen se borra su archivo de
   * UploadThing automáticamente. Default: true.
   */
  cleanupRemovedImages?: boolean;
  /** Se dispara en cada cambio con el `OutputData` actual. */
  onChange?: (data: OutputData) => void;
}

const i18n = {
  messages: {
    ui: {
      blockTunes: {
        toggler: {
          "Click to tune": "Hacer clic para ajustar",
          "or drag to move": "o arrastra para mover",
        },
      },
      inlineToolbar: {
        converter: {
          "Convert to": "Convertir a",
        },
      },
      toolbar: {
        toolbox: {
          Add: "Agregar",
        },
      },
      popover: {
        Filter: "Buscar",
        "Nothing found": "Nada encontrado",
        "Convert to": "Convertir a",
      },
    },
    toolNames: {
      Text: "Texto",
      Heading: "Encabezado",
      List: "Lista",
      Warning: "Advertencia",
      Checklist: "Lista de verificaci\u00f3n",
      Quote: "Cita",
      Code: "C\u00f3digo",
      Delimiter: "Separador",
      "Raw HTML": "HTML puro",
      Table: "Tabla",
      Link: "Enlace",
      Marker: "Resaltador",
      Bold: "Negrita",
      Italic: "Cursiva",
      InlineCode: "C\u00f3digo en l\u00ednea",
      Image: "Imagen",
      "Unordered List": "Lista desordenada",
      "Ordered List": "Lista ordenada",
    },
    tools: {
      image: {
        Caption: "Pie de imagen",
        "Select an Image": "Seleccionar imagen",
        "With border": "Con borde",
        "Stretch image": "Expandir imagen",
        "With background": "Con fondo",
      },
      link: {
        "Add a link": "Agregar enlace",
      },
      stub: {
        "The block can not be displayed correctly.":
          "El bloque no se puede mostrar correctamente.",
      },
      list: {
        Ordered: "Ordenada",
        Unordered: "Desordenada",
        Checklist: "Lista de verificaci\u00f3n",
      },
      header: {
        "Heading 1": "Encabezado 1",
        "Heading 2": "Encabezado 2",
        "Heading 3": "Encabezado 3",
        "Heading 4": "Encabezado 4",
        "Heading 5": "Encabezado 5",
        "Heading 6": "Encabezado 6",
      },
    },
    blockTunes: {
      delete: {
        Delete: "Eliminar",
        "Click to delete": "Clic para eliminar",
      },
      moveUp: {
        "Move up": "Mover arriba",
      },
      moveDown: {
        "Move down": "Mover abajo",
      },
    },
  },
};

/**
 * Editor de bloques reutilizable basado en Editor.js.
 *
 * Encapsula la instancia de `EditorJS`, sus plugins (header, list, image, link),
 * la subida de imágenes a UploadThing y la internacionalización en español.
 * El contenido se obtiene de forma imperativa vía `ref` (`save()`), de modo que
 * el componente padre decide cuándo persistir. Es agnóstico de la entidad
 * (Novedades, artículos de Mis Producciones, etc.).
 */
const BlockEditor = forwardRef<BlockEditorHandle, BlockEditorProps>(
  (
    {
      initialData,
      autofocus = true,
      cleanupRemovedImages = true,
      onChange,
    },
    ref
  ) => {
    const ejInstance = useRef<EditorJS | null>(null);
    const previousImageKeys = useRef<Set<string>>(new Set());
    // Holder único por instancia (permite montar varios editores en la misma página).
    const reactId = useId();
    const holderId = useMemo(
      () => `block-editor-${reactId.replace(/[:]/g, "")}`,
      [reactId]
    );

    const { startUpload } = useUploadThing("fileUploader", {
      onUploadError: (e) => {
        toastifyError(`Error al subir la imagen: ${e.name}`);
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        save: async () => {
          if (!ejInstance.current) return undefined;
          return ejInstance.current.saver.save();
        },
        clear: async () => {
          ejInstance.current?.clear();
        },
      }),
      []
    );

    const initEditor = useCallback(() => {
      const editor = new EditorJS({
        holder: holderId,
        onReady: () => {
          ejInstance.current = editor;
          // Semilla de claves de imágenes ya presentes (edición).
          const seed = new Set<string>();
          initialData?.blocks?.forEach((block) => {
            if (block.type === "image" && block.data?.file?.key) {
              seed.add(block.data.file.key);
            }
          });
          previousImageKeys.current = seed;
        },
        autofocus,
        data: initialData,
        onChange: async () => {
          const content = await editor.saver.save();

          if (cleanupRemovedImages) {
            const currentKeys = new Set<string>();
            content.blocks.forEach((block) => {
              if (block.type === "image" && block.data?.file?.key) {
                currentKeys.add(block.data.file.key);
              }
            });
            // Borrar de UploadThing las imágenes que se sacaron del editor.
            previousImageKeys.current.forEach((key) => {
              if (!currentKeys.has(key)) {
                deleteFilesService([key]);
              }
            });
            previousImageKeys.current = currentKeys;
          }

          onChange?.(content);
        },
        i18n,
        tools: {
          header: Header,
          list: List,
          link: LinkTool,
          image: {
            class: Image,
            config: {
              uploader: {
                uploadByFile: async (file: File) => {
                  const res = await startUpload([file]);
                  return {
                    success: 1,
                    file: {
                      url: res?.[0].url,
                      key: res?.[0].key,
                    },
                  };
                },
              },
            },
          },
        },
        inlineToolbar: ["bold", "italic", "link"],
      });
    }, [
      holderId,
      autofocus,
      initialData,
      cleanupRemovedImages,
      onChange,
      startUpload,
    ]);

    useEffect(() => {
      if (ejInstance.current === null) {
        initEditor();
      }
      return () => {
        ejInstance.current?.destroy?.();
        ejInstance.current = null;
      };
      // Sólo montamos una vez; los callbacks se leen por closure estable.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div className="w-full" id={holderId} />;
  }
);

BlockEditor.displayName = "BlockEditor";

export default BlockEditor;
