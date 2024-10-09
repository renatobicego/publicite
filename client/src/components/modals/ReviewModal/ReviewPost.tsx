import PostCard from "@/components/cards/PostCard/PostCard";
import { Good, ReviewPostNotification } from "@/types/postTypes";
import {
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import ReviewPostForm from "./ReviewPostForm";
import { FILE_URL } from "@/utils/data/urls";

const ReviewPost = ({
  isOpen,
  onOpenChange,
  notification,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  notification: ReviewPostNotification;
}) => {
  const { post } = notification;
  return (
    <Modal
      size="4xl"
      placement="center"
      classNames={{
        wrapper: "z-[100000000] ",
        backdrop: "z-[100000000]",
      }}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) =>
          isOpen && (
            <>
              <ModalBody className="flex gap-4 md:flex-row py-6 max-h-[80vh] overflow-y-auto">
                <Image
                  src={FILE_URL + (post as Good).imagesUrls[0]}
                  classNames={{
                    wrapper: "w-4/5 h-fit flex-shrink-0 md:w-2/5",
                  }}
                  className=" object-cover"
                  alt={`Imagen de portada de ${post.title}`}
                  width={287}
                  height={290}
                />
                <div className="flex flex-col gap-2 flex-1">
                  <h5>
                    Opiná sobre tu compra:
                    <span className="font-normal"> {post.title}</span>
                  </h5>
                  <ReviewPostForm id={post._id} onClose={onClose} />
                </div>
              </ModalBody>
            </>
          )
        }
      </ModalContent>
    </Modal>
  );
};

export default ReviewPost;
