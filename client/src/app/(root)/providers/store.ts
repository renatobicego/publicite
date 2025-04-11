import {
  combineReducers,
  configureStore,
  type ConfigureStoreOptions,
} from "@reduxjs/toolkit";
import userReducer, { type UserState } from "./slices/userSlice";
import magazineReducer, { type MagazineState } from "./slices/magazineSlice";
import configReducer, { type ConfigState } from "./slices/configSlice";
import subscriptionsReducer, {
  type SubscriptionsState,
} from "./slices/subscriptionsSlice";

// Define the shape of the entire state without PersistPartial
export interface RootState {
  user: UserState;
  magazine: MagazineState;
  config: ConfigState;
  subscriptions: SubscriptionsState;
}

// Combine all reducers
const rootReducer = combineReducers({
  user: userReducer,
  magazine: magazineReducer,
  config: configReducer,
  subscriptions: subscriptionsReducer,
});

// Define the return type of createStore (without persistor)
interface StoreReturn {
  store: ReturnType<typeof configureStore>;
}

// Create the store without persistence
export const createStore = (
  preloadedState: Partial<RootState> = {}
): StoreReturn => {
  const storeOptions: ConfigureStoreOptions<RootState> = {
    reducer: rootReducer,
    preloadedState: preloadedState as RootState,
  };

  const store = configureStore(storeOptions);
  return { store };
};

export type AppDispatch = ReturnType<
  ReturnType<typeof createStore>["store"]["dispatch"]
>;
