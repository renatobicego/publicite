"use client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { createStore, RootState } from "./store";
import {
  addPostToMagazine,
  removePostFromMagazine,
} from "./slices/magazineSlice";
import { ReactNode, useEffect } from "react";
import { UserType } from "@/types/userTypes";
import MagazineInitializer from "./MagazineInitializer";

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
  const store = createStore({
    user: {
      usernameLogged: username,
      userIdLogged: userId,
      clerkIdLogged: clerkId,
      userTypeLogged: userType,
    },
  });

  return (
    <Provider store={store}>
      <MagazineInitializer userId={userId} />
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

  return { magazines, postsInMagazine, addPost, removePost };
};

export const useConfigData = () => {
  const { configData } = useSelector((state: RootState) => state.config);

  return { configData };
};
