"use client";
import { useState } from "react";
import SelectType from "../SelectType";
import UploadImages from "../Upload/UploadImages";
import { Divider, Link } from "@nextui-org/react";
import CreateGood from "../CreateGood/CreateGood";
import CreateService from "../CreateService/CreateService";
import useUserPostLimit from "@/utils/hooks/useUserPostLimit";
import { AttachedFilesProvider } from "./inputs/AccordionInputs/AttachedFIles/AttachedFilesContext";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { PACKS, SUBSCRIPTIONS } from "@/utils/data/urls";
import SecondaryButton from "@/components/buttons/SecondaryButton";

const CreateForm = () => {
  const [type, setType] = useState<"good" | "service">();
  const [files, setFiles] = useState<File[]>([]);
  const { userCanPublishPost, limit, numberOfPosts } = useUserPostLimit();
  return (
    <section className="w-full flex gap-4 items-start max-md:flex-col relative">
      <UploadImages
        files={files}
        setFiles={setFiles}
        type={type}
        customClassname="max-md:mb-4"
      />
      <AttachedFilesProvider>
        <div className="flex flex-col flex-1 gap-4 max-md:w-full">
          <SelectType type={type} setType={setType} />
          <Divider />
          {!type && (
            <p className="text-red-500 text-center max-lg:text-sm">
              Por favor, seleccione si es un bien o un servicio.
            </p>
          )}
          {type === "good" ? (
            <CreateGood files={files} userCanPublishPost={userCanPublishPost}/>
          ) : (
            type === "service" && <CreateService files={files} userCanPublishPost={userCanPublishPost}/>
          )}
        </div>
      </AttachedFilesProvider>
      {!userCanPublishPost && (
        <div
          className="w-full flex flex-col items-center h-[110%] 
              backdrop-blur-md absolute mx-auto z-50
              box-shadow-[0px_4px_30px_rgba(0,0,0,0.1)] 
              rounded-lg -top-8
              border border-transparent gap-4
            "
        >
          <h5 className="mt-28">
            ¡Ups! Has alcanzado el límite de publicacciones activas.
          </h5>
          <h6>
            {numberOfPosts} / {limit} publicaciones activas
          </h6>
          <p className="lg:max-w-[60%] 2xl:max-w-[50%] 3xl:max-w-[30%] text-center">
            Para crear un nuevo anuncio, puedes cambiar de tipo de suscripción o
            comprar packs de publicaciones.
          </p>
          <div className="flex gap-2 items-center">
            <PrimaryButton as={Link} href={SUBSCRIPTIONS}>
              Cambiar Plan de Suscripción
            </PrimaryButton>
            <SecondaryButton as={Link} href={PACKS}>
              Comprar Packs
            </SecondaryButton>
          </div>
          <p className="text-xs">
            También puedes modificar tus publicaciones activas en tu perfil.
          </p>
        </div>
      )}
    </section>
  );
};

export default CreateForm;
