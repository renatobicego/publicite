import {
  CreatePostValues,
  Good,
  Petition,
  Service,
} from "@/types/postTypes";

export const getPostInitialValues = (
  postData: Good | Service,
  postType: "good" | "service"
) => {
  const postValues: Omit<CreatePostValues, "createAt" | "geoLocation" | "author" | "postBehaviourType"> = {
    attachedFiles: postData.attachedFiles,
    // author: postData.author._id,
    category: postData.category[0]._id,
    description: postData.description,
    price: postData.price,
    postType: postData.postType,
    title: postData.title,
    visibility: postData.visibility,
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
  }
};
