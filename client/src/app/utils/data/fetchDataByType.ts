import {
  getGoods,
  getPetitions,
  getServices,
} from "@/app/services/postsServices";

export const fetchDataByType = (
  postType: "good" | "service" | "petition" | "boards" | "users" | "groups",
  searchTerm: string | null
) => {
  switch (postType) {
    case "good":
      return async () => await getGoods(searchTerm);
    case "service":
      return async () => await getServices(searchTerm);
    case "petition":
      return async () => await getPetitions(searchTerm);
    default:
      return async () => {
        return [];
      };
  }
};
