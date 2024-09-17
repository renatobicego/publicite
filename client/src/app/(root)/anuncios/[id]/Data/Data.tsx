import { getTimeBetweenToday } from "@/app/utils/dates";
import { conditionItems } from "@/app/utils/selectData";
import { Good, Service } from "@/types/postTypes";
import { parseDate } from "@internationalized/date";
import ReviewsStars from "./ReviewsStars";
import CategoryChip from "@/app/components/chips/CategoryChip";
import ServiceChip from "@/app/components/chips/ServiceChip";
import ContactModal from "@/app/components/modals/ContactModal";
import ShareButton from "@/app/components/buttons/ShareButton";
import SaveButton from "@/app/components/buttons/SaveButton";
import AccordionData from "./AccordionData/AccordionData";
import { auth, currentUser } from "@clerk/nextjs/server";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import { CREATE_POST } from "@/app/utils/urls";
import { Link } from "@nextui-org/react";
import ContactPetitionsList from "@/app/components/modals/ContactPetitionsList";

const Data = async ({ post, isAuthor }: { post: Good | Service; isAuthor: boolean }) => {
  const good = post as Good;
  const datePublished = getTimeBetweenToday(parseDate(good.createdAt));
  return (
    <div className="flex-1 flex flex-col gap-4 items-start w-full md:w-1/2">
      <p className="text-sm text-light-text">
        {post.postType === "Good"
          ? conditionItems.find((item) => item.value === good.condition)?.label
          : ""}{" "}
        | Publicado {datePublished} en {post.location.description}
      </p>
      <h2>{post.title}</h2>
      {post.reviews.length > 0 && <ReviewsStars reviews={post.reviews} />}
      <h3 className="font-medium">${post.price}</h3>
      <div className="flex gap-2">
        <CategoryChip>{post.category.label}</CategoryChip>
        {post.postType === "Service" && <ServiceChip />}
      </div>
      <p className="text-sm xl:text-base">{post.description}</p>
      <div className="flex w-full justify-between max-lg:flex-wrap gap-2">
        {isAuthor ? (
          <PrimaryButton as={Link} href={`${CREATE_POST}/${post._id}`}>
            Editar Anuncio
          </PrimaryButton>
        ) : (
          <ContactModal post={post} />
        )}
        <div className="flex gap-2">
          {isAuthor && <ContactPetitionsList post={post} />}
          <ShareButton post={post} />
          <SaveButton saved={false} post={post} />
        </div>
      </div>
      <AccordionData post={post} />
    </div>
  );
};

export default Data;
