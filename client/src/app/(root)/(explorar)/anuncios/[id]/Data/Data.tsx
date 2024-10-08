import { getTimeBetweenToday } from "@/utils/functions/dates";
import { conditionItems } from "@/utils/data/selectData";
import { Good, Petition, Service } from "@/types/postTypes";
import { parseDate } from "@internationalized/date";
import ReviewsStars from "./ReviewsStars";
import CategoryChip from "@/components/chips/CategoryChip";
import ServiceChip from "@/components/chips/ServiceChip";
import ShareButton from "@/components/buttons/ShareButton";
import SaveButton from "@/components/buttons/SaveButton";
import AccordionData from "./AccordionData/AccordionData";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { CREATE_POST, EDIT_POST } from "@/utils/data/urls";
import { Link } from "@nextui-org/react";
import ContactPetitionsList from "@/components/modals/ContactPetition/ContactPetitionsList";
import PetitionChip from "@/components/chips/PetitionChip";
import ContactModal from "@/components/modals/ContactModal/ContactModal";
import { SignedIn } from "@clerk/nextjs";

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
  const datePublished = getTimeBetweenToday(parseDate(good.createAt));
  const showCondition =
    post.postType === "good"
      ? `${
          conditionItems.find((item) => item.value === good.condition)?.label
        } | `
      : "";

  const priceToShow = () => {
    switch (post.postType) {
      case "good":
        return `$${good.price}`;
      case "service":
        return `$${service.price} ${
          service.frequencyPrice ? `por ${service.frequencyPrice}` : ""
        }`;
      case "petition":
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
          {post.postType === "petition" && <PetitionChip />}
          {post.postType === "service" ||
            (petition.petitionType === "service" && <ServiceChip />)}
        </div>
        <p className="text-sm xl:text-base">{post.description}</p>
        <div className="flex w-full justify-between max-lg:flex-wrap gap-2">
          {isAuthor ? (
            <PrimaryButton as={Link} href={`${EDIT_POST}/${post._id}`}>
              Editar Anuncio
            </PrimaryButton>
          ) : (
            <ContactModal postId={post._id} />
          )}
          <div className="flex gap-2">
            {isAuthor && <ContactPetitionsList post={post} />}
            <ShareButton post={post} />
            <SignedIn>
              <SaveButton saved={false} post={post} />
            </SignedIn>
          </div>
        </div>
      </div>
      <AccordionData post={post} isPetition={isPetition} />
    </div>
  );
};

export default Data;
