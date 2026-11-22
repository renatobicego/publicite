import { Service } from "@/types/postTypes";
import { Card } from "@nextui-org/react";
import PostImage from "./PostImage";
import PostCardBody from "./PostCardBody";
import { formatTotal } from "@/utils/functions/utils";
import { frequencyPriceItems } from "@/utils/data/selectData";
import { AdSpacePost } from "@/types/postTypes";
import { adSpaceMediumOf } from "@/utils/data/adSpaces";

const ServiceCard = ({
  post,
  recommendation,
  savePostMagazine,
  isGroupPost,
  hideSaveMagazineButton,
}: {
  post: Service | AdSpacePost;
  recommendation: boolean;
  savePostMagazine: boolean;
  isGroupPost: boolean;
  hideSaveMagazineButton?: boolean;
}) => {
  const { title, reviews, description, price, frequencyPrice } = post;
  const frequencyShown =
    (post.frequencyPrice as any) !== "undefined"
      ? `por ${frequencyPriceItems.find((item) => item.value === post.frequencyPrice)
        ?.text
      }`
      : "";
  const displayPrice =
    price === 8613.1
      ? "Negociable / a pactar"
      : `${formatTotal(price)} ${frequencyShown}`;
  // Los espacios publicitarios se dibujan como un servicio, con su medio.
  const adSpace = post.postType === "adspace" ? (post as AdSpacePost).adSpace : null;
  const medium = adSpaceMediumOf(adSpace?.medium);
  const adSpaceLabel = medium
    ? `${medium.label}${adSpace?.mediaName ? ` · ${adSpace.mediaName}` : ""}`
    : undefined;
  return (
    <>
      <PostImage
        post={post}
        recommendation={recommendation}
        savePostMagazine={savePostMagazine}
        hideSaveMagazineButton={hideSaveMagazineButton}
      />
      <PostCardBody
        title={title}
        reviews={reviews}
        isGroupPost={isGroupPost}
        description={description}
        price={displayPrice}
        isService={true}
        adSpaceLabel={adSpaceLabel}
      />
    </>
  );
};

export default ServiceCard;
