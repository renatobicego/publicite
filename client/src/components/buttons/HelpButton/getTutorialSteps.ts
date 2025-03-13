import { useMemo } from "react";
import {
  createGroupSteps,
  createMagazineSteps,
  createNeedPostSteps,
  createPostSteps,
  createSteps,
  exploreAgendaPostsSteps,
  exploreBoardsSteps,
  explorePostsSteps,
  exploreProfilesSteps,
  homePageSteps,
} from "./tutorialSteps";
import {
  BOARDS,
  CREATE,
  CREATE_GROUP,
  CREATE_MAGAZINE,
  CREATE_PETITION,
  CREATE_POST,
  GROUPS,
  NEEDS,
  POSTS,
  PROFILE,
  SERVICES,
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
    }
  }, [path]);
};
