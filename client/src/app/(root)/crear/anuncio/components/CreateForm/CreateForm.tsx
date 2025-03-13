"use client";
import { useState } from "react";
import SelectType from "../SelectType";
import UploadImages from "../Upload/UploadImages";
import { Divider } from "@nextui-org/react";
import CreateGood from "../CreateGood/CreateGood";
import CreateService from "../CreateService/CreateService";
import useUserPostLimit from "@/utils/hooks/useUserPostLimit";
import { AttachedFilesProvider } from "./inputs/AccordionInputs/AttachedFIles/AttachedFilesContext";
import { PostBehaviourType } from "@/types/postTypes";
import SelectPostBehaviourType from "../SelectPostBehaviourType";
import PostsLimitReached from "../PostsLimitReached";

const CreateForm = ({ userId }: { userId?: string }) => {
  const [type, setType] = useState<"good" | "service">();
  const [files, setFiles] = useState<File[]>([]);
  const [postBehaviourType, setPostBehaviourType] =
    useState<PostBehaviourType>();
  const { userCanPublishPost, limit, numberOfPosts } =
    useUserPostLimit(postBehaviourType);
  return (
    <section
      id="create-post"
      className="w-full flex gap-4 items-start max-md:flex-col relative"
    >
      <UploadImages
        files={files}
        setFiles={setFiles}
        type={type}
        customClassname="max-md:mb-4"
      />
      <AttachedFilesProvider>
        <section
          id="create-post-form"
          className="flex flex-col flex-1 gap-4 max-md:w-full"
        >
          <SelectPostBehaviourType
            type={postBehaviourType}
            setType={setPostBehaviourType}
          />
          <Divider />

          {!postBehaviourType && (
            <p className="text-red-500 text-center max-lg:text-sm">
              Por favor, seleccione si el comportamiento del anuncio es libre o
              agenda.
            </p>
          )}
          {postBehaviourType && userCanPublishPost && (
            <>
              <SelectType type={type} setType={setType} />
              <Divider />
              {!type && (
                <p className="text-red-500 text-center max-lg:text-sm">
                  Por favor, seleccione si es un bien o un servicio.
                </p>
              )}
              {type === "good" ? (
                <CreateGood
                  files={files}
                  userCanPublishPost={userCanPublishPost}
                  userId={userId}
                  postBehaviourType={postBehaviourType}
                />
              ) : (
                type === "service" && (
                  <CreateService
                    files={files}
                    userCanPublishPost={userCanPublishPost}
                    userId={userId}
                    postBehaviourType={postBehaviourType}
                  />
                )
              )}
            </>
          )}
        </section>
      </AttachedFilesProvider>
      {!userCanPublishPost && postBehaviourType && (
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
