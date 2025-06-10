import { Magazine } from "@/types/magazineTypes";
import { FILE_URL, MAGAZINES } from "@/utils/data/urls";
import { getFirstThreePostsImages } from "@/utils/functions/utils";
import { Card, CardBody, CardFooter, Image, Link } from "@nextui-org/react";

const MagazineCard = ({ magazineData }: { magazineData: Magazine }) => {
  const imagesUrls = getFirstThreePostsImages(magazineData);

  return (
    <Card
      as={Link}
      href={`${MAGAZINES}/${magazineData._id}`}
      className="w-full"
    >
      <CardBody className="flex gap-1 flex-row w-full p-1">
        {imagesUrls[0] ? (
          <Image
            radius="sm"
            alt="magazine image"
            classNames={{
              img: "w-full object-cover h-36 lg:h-52",
              wrapper: "w-2/3",
            }}
            src={FILE_URL + imagesUrls[0]}
          />
        ) : (
          <div className="bg-gray-200 w-2/3 h-36 lg:h-52 rounded-md"></div>
        )}
        <div className="flex gap-1 flex-1 flex-col h-full">
          {imagesUrls[1] ? (
            <Image
              alt="magazine image"
              radius="sm"
              className="w-full h-[4.4rem] lg:h-[6.4rem]  object-cover"
              classNames={{
                wrapper: "!max-w-full max-h-[50%]",
              }}
              src={FILE_URL + imagesUrls[1]}
            />
          ) : (
            <div className="bg-gray-200 w-full h-[4.4rem] lg:h-[6.4rem] rounded-md"></div>
          )}
          {imagesUrls[2] ? (
            <Image
              alt="magazine image"
              radius="sm"
              className="w-full h-[4.4rem] lg:h-[6.4rem] object-cover"
              classNames={{
                wrapper: "!max-w-full max-h-[50%]",
              }}
              src={FILE_URL + imagesUrls[2]}
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
