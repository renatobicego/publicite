import {
  AdSpacePost,
  CreatePostValues,
  Good,
  Service,
} from "@/types/postTypes";
import { emptyAdSpace } from "@/utils/data/adSpaces";
import { parseIsoDate } from "@/utils/functions/dates";

export const getPostInitialValues = (
  postData: Good | Service | AdSpacePost,
  postType: "good" | "service" | "adspace"
) => {
  const postValues: Omit<
    CreatePostValues,
    "createAt" | "geoLocation" | "author" | "postBehaviourType" | "isActive"
  > = {
    attachedFiles: postData.attachedFiles,
    // author: postData.author._id,
    category: postData.category[0]._id,
    description: postData.description,
    price: postData.price,
    postType: postData.postType,
    title: postData.title,
    visibility: postData.visibility,
    endDate: postData.endDate.split("T")[0],
  };

  switch (postType) {
    case "good":
      const goodData = postData as Good;
      const goodValues = {
        ...postValues,
        condition: goodData.condition,
        imagesUrls: goodData.imagesUrls,
        year: goodData.year,
        brand: goodData.brand,
        modelType: goodData.modelType,
      };
      return goodValues;
    case "service":
      const serviceData = postData as Service;
      const serviceValues = {
        ...postValues,
        imagesUrls: serviceData.imagesUrls,
        frequencyPrice: serviceData.frequencyPrice,
      };
      return serviceValues;
    case "adspace": {
      const adSpaceData = postData as AdSpacePost;
      // Los campos que vienen en null se completan vacíos para el formulario.
      const base = emptyAdSpace(adSpaceData.adSpace.medium);
      const adSpace = Object.fromEntries(
        Object.entries(base).map(([key, value]) => [
          key,
          (adSpaceData.adSpace as any)[key] ?? value,
        ])
      ) as typeof base;
      return {
        ...postValues,
        imagesUrls: adSpaceData.imagesUrls,
        frequencyPrice: adSpaceData.frequencyPrice,
        adSpace,
      };
    }
  }
};
