import { Service } from "@/types/postTypes";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { FaStar } from "react-icons/fa6";
import PostImage from "./PostImage";
import ServiceChip from "../chips/ServiceChip";
import PostCardBody from "./PostCardBody";

const ServiceCard = ({
  post,
  recommendation,
}: {
  post: Service;
  recommendation: boolean;
}) => {
  const { _id, imagesUrls, title, reviews, description, price } = post;

  return (
    <Card
      className="w-full ease-in-out hover:shadow-md gap-4 !transition-shadow duration-500 hover:cursor-pointer"
      shadow="none"
    >
      <PostImage _id={_id} url={imagesUrls[0]} title={title} />
      <PostCardBody
        title={title}
        reviews={reviews}
        description={description}
        price={price}
        isService={true}
      />
    </Card>
  );
};

export default ServiceCard;
