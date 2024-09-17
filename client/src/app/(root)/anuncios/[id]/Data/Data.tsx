import { getTimeBetweenToday } from "@/app/utils/dates";
import { conditionItems } from "@/app/utils/selectData";
import { Good, Petition, Service } from "@/types/postTypes";
import { parseDate } from "@internationalized/date";
import ReviewsStars from "./ReviewsStars";
import CategoryChip from "@/app/components/chips/CategoryChip";
import ServiceChip from "@/app/components/chips/ServiceChip";
import ContactModal from "@/app/components/modals/ContactModal";
import ShareButton from "@/app/components/buttons/ShareButton";
import SaveButton from "@/app/components/buttons/SaveButton";
import AccordionData from "./AccordionData/AccordionData";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import { CREATE_POST } from "@/app/utils/urls";
import { Link } from "@nextui-org/react";
import ContactPetitionsList from "@/app/components/modals/ContactPetitionsList";
import PetitionChip from "@/app/components/chips/PetitionChip";

const Data = async ({
  post,
  isAuthor,
  isPetition,
}: {
  post: Good | Service | Petition;
  isAuthor: boolean;
  isPetition: boolean;
}) => {
  const good = post as Good;
  const service = post as Service;
  const petition = post as Petition;
  const datePublished = getTimeBetweenToday(parseDate(good.createdAt));
  const showCondition =
    post.postType === "Good"
      ? `${
          conditionItems.find((item) => item.value === good.condition)?.label
        } | `
      : "";

  const priceToShow = () => {
    switch (post.postType) {
      case "Good":
        return `$${good.price}`;
      case "Service":
        return `$${service.price} ${
          service.frequencyPrice ? `por ${service.frequencyPrice}` : ""
        }`;
      case "Petition":
        return `${
          petition.toPrice
            ? `De $${petition.price} a $${petition.toPrice}`
            : `$${petition.price}`
        } ${petition.frequencyPrice ? `por ${petition.frequencyPrice}` : ""}`;
    }
  };
  return (
    <div
      className={`flex-1 flex gap-4 items-start w-full ${
        isPetition ? "max-md:flex-col" : "md:w-1/2 flex-col"
      }`}
    >
      <div className="flex flex-col gap-4 w-full">
        <p className="text-sm text-light-text">
          {showCondition}
          Publicado {datePublished} en {post.location.description}
        </p>
        <h2>{post.title}</h2>
        {"reviews" in post && post.reviews.length > 0 && (
          <ReviewsStars reviews={post.reviews} />
        )}
        <h3 className="font-medium">{priceToShow()}</h3>
        <div className="flex gap-2">
          <CategoryChip>{post.category.label}</CategoryChip>
          {post.postType === "Petition" && <PetitionChip />}
          {post.postType === "Service" || petition.petitionType === "Service" && <ServiceChip />}
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
      </div>
      <AccordionData post={post} isPetition={isPetition} />
    </div>
  );
};

export default Data;
