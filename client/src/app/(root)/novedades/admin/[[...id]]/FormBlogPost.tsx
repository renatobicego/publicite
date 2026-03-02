"use client";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Link from "@editorjs/link";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useUploadThing } from "@/utils/uploadThing";
import { toastifyError } from "@/utils/functions/toastify";
import { deleteFilesService } from "@/app/server/uploadThing";
const FormBlogPost = () => {
  const ejInstance = useRef<EditorJS | null>();
  const DEFAULT_INITIAL_DATA = useMemo(
    () => ({
      time: new Date().getTime(),
      blocks: [
        {
          type: "header",
          data: {
            text: "This is my awesome editor!",
            level: 1,
          },
        },
      ],
    }),
    []
  );

  const { startUpload } = useUploadThing("fileUploader", {
    onUploadError: (e) => {
      toastifyError(`Error al subir el archivo/imagen: ${e.name}`);
    },
  });
  const previousImageKeys = useRef<Set<string>>(new Set());
  const initEditor = useCallback(() => {
    const editor = new EditorJS({
      holder: "editorjs",
      onReady: () => {
        ejInstance.current = editor;
      },
      autofocus: true,
      data: DEFAULT_INITIAL_DATA,
      onChange: async () => {
        let content = await editor.saver.save();

        console.log(content);

        const currentKeys = new Set<string>();

        content.blocks.forEach((block) => {
          if (block.type === "image") {
            if (block.data?.file?.key) {
              currentKeys.add(block.data.file.key);
            }
          }
        });

        // Detectar cuáles fueron eliminadas
        previousImageKeys.current.forEach((key) => {
          if (!currentKeys.has(key)) {
            deleteFilesService([key]);
          }
        });

        previousImageKeys.current = currentKeys;
      },
      i18n: {
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
      },
      tools: {
        header: Header,
        list: List,
        image: {
          class: Image,
          config: {
            uploader: {
              uploadByFile: async (file: File) => {
                const res = await startUpload([file]);
                const uploadedFileUrls = res?.[0].url;
                return {
                  success: 1,
                  file: {
                    url: uploadedFileUrls,
                    key: res?.[0].key,
                  },
                };
              },
            },
          },
        },
        link: Link,
      },
    });
  }, [DEFAULT_INITIAL_DATA, startUpload]);

  useEffect(() => {
    if (ejInstance.current === null) {
      initEditor();
    }

    return () => {
      ejInstance?.current?.destroy();
      ejInstance.current = null;
    };
  }, [initEditor]);
  return (
    <>
      <div className="w-full" id="editorjs"></div>
    </>
  );
};

export default FormBlogPost;
