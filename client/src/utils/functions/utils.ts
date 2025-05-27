import { Magazine } from "@/types/magazineTypes";
import { Good, Post } from "@/types/postTypes";
import { Subscription, SubscriptionPlan } from "@/types/subscriptions";
import { toastifyError, toastifySuccess } from "./toastify";

export const checkIfUserIsSubscribed = (
  subscriptionsOfUser: Subscription[],
  subscriptionPlan: SubscriptionPlan | string,
  byMpId?: boolean
) => {
  // Check if user is subscribed
  return subscriptionsOfUser.some((subscription) => {
    const isSameId = byMpId
      ? subscription.subscriptionPlan.mpPreapprovalPlanId == subscriptionPlan
      : subscription.subscriptionPlan._id ==
        (subscriptionPlan as SubscriptionPlan)._id;

    // Check if subscription is active
    if (isSameId) {
      // const todayDate = today(getLocalTimeZone());
      switch (true) {
        case subscription.status === "authorized" ||
          subscription.status === "active":
          return true;
        // // if the subscription has been cancelled but it's still within 3 days of its end date
        // case subscription.status === "cancelled" &&
        //   todayDate.add({ days: 3 }).compare(parseDate(subscription.endDate)) >
        //     0:
        //   return true;
        default:
          return false;
      }
    }
    return false;
  });
};

export const getMagazineType = (options?: string[]) => {
  if (!options) return { isGroupMagazine: false, isSharedMagazine: false };
  const isGroupMagazine = options.includes("grupos");
  const isSharedMagazine = options.includes("compartida");
  return { isGroupMagazine, isSharedMagazine };
};

/**
 *
 * The following functions are used to get id from options
 * and check magazine owner and magazine type (used in magazine page)
 */
// Get id from options (used in magazine page)
export const getId = (
  options: string[] | undefined,
  isGroupMagazine: boolean
) => {
  if (!options) return null;
  // if is group magazine, return id of group
  // if not, return id of post if is being sent
  return isGroupMagazine ? options[1] : options[0] || null;
};

export const getSharedMagazineIds = (
  options: string[] | undefined,
  isSharedMagazine: boolean
) => {
  if (!options) return null;
  return isSharedMagazine ? { user: options[1], post: options[2] } : null;
};

// Change style of board based in color of the board
export const handleBoardColor = (bg: string) => {
  const darkColors = ["bg-[#5A0001]/80"];
  const darkColorsBorder = [
    "bg-[#5A0001]/80",
    "bg-[#20A4F3]/30",
    "bg-[#FFB238]/80",
  ];
  const textColor = darkColors.includes(bg) ? "text-white" : "text-text-color";
  const borderColor = darkColorsBorder.includes(bg) ? "border-white" : "";
  return { textColor, borderColor };
};

const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm"]; // Add more as needed

// Helper function to check if the URL is a video based on file extension
export const isVideo = (url: string, searchVdieoInUrl?: boolean) => {
  if (searchVdieoInUrl) return url.includes("video");
  const extension = url.split(".").pop()?.toLowerCase();
  return extension ? videoExtensions.includes(extension) : false;
};

export const formatTotal = (total: number | undefined) => {
  if (!total) return "";
  // Check if the number has no decimal value after rounding
  if (total % 1 === 0) {
    return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(
      total
    );
  }

  // Return with two decimals otherwise
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(total);
};

export const getEmojiName = (emoji: string) => {
  switch (emoji) {
    case "👍":
      return "Me Gusta";
    case "❤️":
      return "Me Encanta";
    case "😊":
      return "Me Alegra";
    case "😂":
      return "Me Divierte";
    case "😲":
      return "Me Sorprende";
    default:
      return "";
  }
};

export const getFirstThreePostsImages = (magazineData: Magazine) => {
  const posts: Post[] = [];

  for (const section of magazineData.sections) {
    if (posts.length >= 3) break; // Stop once we have 3 posts
    posts.push(...section.posts.slice(0, 3 - posts.length));
  }

  return posts.map((post) =>
    "imagesUrls" in post && post.imagesUrls ? (post as Good).imagesUrls[0] : ""
  );
};

export const shareLink = async (url: string, title: string) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        url: url,
        text: "Compartir Publicité",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return;
        }
      }
      toastifyError("Error al compartir el link");
    }
  } else {
    // Fallback for browsers that don't support Web Share API
    try {
      await navigator.clipboard.writeText(url);
      toastifySuccess("¡Link copiado en el portapapeles!");
    } catch (error) {
      toastifyError("Error al compartir el link");
    }
  }
};
