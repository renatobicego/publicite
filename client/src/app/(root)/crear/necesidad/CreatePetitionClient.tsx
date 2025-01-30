"use client";

import { useState } from "react";
import { AttachedFilesProvider } from "../anuncio/components/CreateForm/inputs/AccordionInputs/AttachedFIles/AttachedFilesContext";
import SelectPostBehaviourType from "../anuncio/components/SelectPostBehaviourType";
import CreatePetition from "./CreatePetition";
import { PostBehaviourType } from "@/types/postTypes";
import useUserPostLimit from "@/utils/hooks/useUserPostLimit";
import PostsLimitReached from "../anuncio/components/PostsLimitReached";

const CreatePetitionClient = ({ userId }: { userId?: string }) => {
  const [postBehaviourType, setPostBehaviourType] =
    useState<PostBehaviourType>();
  const { userCanPublishPost, limit, numberOfPosts } =
    useUserPostLimit(postBehaviourType);
  return (
    <AttachedFilesProvider>
      <SelectPostBehaviourType
        type={postBehaviourType}
        setType={setPostBehaviourType}
      />
      {postBehaviourType &&
        (userCanPublishPost ? (
          <CreatePetition
            userId={userId}
            postBehaviourType={postBehaviourType}
          />
        ) : (
          <PostsLimitReached
            limit={limit[postBehaviourType]}
            numberOfPosts={numberOfPosts[postBehaviourType]}
            postBehaviourType={postBehaviourType}
            setPostBehaviourTypeToPrevious={() =>
              setPostBehaviourType(undefined)
            }
          />
        ))}
    </AttachedFilesProvider>
  );
};

export default CreatePetitionClient;
