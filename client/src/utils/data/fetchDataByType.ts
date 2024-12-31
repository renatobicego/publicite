import { Coordinates } from "@/app/(root)/providers/LocationProvider";
import { getBoards } from "@/services/boardServices";
import { getGroupPosts, getGroups } from "@/services/groupsService";
import {
  getGoods,
  getPetitions,
  getPosts,
  getPostsOfContacts,
  getServices,
} from "@/services/postsServices";
import { getUsers } from "@/services/userServices";


export type PostsDataTypes =
  | {
      typeOfData: "posts" | "contactPosts";
      postType: "good" | "service" | "petition" | "goodService";
    }
  | {
      typeOfData: "groupPosts";
      groupId: string;
    };

export type PubliciteDataTypes =
  | {
      typeOfData: "boards" | "users" | "groups";
    }
  | PostsDataTypes;

export const fetchDataByType = async (
  postType: PubliciteDataTypes,
  searchTerm: string | null,
  page: number,
  coordinates: Coordinates | null
) => {
  switch (postType.typeOfData) {
    case "posts":
      if (postType.postType === "goodService") {
        const services = await getServices(searchTerm, page, coordinates);
        const goods = await getGoods(searchTerm, page, coordinates);
        // return a mix of services and goods
        return {
          items: [...goods.items.slice(0, 5), ...services.items.slice(0, 5)],
          hasMore: services.hasMore,
        };
      }
      return await getPosts(searchTerm, page, postType.postType, coordinates);
    case "boards":
      return await getBoards(searchTerm, page);
    case "groups":
      return await getGroups(searchTerm, page);
    case "users":
      return await getUsers(searchTerm, page);
    case "groupPosts":
      return await getGroupPosts(page, postType.groupId);
    case "contactPosts":
      return await getPostsOfContacts(
        searchTerm,
        page,
        postType.postType as PostType,
        20
      );
  }
};
