"use client";

import { AttachedFilesProvider } from "../anuncio/components/CreateForm/inputs/AccordionInputs/AttachedFIles/AttachedFilesContext";
import CreatePetition from "./CreatePetition";

const CreatePetitionClient = ({ userId } : { userId?: string}) => {
  return (
    <AttachedFilesProvider>
      <CreatePetition userId={userId}/>
    </AttachedFilesProvider>
  );
};

export default CreatePetitionClient;
