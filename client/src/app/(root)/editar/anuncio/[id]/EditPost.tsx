"use client";
import { AttachedFilesProvider } from "@/app/(root)/crear/anuncio/components/CreateForm/inputs/AccordionInputs/AttachedFIles/AttachedFilesContext";
import EditPostForm from "./EditPostForm";
import { AdSpacePost, Good, Service } from "@/types/postTypes";

const EditPost = ({ postData }: { postData: Good | Service | AdSpacePost }) => {
  return (
    <AttachedFilesProvider>
      <EditPostForm postData={postData} />
    </AttachedFilesProvider>
  );
};

export default EditPost;
