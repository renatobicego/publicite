"use client";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Image from "@editorjs/image";
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
import { AudioBlockTool } from "./tools/AudioBlockTool";
import { VideoBlockTool } from "./tools/VideoBlockTool";

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
      Audio: "Audio",
      Video: "Video",
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
 * Encapsula la instancia de `EditorJS`, sus plugins (header, list, image),
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
    const ejInstance = useRef<EditorJS | null | undefined>();
    // Claves de UploadThing de bloques con archivo (imagen, audio, video),
    // para poder borrar del storage lo que se sacó del editor.
    const previousMediaKeys = useRef<Set<string>>(new Set());
    // El editor se monta una sola vez, así que el `onChange` del padre se lee
    // desde un ref para no quedar congelado en el closure del primer render.
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    // Holder único por instancia (permite montar varios editores en la misma página).
    const reactId = useId();
    const holderId = useMemo(
      () => `block-editor-${reactId.replace(/[:]/g, "")}`,
      [reactId]
    );

    const { startUpload } = useUploadThing("fileUploader", {
      onUploadError: (e) => {
        toastifyError(`Error al subir el archivo: ${e.name}`);
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
          // Registro de la instancia (igual que Novedades).
          ejInstance.current = editor;
          // Semilla de claves de archivos ya presentes (edición): imagen,
          // audio y video comparten la forma `data.file.key`.
          const seed = new Set<string>();
          initialData?.blocks?.forEach((block) => {
            if (
              ["image", "audio", "video"].includes(block.type) &&
              block.data?.file?.key
            ) {
              seed.add(block.data.file.key);
            }
          });
          previousMediaKeys.current = seed;
        },
        autofocus,
        data: initialData,
        onChange: async () => {
          const content = await editor.saver.save();

          if (cleanupRemovedImages) {
            const currentKeys = new Set<string>();
            content?.blocks?.forEach((block) => {
              if (
                ["image", "audio", "video"].includes(block.type) &&
                block.data?.file?.key
              ) {
                currentKeys.add(block.data.file.key);
              }
            });
            // Borrar de UploadThing los archivos que se sacaron del editor.
            // Los keys de video llevan el sufijo "video" (convención del
            // proyecto); hay que quitarlo para que UploadThing reconozca el
            // key real.
            previousMediaKeys.current.forEach((key) => {
              if (!currentKeys.has(key)) {
                const realKey = key.endsWith("video")
                  ? key.replace("video", "")
                  : key;
                deleteFilesService([realKey]);
              }
            });
            previousMediaKeys.current = currentKeys;
          }

          onChangeRef.current?.(content);
        },
        i18n,
        tools: {
          header: Header,
          list: List,
          // No registramos el tool de bloque de enlaces (`@editorjs/link`):
          // requiere un `endpoint` de backend para traer metadata y no existe
          // en la app. Los hipervínculos se hacen con el inline tool interno
          // `link` (ver `inlineToolbar`), que viene con EditorJS.
          //
          // OJO si algún día se vuelve a agregar: el nombre debe ser
          // `linkTool`, NUNCA `link`. EditorJS mergea la config del usuario
          // encima de sus tools internos (`{...internalTools, ...config.tools}`)
          // y `link` es el nombre del inline tool interno. Registrar un tool de
          // bloque como `link` lo sobreescribe y rompe la resolución de tools:
          // el editor monta y dispara `onChange`, pero `saver.save()` resuelve
          // `undefined` siempre.
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
          audio: {
            class: AudioBlockTool,
            config: {
              uploader: async (file: File) => {
                const res = await startUpload([file]);
                if (!res?.[0]) return undefined;
                return { url: res[0].url, key: res[0].key };
              },
              onUploadError: (message: string) => toastifyError(message),
            },
          },
          video: {
            class: VideoBlockTool,
            config: {
              // Mismo convención que Anuncios/Producciones: se concatena el
              // literal "video" al final del key para poder distinguirlo al
              // resolver la URL (`resolveProductionFileUrl(key, true)`).
              uploader: async (file: File) => {
                const res = await startUpload([file]);
                if (!res?.[0]) return undefined;
                return { url: res[0].url, key: `${res[0].key}video` };
              },
              onUploadError: (message: string) => toastifyError(message),
            },
          },
        },
        inlineToolbar: ["bold", "italic", "link"],
      });
      return editor;
    }, [
      holderId,
      autofocus,
      initialData,
      cleanupRemovedImages,
      startUpload,
    ]);

    useEffect(() => {
      // Mismo mecanismo que `FormBlogPost` (Novedades), que funciona:
      // el ref arranca en `undefined` y el cleanup lo deja en `null`.
      // En StrictMode (dev) React hace montar → limpiar → montar en el mismo
      // tick: el primer montaje crea el editor, el cleanup pasa el ref a
      // `null`, y en el segundo montaje el guard `=== undefined` ya no se
      // cumple, así que NO se crea una segunda instancia. Queda un único
      // editor, y su `onChange` es el que está realmente cableado al DOM.
      if (ejInstance.current === undefined) {
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
