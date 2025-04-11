"use client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { createStore, RootState } from "./store";
import {
  addMagazine,
  addPostToMagazine,
  addSectionToMagazine,
  editMagazineName,
  removeMagazine,
  removePostFromMagazine,
  removeSectionFromMagazine,
} from "./slices/magazineSlice";
import { ReactNode } from "react";
import { ActiveUserRelation, UserType } from "@/types/userTypes";
import DataInitializer from "./DataInitializer";
import { setActiveRelations, setSearchPreferences } from "./slices/configSlice";
import { PostCategory } from "@/types/postTypes";
import { Magazine, MagazineSection } from "@/types/magazineTypes";

export const UserDataProvider = ({
  children,
  username,
  userId,
  clerkId,
  userType,
}: {
  children: ReactNode;
  username?: string | null;
  userId?: string;
  clerkId?: string;
  userType?: UserType;
}) => {
  // Create a Redux store with preloaded state
  const { store } = createStore({
    user: {
      usernameLogged: username,
      userIdLogged: userId,
      clerkIdLogged: clerkId,
      userTypeLogged: userType,
    },
  });

  return (
    <Provider store={store}>
      <DataInitializer userId={userId} username={username} />
      {children}
    </Provider>
  );
};

export const useUserData = () => {
  const { usernameLogged, userIdLogged, clerkIdLogged, userTypeLogged } =
    useSelector((state: RootState) => state.user);

  return { usernameLogged, userIdLogged, clerkIdLogged, userTypeLogged };
};

export const useMagazinesData = () => {
  const { magazines, postsInMagazine } = useSelector(
    (state: RootState) => state.magazine
  );
  const dispatch = useDispatch();

  const addPost = (postId: string, section: string) => {
    dispatch(addPostToMagazine({ postId, section }));
  };

  const removePost = (postId: string, section: string) => {
    dispatch(removePostFromMagazine({ postId, section }));
  };

  const addSection = (id: string, section: MagazineSection) => {
    dispatch(addSectionToMagazine({ id, section }));
  };

  const removeSection = (id: string, sectionId: string) => {
    dispatch(removeSectionFromMagazine({ id, sectionId }));
  };

  const editMagazine = (id: string, name: string) => {
    dispatch(editMagazineName({ id, name }));
  };

  const addMagazineToStore = (magazine: Magazine) => {
    dispatch(addMagazine(magazine));
  };

  const removeMagazineOfStore = (id: string) => {
    dispatch(removeMagazine(id));
  };

  return {
    magazines,
    postsInMagazine,
    addPost,
    removePost,
    addSection,
    removeSection,
    editMagazine,
    addMagazineToStore,
    removeMagazineOfStore,
  };
};

export const useConfigData = () => {
  const { configData } = useSelector((state: RootState) => state.config);
  const dispatch = useDispatch();

  const updateActiveRelations = (activeRelations: ActiveUserRelation[]) => {
    dispatch(setActiveRelations(activeRelations));
  };

  const updateSearchTerms = (searchTerms: PostCategory[]) => {
    dispatch(setSearchPreferences(searchTerms));
  };

  return { configData, updateActiveRelations, updateSearchTerms };
};

export const useActiveSubscriptions = () => {
  const { postsPacks, accountType } = useSelector(
    (state: RootState) => state.subscriptions
  );
  return { postsPacks, accountType };
};
