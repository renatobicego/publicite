"use client";
import { Post } from "@/types/postTypes";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
  useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";
import PostCard from "../cards/PostCard/PostCard";
import { getPosts } from "@/services/postsServices";
import { toastifyError } from "@/utils/functions/toastify";

const MatchPetitionPost = ({
  postTitle,
  petitionType,
}: {
  postTitle: string;
  petitionType: "good" | "service";
}) => {
  const { isOpen, onOpenChange } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [postMatched, setPostMatched] = useState<Post>();

  const findMatch = async () => {
    try {
      setLoading(true);
      const { items } = await getPosts(postTitle, 1, petitionType, null, 1);
      console.log(items);
      setPostMatched(items[0]);
    } catch (error) {
      toastifyError("Error al encontrar coincidencias");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Button
        radius="full"
        onPress={() => {
          findMatch();
          onOpenChange();
        }}
        className={`px-4 py-[10px] hover:bg-text-color/75 hover:!opacity-100
         max-md:text-xs text-sm font-medium bg-petition self-start text-white`}
      >
        Generar Coincidencia
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Coincidencia encontrada para {postTitle}
              </ModalHeader>
              <ModalBody className="pb-4">
                {loading ? (
                  <Spinner color="warning" />
                ) : postMatched ? (
                  <PostCard postData={postMatched} />
                ) : (
                  <p>No hay coincidencias</p>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default MatchPetitionPost;
