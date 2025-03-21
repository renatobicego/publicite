import { useMemo } from "react";
import {
  changeBehaviourSteps,
  createGroupSteps,
  createMagazineSteps,
  createNeedPostSteps,
  createPostSteps,
  createSteps,
  editGroupSteps,
  editMagazineSteps,
  editNeedPostSteps,
  editPostSteps,
  exploreAgendaPostsSteps,
  exploreBoardsSteps,
  explorePostsSteps,
  exploreProfilesSteps,
  groupSteps,
  homePageSteps,
  magazineSteps,
  packsSteps,
  postSteps,
  profileSteps,
  subscriptionSteps,
} from "./tutorialSteps";
import {
  BOARDS,
  CREATE,
  CREATE_GROUP,
  CREATE_MAGAZINE,
  CREATE_PETITION,
  CREATE_POST,
  EDIT_GROUP,
  EDIT_MAGAZINE,
  EDIT_PETITION,
  EDIT_POST,
  GROUPS,
  MAGAZINES,
  NEEDS,
  PACKS,
  POSTS,
  PROFILE,
  SERVICES,
  SUBSCRIPTIONS,
} from "@/utils/data/urls";

export const useTutorialSteps = (path: string) => {
  return useMemo(() => {
    switch (true) {
      case path === "/":
        return homePageSteps;
      case path === POSTS || path === SERVICES || NEEDS:
        return explorePostsSteps;
      case path === `${POSTS}/contactos`:
        return exploreAgendaPostsSteps;
      case path === `${BOARDS}`:
        return exploreBoardsSteps;
      case path === `${PROFILE}`:
        return exploreProfilesSteps;
      case path === `${GROUPS}`:
        return exploreProfilesSteps;
      case path === `${CREATE}`:
        return createSteps;
      case path === `${CREATE_POST}`:
        return createPostSteps;
      case path === `${CREATE_PETITION}`:
        return createNeedPostSteps;
      case path === `${CREATE_MAGAZINE}`:
        return createMagazineSteps;
      case path === `${CREATE_GROUP}`:
        return createGroupSteps;
      case path === `${EDIT_POST}`:
        return editPostSteps;
      case path === `${EDIT_PETITION}`:
        return editNeedPostSteps;
      case path === `${EDIT_MAGAZINE}`:
        return editMagazineSteps;
      case path === `${EDIT_GROUP}`:
        return editGroupSteps;
      case path.includes(`${PROFILE}/`):
        return profileSteps;
      case path.includes(`${POSTS}/`):
        return postSteps;
      case path.includes(`${MAGAZINES}/`):
        return magazineSteps;
      case path.includes(`${GROUPS}/`):
        return groupSteps;
      case path === `${SUBSCRIPTIONS}`:
        return subscriptionSteps;
      case path === `${PACKS}`:
        return packsSteps;
      case path.includes(`/comportamiento`):
        return changeBehaviourSteps;
    }
  }, [path]);
};
