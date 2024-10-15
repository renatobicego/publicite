"use client";

import { AttachedFilesProvider } from "../anuncio/components/CreateForm/inputs/AccordionInputs/AttachedFIles/AttachedFilesContext";
import CreatePetition from "./CreatePetition";

const CreatePetitionClient = () => {
  return (
    <AttachedFilesProvider>
      <CreatePetition />
    </AttachedFilesProvider>
  );
};

export default CreatePetitionClient;
