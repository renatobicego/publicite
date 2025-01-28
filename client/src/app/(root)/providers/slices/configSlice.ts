import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  ConfigData,
  getConfigData,
} from "../../(configuracion)/Profile/actions";
import { getActiveRelations } from "@/services/postsServices";
import { ActiveUserRelation, UserRelations } from "@/types/userTypes";

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

export const fetchConfigData = createAsyncThunk(
  "config/fetchConfigData",
  async (
    { username, userId }: { username: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await getConfigData({ username, id: userId });
      const userRelations = await getActiveRelations();
      if ("error" in userRelations && userRelations.error) {
        return rejectWithValue(userRelations.error);
      }
      if (data) data.activeRelations = userRelations as ActiveUserRelation[];
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setActiveRelations(state, action) {
      console.log(state.configData);
      if (!state.configData) return;
      state.configData = {
        ...state.configData,
        activeRelations: action.payload,
      };
    },
    setSearchPreferences(state, action) {
      console.log(state.configData);

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
