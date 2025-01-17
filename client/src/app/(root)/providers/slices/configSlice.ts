import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  ConfigData,
  getConfigData,
} from "../../(configuracion)/Profile/actions";

interface ConfigState {
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
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {},
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

export default configSlice.reducer;
