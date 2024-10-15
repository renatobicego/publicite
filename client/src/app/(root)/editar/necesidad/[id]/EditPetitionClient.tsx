"use client"
import { AttachedFilesProvider } from "@/app/(root)/crear/anuncio/components/CreateForm/inputs/AccordionInputs/AttachedFIles/AttachedFilesContext";
import EditPetitionForm from "./EditPetitionForm";
import { Petition } from "@/types/postTypes";

const EditPetitionClient = ({ postData }: { postData: Petition }) => {
  return (
    <AttachedFilesProvider>
      <EditPetitionForm postData={postData} />
    </AttachedFilesProvider>
  );
};

export default EditPetitionClient;
