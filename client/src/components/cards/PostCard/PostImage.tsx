"use client";
import { Button, CardHeader, Image, Link, Tooltip } from "@nextui-org/react";
import SaveButton from "../../buttons/SaveMagazine/SaveButton";
import { FILE_URL, POSTS } from "@/utils/data/urls";
import { Good, Service } from "@/types/postTypes";
import { SignedIn } from "@clerk/nextjs";
import ShareButton from "@/components/buttons/ShareButton";
import { FaShare } from "react-icons/fa6";
import { FaShareAlt } from "react-icons/fa";

const PostImage = ({
  post,
  recommendation,
  savePostMagazine,
  hideSaveMagazineButton,
}: {
  post: Good | Service;
  recommendation: boolean;
  savePostMagazine: boolean;
  hideSaveMagazineButton?: boolean;
}) => {
  return (
    <CardHeader className="w-full pb-0 max-md:px-1 md:px-2 lg:px-3">
      <Link
        href={`${POSTS}/${post._id}`}
        className="w-full"
        isDisabled={savePostMagazine}
      >
        <Image
          src={FILE_URL + post.imagesUrls[0]}
          classNames={{
            wrapper: `!max-w-full w-full max-md:max-h-[45vw] md:max-lg:max-h-[25vw] `,
            img: `!max-w-full w-full object-cover max-md:max-h-[45vw] md:max-h-[25vw] ${
              recommendation && "lg:max-2xl:max-h-[18vw]"
            } lg:max-h-[22vw] xl:max-h-[17vw] 3xl:max-h-[14vw]`,
          }}
          alt={`Imagen de portada de ${post.title}`}
          width={287}
          height={290}
        />
      </Link>
      <SignedIn>
        {(!savePostMagazine || !hideSaveMagazineButton) && (
          <SaveButton
            post={post}
            className="absolute top-4 right-2 md:right-4 z-10 max-md:min-w-8 max-md:size-8"
          />
        )}
      </SignedIn>
      <ShareButton
        data={{ ...post, type: "post" }}
        shareType="post"
        customUrl={`${POSTS}/${post._id}`}
        customTitle={`Echa un vistazo a este post: ${post.title}`}
        ButtonAction={
          <Button
            isIconOnly
            aria-label="Compartir"
            variant="flat"
            color="secondary"
            radius="full"
            className="absolute bottom-2 right-2  z-10 min-w-8 size-8"
          >
            <FaShareAlt />
          </Button>
        }
      />
    </CardHeader>
  );
};

export default PostImage;
