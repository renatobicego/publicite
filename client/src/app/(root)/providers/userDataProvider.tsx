"use client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { createStore, RootState } from "./store";
import {
  addPostToMagazine,
  removePostFromMagazine,
} from "./slices/magazineSlice";
import { ReactNode, use } from "react";
import {
  ActiveUserRelation,
  UserPreferences,
  UserRelations,
  UserType,
} from "@/types/userTypes";
import DataInitializer from "./DataInitializer";
import { setActiveRelations, setSearchPreferences } from "./slices/configSlice";
import { PersistGate } from "redux-persist/integration/react";
import { PostCategory } from "@/types/postTypes";

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
  const { store, persistor } = createStore({
    user: {
      usernameLogged: username,
      userIdLogged: userId,
      clerkIdLogged: clerkId,
      userTypeLogged: userType,
    },
  });

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <DataInitializer userId={userId} username={username} />
        {children}
      </PersistGate>
    </Provider>
  );
};

export const useUserData = () => {
  const { usernameLogged, userIdLogged, clerkIdLogged, userTypeLogged } =
    useSelector((state: RootState) => state.user);
  const user = useSelector((state: RootState) => state.user);
  console.log(user);

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
  const dispatch = useDispatch();

  const updateActiveRelations = (activeRelations: ActiveUserRelation[]) => {
    dispatch(setActiveRelations(activeRelations));
  };

  const updateSearchTerms = (searchTerms: PostCategory[]) => {
    dispatch(setSearchPreferences(searchTerms));
  };

  return { configData, updateActiveRelations, updateSearchTerms };
};
