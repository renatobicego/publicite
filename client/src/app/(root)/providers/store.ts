import {
  combineReducers,
  configureStore,
  type ConfigureStoreOptions,
} from "@reduxjs/toolkit";
import storageSession from "redux-persist/lib/storage/session";
import userReducer, { type UserState } from "./slices/userSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import magazineReducer, { type MagazineState } from "./slices/magazineSlice";
import configReducer, { type ConfigState } from "./slices/configSlice";
// Define the shape of the entire state
import { PersistPartial } from "redux-persist/es/persistReducer";
import subscriptionsReducer, {
  type SubscriptionsState,
} from "./slices/subscriptionsSlice";

export interface RootState extends PersistPartial {
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

// Configure Redux Persist
const persistConfig = {
  key: "root",
  storage: storageSession,
  whitelist: ["magazine", "config"],
  blacklist: ["user", "subscriptions"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Define the return type of createStore
interface StoreReturn {
  store: ReturnType<typeof configureStore>;
  persistor: ReturnType<typeof persistStore>;
}

// Create the store
export const createStore = (
  preloadedState: Partial<RootState> = {}
): StoreReturn => {
  const storeOptions: ConfigureStoreOptions<RootState> = {
    reducer: persistedReducer,
    preloadedState: preloadedState as RootState,

    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  };

  const store = configureStore(storeOptions);
  const persistor = persistStore(store);

  return { store, persistor };
};

export type AppDispatch = ReturnType<
  ReturnType<typeof createStore>["store"]["dispatch"]
>;
