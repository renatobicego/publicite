import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  ConfigData,
  getConfigData,
} from "../../(configuracion)/Profile/actions";
import { getActiveRelations } from "@/services/postsServices";
import { ActiveUserRelation, UserRelations } from "@/types/userTypes";
import { toastifyError } from "@/utils/functions/toastify";

export interface ConfigState {
  configData?: ConfigData;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ConfigState = {
  configData: undefined,
  status: "idle",
  error: null,
};

// Helper function to implement retry logic
const fetchWithRetry = async (
  username: string,
  userId: string,
  maxRetries = 5
): Promise<ConfigData | undefined> => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      // First API call
      const configData = await getConfigData({ username, id: userId });

      // Second API call
      const userRelations = await getActiveRelations();

      // Check for error in userRelations
      if ("error" in userRelations && userRelations.error) {
        throw new Error(userRelations.error);
      }

      // Combine the data
      if (configData) {
        configData.activeRelations = userRelations as ActiveUserRelation[];
      }

      return configData;
    } catch (error) {
      retries++;

      // If we've reached max retries, throw the error to be handled by the thunk
      if (retries >= maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retries - 1))
      );
    }
  }

  // This should never be reached due to the throw in the catch block
  return;
};

export const fetchConfigData = createAsyncThunk(
  "config/fetchConfigData",
  async (
    { username, userId }: { username: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      // Use the retry function with 5 max attempts
      const data = await fetchWithRetry(username, userId, 5);

      if (!data) {
        throw new Error(
          "Error al obtener los datos de configuración. Por favor recarga la página."
        );
      }

      return data;
    } catch (error) {
      // Only show error toast after all retries have failed
      toastifyError(
        "Error al obtener los datos de configuración. Por favor recarga la página."
      );
      return rejectWithValue(error);
    }
  }
);
const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setActiveRelations(state, action) {
      if (!state.configData) return;
      state.configData = {
        ...state.configData,
        activeRelations: action.payload,
      };
    },
    setSearchPreferences(state, action) {
      if (!state.configData) return;
      state.configData = {
        ...state.configData,
        userPreferences: {
          ...state.configData?.userPreferences,
          searchPreference: action.payload,
        },
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfigData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchConfigData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.configData = action.payload;
      })
      .addCase(fetchConfigData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch config data";
      });
  },
});

export const { setActiveRelations, setSearchPreferences } = configSlice.actions;

export default configSlice.reducer;
