import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { AttachedFileValues, PostAttachedFile } from "@/types/postTypes";

interface AttachedFilesContextProps {
  attachedFiles: AttachedFileValues[];
  prevAttachedFiles: PostAttachedFile[];
  prevAttachedFilesDeleted: PostAttachedFile[];
  addFile: (maxFiles: number, isEditing?: boolean) => void;
  handleFileChange: (file: File | null, _id: string) => void;
  error: string | null;
  setPrevAttachedFiles: Dispatch<SetStateAction<PostAttachedFile[]>>;
  addBackDeletedAttachedFile: (_id: string) => void;
  removeFile: (_id: string, isPrev?: boolean) => void;
  handleLabelChange: (label: string, _id: string, isPrev?: boolean) => void;
}

const AttachedFilesContext = createContext<AttachedFilesContextProps | null>(
  null
);

export const useAttachedFiles = () => {
  const context = useContext(AttachedFilesContext);
  if (!context) {
    throw new Error(
      "useAttachedFiles must be used within a AttachedFilesProvider"
    );
  }
  return context;
};

export const AttachedFilesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileValues[]>([]);
  const [prevAttachedFiles, setPrevAttachedFiles] = useState<
    PostAttachedFile[]
  >([]);
  const [prevAttachedFilesDeleted, setPrevAttachedFilesDeleted] = useState<
    PostAttachedFile[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  const addFile = (maxFiles: number, isEditing?: boolean) => {
    if (
      isEditing &&
      attachedFiles.length + prevAttachedFiles.length >= maxFiles
    ) {
      setError("No se pueden agregar más archivos.");
      return;
    }
    if (attachedFiles.length < maxFiles) {
      setAttachedFiles((prev) => [
        ...prev,
        {
          file: null,
          label: "",
          _id: Math.random().toString(),
        },
      ]);
      setError(null);
    } else {
      setError("No se pueden agregar más archivos.");
    }
  };

  const handleFileChange = (file: File | null, _id: string) => {
    if (file) {
      // Validation: Check if the file is a PDF and its size is below 10MB
      if (file.type !== "application/pdf") {
        setError("Solo se permiten archivos PDF.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("El archivo no debe exceder los 10MB.");
        return;
      }

      // Clear the error if valid
      setError(null);

      // Update the attached file
      setAttachedFiles((prev) =>
        prev.map((f) => (f._id === _id ? { ...f, file } : f))
      );
    }
  };

  const addBackDeletedAttachedFile = (_id: string) => {
    setPrevAttachedFilesDeleted((prevDeletedFiles) => {
      // Find the file in the deleted files array
      const fileToAddBack = prevDeletedFiles.find((file) => file._id === _id);

      if (fileToAddBack) {
        // First, check if the file is already present in prevAttachedFiles to avoid duplicates
        setPrevAttachedFiles((prevAttached) => {
          const alreadyInPrev = prevAttached.find((file) => file._id === _id);
          if (!alreadyInPrev) {
            return [...prevAttached, fileToAddBack];
          }
          return prevAttached;
        });

        // Remove the file from prevAttachedFilesDeleted
        return prevDeletedFiles.filter((file) => file._id !== _id);
      }

      return prevDeletedFiles; // No changes if the file is not found
    });
  };

  const removeFile = (_id: string, isPrev?: boolean) => {
    if (isPrev) {
      // Filter out the file from prevAttachedFiles
      setPrevAttachedFiles((prev) => {
        const fileToRemove = prev.find((f) => f._id === _id);
        if (fileToRemove) {
          setPrevAttachedFilesDeleted((deletedPrevFiles) => {
            const alreadyDeleted = deletedPrevFiles.find((f) => f._id === _id);
            // Add the file only if it hasn't already been added
            if (!alreadyDeleted) {
              return [...deletedPrevFiles, fileToRemove];
            }
            return deletedPrevFiles;
          });
        }
        // Remove the file from prevAttachedFiles
        return prev.filter((f) => f._id !== _id);
      });
    } else {
      // For new files, filter them out from attachedFiles
      if (error === "No se pueden agregar más archivos.") {
        setError(null);
      }
      setAttachedFiles((prev) => prev.filter((file) => file._id !== _id));
    }
  };

  const handleLabelChange = (label: string, _id: string, isPrev?: boolean) => {
    if (isPrev) {
      setPrevAttachedFiles((prev) =>
        prev.map((f: PostAttachedFile) => (f._id === _id ? { ...f, label } : f))
      );
    } else {
      setAttachedFiles((prev: AttachedFileValues[]) =>
        prev.map((f) => (f._id === _id ? { ...f, label } : f))
      );
    }
  };

  return (
    <AttachedFilesContext.Provider
      value={{
        attachedFiles,
        prevAttachedFiles,
        prevAttachedFilesDeleted,
        error,
        addFile,
        handleFileChange,
        setPrevAttachedFiles,
        addBackDeletedAttachedFile,
        removeFile,
        handleLabelChange,
      }}
    >
      {children}
    </AttachedFilesContext.Provider>
  );
};
