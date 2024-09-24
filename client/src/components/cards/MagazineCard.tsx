import { Good, Magazine, Post } from "@/types/postTypes";
import { MAGAZINES, PROFILE } from "@/utils/data/urls";
import { Card, CardBody, CardFooter, Image, Link } from "@nextui-org/react";

const MagazineCard = ({ magazineData}: { magazineData: Magazine; }) => {
  const posts = magazineData.sections[0].posts as Post[];
  return (
    <Card as={Link} href={`${MAGAZINES}/${magazineData._id}`} className="w-full">
      <CardBody className="flex gap-1 flex-row w-full p-1">
        {posts[0] ? (
          <Image
            radius="sm"
            alt="magazine image"
            classNames={{
              img: "w-full object-cover h-36 lg:h-52",
              wrapper: "w-2/3",
            }}
            src={(posts[0] as Good).imagesUrls[0]}
          />
        ) : null}
        <div className="flex gap-1 flex-1 flex-col h-full">
          {posts[1] ? (
            <Image
              alt="magazine image"
              radius="sm"
              className="w-full h-[4.4rem] lg:h-[6.4rem]  object-cover"
              classNames={{
                wrapper: "!max-w-full max-h-[50%]",
              }}
              src={(posts[1] as Good).imagesUrls[0]}
            />
          ) : (
            <div className="bg-gray-200 w-full h-[4.4rem] lg:h-[6.4rem] rounded-md"></div>
          )}
          {posts[2] ? (
            <Image
              alt="magazine image"
              radius="sm"
              className="w-full h-[4.4rem] lg:h-[6.4rem] object-cover"
              classNames={{
                wrapper: "!max-w-full max-h-[50%]",
              }}
              src={(posts[2] as Good).imagesUrls[0]}
            />
          ) : (
            <div className="bg-gray-200 w-full h-[4.4rem] lg:h-[6.4rem] rounded-md"></div>
          )}
        </div>
      </CardBody>
      <CardFooter className="px-4 pb-4">
        <h6>{magazineData.name}</h6>
      </CardFooter>
    </Card>
  );
};

export default MagazineCard;
