import { getTimeBetweenToday } from "@/utils/functions/dates";
import { conditionItems, frequencyPriceItems } from "@/utils/data/selectData";
import { Good, Petition, Service } from "@/types/postTypes";
import { parseDateTime } from "@internationalized/date";
import ReviewsStars from "./ReviewsStars";
import CategoryChip from "@/components/chips/CategoryChip";
import ShareButton from "@/components/buttons/ShareButton";
import SaveButton from "@/components/buttons/SaveMagazine/SaveButton";
import AccordionData from "./AccordionData/AccordionData";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { EDIT_POST } from "@/utils/data/urls";
import { Link, Spinner } from "@nextui-org/react";
import { SignedIn } from "@clerk/nextjs";
import { formatTotal } from "@/utils/functions/utils";
import PostReactionsContainer from "@/components/buttons/PostReactions/PostReactionsContainer";
import { lazy, Suspense } from "react";
const ContactPetitionsList = lazy(
  () => import("@/components/modals/ContactPetition/ContactPetitionsList")
);
const MatchPetitionPost = lazy(
  () => import("@/components/modals/MatchPetitionPost")
);
const ContactModal = lazy(
  () => import("@/components/modals/ContactModal/ContactModal")
);
const ServiceChip = lazy(() => import("@/components/chips/ServiceChip"));
const PetitionChip = lazy(() => import("@/components/chips/PetitionChip"));
const OptionsDropdown = lazy(() => import("./OptionsDropdown/OptionsDropdown"));

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
  const datePublished = getTimeBetweenToday(
    parseDateTime(post.createAt.replace("Z", ""))
  );
  const showCondition =
    post.postType === "good"
      ? `${
          conditionItems.find((item) => item.value === good.condition)?.label
        } | `
      : "";

  const priceToShow = () => {
    switch (post.postType) {
      case "good":
        return `$${formatTotal(good.price)}`;
      case "service":
        return `$${formatTotal(service.price)} ${
          service.frequencyPrice &&
          (service.frequencyPrice as any) !== "undefined"
            ? `por ${
                (
                  frequencyPriceItems.find(
                    (item) => item.value === petition.frequencyPrice
                  ) ?? {}
                ).text as string
              }`
            : ""
        }`;
      case "petition":
        return `${
          petition.toPrice
            ? `De $${formatTotal(petition.price)} a $${formatTotal(
                petition.toPrice
              )}`
            : `$${formatTotal(petition.price)}`
        } ${
          service.frequencyPrice &&
          (service.frequencyPrice as any) !== "undefined"
            ? `por ${
                (
                  frequencyPriceItems.find(
                    (item) => item.value === petition.frequencyPrice
                  ) ?? {}
                ).text as string
              }`
            : ""
        }`;
    }
  };
  return (
    <div
      className={`flex-1 flex gap-4 items-start w-full ${
        isPetition ? "max-lg:flex-col" : "lg:w-1/2 flex-col"
      }`}
    >
      <div className="flex flex-col gap-3 md:gap-4 w-full">
        <div className="flex justify-between gap-2 md:gap-4 items-start">
          <p className="text-xs md:text-small lg:text-sm text-light-text">
            {showCondition}
            Publicado {datePublished} en {post.geoLocation.description}
          </p>
          {isAuthor && <OptionsDropdown post={post} />}
        </div>
        <h2>{post.title}</h2>
        {"reviews" in post && post.reviews && post.reviews.length > 0 && (
          <ReviewsStars reviews={post.reviews} />
        )}
        <h3 className="font-medium">{priceToShow()}</h3>
        <div className="flex gap-2">
          <CategoryChip>
            {(post.category as any)[0] ? (post.category as any)[0].label : ""}
          </CategoryChip>
          {post.postType === "petition" && <PetitionChip />}
          {post.postType === "service" ||
            (petition.petitionType === "service" && <ServiceChip />)}
        </div>
        <p className="text-small md:text-sm xl:text-base">{post.description}</p>
        <div className="flex w-full justify-between max-lg:flex-wrap gap-2">
          {isAuthor ? (
            <PrimaryButton as={Link} href={`${EDIT_POST}/${post._id}`}>
              Editar Anuncio
            </PrimaryButton>
          ) : (
            <Suspense fallback={<Spinner color="warning" />}>
              <ContactModal postId={post._id} authorId={post.author._id} />
            </Suspense>
          )}
          <div className="flex gap-2">
            {isAuthor && (
              <Suspense fallback={<Spinner color="warning" />}>
                <ContactPetitionsList post={post} />
              </Suspense>
            )}
            <ShareButton
              shareType="post"
              data={{
                _id: post._id,
                description: post.title,
                type: "post",
                username: "",
                imageUrl:
                  "imagesUrls" in post && post.imagesUrls
                    ? (post as Good).imagesUrls[0]
                    : "",
              }}
            />
            <SignedIn>
              <SaveButton post={post} />
              <PostReactionsContainer post={post} isAuthor={isAuthor} />
            </SignedIn>
          </div>
        </div>
        {isPetition && isAuthor && (
          <Suspense fallback={<Spinner color="warning" />}>
            <MatchPetitionPost
              postTitle={post.title}
              petitionType={petition.petitionType}
            />
          </Suspense>
        )}
      </div>
      <AccordionData post={post} isPetition={isPetition} />
    </div>
  );
};

export default Data;
