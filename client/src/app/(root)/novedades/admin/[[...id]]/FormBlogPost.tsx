"use client";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUploadThing } from "@/utils/uploadThing";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { deleteFilesService } from "@/app/server/uploadThing";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import {
  createNovelty,
  updateNovelty,
  deleteNovelty,
  formatNoveltyBlocks,
  NoveltyProperty,
} from "@/services/noveltyService";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";

const FormBlogPost = ({
  defaultData,
  noveltyId,
  properties,
}: {
  defaultData?: OutputData;
  noveltyId?: string;
  properties?: NoveltyProperty[] | undefined;
}) => {
  const ejInstance = useRef<EditorJS | undefined | null>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [initialized, setInitialized] = useState(false);
  const DEFAULT_INITIAL_DATA = useMemo(
    () => ({
      time: new Date().getTime(),
      blocks: [
        {
          type: "header",
          data: {
            text: "Este es un título de ejemplo!",
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

  const handleSubmit = async () => {
    if (!ejInstance.current) return;

    setIsSubmitting(true);
    try {
      const content = await ejInstance.current.saver.save();

      // Validate that blocks exist
      if (!content.blocks || content.blocks.length === 0) {
        toastifyError("Debes agregar contenido a la novedad");
        setIsSubmitting(false);
        return;
      }

      const formattedBlocks = await formatNoveltyBlocks(content);

      if (noveltyId) {
        // Update existing novelty
        const res = await updateNovelty({
          _id: noveltyId,
          blocks: formattedBlocks,
          properties,
        });
        if (typeof res !== "string" && "error" in res) {
          toastifyError("Error al crear la novedad " + res.error);
          return;
        }
        toastifySuccess("Novedad actualizada exitosamente");
      } else {
        // Create new novelty
        const res = await createNovelty({
          blocks: formattedBlocks,
        });
        if ("error" in res) {
          toastifyError("Error al crear la novedad " + res.error);
          return;
        }
        toastifySuccess("Novedad creada exitosamente");
      }

      router.push("/novedades");
      router.refresh();
    } catch (error: any) {
      toastifyError(
        error?.message || "Error al guardar la novedad. Intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!noveltyId) return;

    setIsSubmitting(true);
    try {
      await deleteNovelty(noveltyId);
      toastifySuccess("Novedad eliminada exitosamente");
      router.push("/novedades");
      router.refresh();
    } catch (error: any) {
      toastifyError(
        error?.message || "Error al eliminar la novedad. Intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const initEditor = useCallback(() => {
    const editor = new EditorJS({
      holder: "editorjs",
      onReady: () => {
        ejInstance.current = editor;
      },
      autofocus: true,
      data: defaultData ?? DEFAULT_INITIAL_DATA,
      onChange: async () => {
        let content = await editor.saver.save();

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
      },
      inlineToolbar: ["bold", "italic", "link"],
    });
  }, [DEFAULT_INITIAL_DATA, defaultData, startUpload]);

  useEffect(() => {
    if (ejInstance.current === undefined) {
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
      <menu className="flex gap-4">
        <PrimaryButton onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando..."
            : defaultData
            ? "Actualizar publicación"
            : "Crear publicación"}
        </PrimaryButton>
        {defaultData && (
          <PrimaryButton
            variant="light"
            onClick={onOpen}
            disabled={isSubmitting}
          >
            Eliminar publicación
          </PrimaryButton>
        )}
      </menu>

      {/* Delete confirmation modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirmar eliminación
              </ModalHeader>
              <ModalBody>
                <p>
                  ¿Estás seguro de que deseas eliminar esta novedad? Esta acción
                  no se puede deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="danger"
                  onPress={() => {
                    handleDelete();
                    onClose();
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Eliminando..." : "Eliminar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default FormBlogPost;
