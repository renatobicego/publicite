"use client";
import { useState } from "react";
import SelectType, { CreatePostKind } from "../SelectType";
import { useAdAgentProfile } from "@/utils/hooks/useAdAgentProfile";
import UploadImages from "../Upload/UploadImages";
import { Divider } from "@nextui-org/react";
import CreateGood from "../CreateGood/CreateGood";
import CreateService from "../CreateService/CreateService";
import useUserPostLimit from "@/utils/hooks/useUserPostLimit";
import { AttachedFilesProvider } from "./inputs/AccordionInputs/AttachedFIles/AttachedFilesContext";
import { PostBehaviourType } from "@/types/postTypes";
import SelectPostBehaviourType from "../SelectPostBehaviourType";
import PostsLimitReached from "../PostsLimitReached";

const CreateForm = ({ userId, prefill }: { userId?: string; prefill?: { title?: string; description?: string; price?: number; fromValuacion?: string; imageUrls?: string[]; type?: "good" | "service" } }) => {
  const [type, setType] = useState<CreatePostKind | undefined>(prefill?.type || (prefill ? "good" : undefined));
  const [files, setFiles] = useState<File[]>([]);
  const [postBehaviourType, setPostBehaviourType] =
    useState<PostBehaviourType | undefined>(prefill ? "libre" : undefined);
  const { userCanPublishPost, limit, numberOfPosts, loading } =
    useUserPostLimit(postBehaviourType);
  // Cuenta Empresa / Agente: puede publicar espacios publicitarios, que son
  // siempre geolocalizados (usan el cupo de anuncios geolocalizados).
  const { isAdAgent } = useAdAgentProfile(userId);
  const selectType = (next: CreatePostKind) => {
    setType(next);
    if (next === "adspace") setPostBehaviourType("libre");
  };

  const prefillImageUrls = prefill?.imageUrls || [];
  return (
    <section
      id="create-post"
      className="w-full flex gap-4 items-start max-md:flex-col relative"
    >
      <UploadImages
        files={files}
        setFiles={setFiles}
        type={type === "adspace" ? "service" : type}
        customClassname="max-md:hidden"
        prefillImageUrls={prefillImageUrls}
      />
      <AttachedFilesProvider>
        <section
          id="create-post-form"
          className="flex flex-col flex-1 gap-4 max-md:w-full"
        >
          <SelectPostBehaviourType
            type={postBehaviourType}
            setType={setPostBehaviourType}
            agendaDisabledReason={
              type === "adspace"
                ? "Los espacios publicitarios son siempre geolocalizados."
                : undefined
            }
          />
          <Divider />

          {!postBehaviourType && (
            <p className="text-red-500 text-center max-lg:text-sm">
              Por favor, elegí si el anuncio es geolocalizado o de agenda.
            </p>
          )}
          {postBehaviourType && userCanPublishPost && (
            <>
              <SelectType
                type={type}
                setType={selectType}
                canPublishAdSpace={isAdAgent}
              />
              <Divider />
              {!type && (
                <p className="text-red-500 text-center max-lg:text-sm">
                  {isAdAgent
                    ? "Por favor, seleccione si es un bien, un servicio o un espacio publicitario."
                    : "Por favor, seleccione si es un bien o un servicio."}
                </p>
              )}
              {type && (
                <UploadImages
                  files={files}
                  setFiles={setFiles}
                  type={type === "adspace" ? "service" : type}
                  customClassname="md:hidden"
                  prefillImageUrls={prefillImageUrls}
                />
              )}
              {type === "good" ? (
                <CreateGood
                  files={files}
                  userCanPublishPost={userCanPublishPost}
                  userId={userId}
                  postBehaviourType={postBehaviourType}
                  prefill={prefill}
                  prefillImageUrls={prefillImageUrls}
                />
              ) : (
                (type === "service" || type === "adspace") && (
                  <CreateService
                    key={type}
                    files={files}
                    userCanPublishPost={userCanPublishPost}
                    userId={userId}
                    postBehaviourType={postBehaviourType}
                    isAdSpace={type === "adspace"}
                  />
                )
              )}
            </>
          )}
        </section>
      </AttachedFilesProvider>
      {!userCanPublishPost && postBehaviourType && !loading && (
        <PostsLimitReached
          limit={limit[postBehaviourType]}
          numberOfPosts={numberOfPosts[postBehaviourType]}
          postBehaviourType={postBehaviourType}
          setPostBehaviourTypeToPrevious={() => setPostBehaviourType(undefined)}
        />
      )}
    </section>
  );
};

export default CreateForm;
