import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import magazineReducer from "./slices/magazineSlice";
import configReducer from "./slices/configSlice";

export const createStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer,
      magazine: magazineReducer,
      config: configReducer,
    },
    preloadedState,
  });
};

export type RootState = ReturnType<ReturnType<typeof createStore>["getState"]>;
export type AppDispatch = ReturnType<ReturnType<typeof createStore>["dispatch"]>;
