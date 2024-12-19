import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ConfigData, getConfigData } from "../../(configuracion)/Profile/actions";

interface ConfigState {
  configData?: ConfigData;
}

const initialState: ConfigState = {
  configData: undefined,
};

export const fetchConfigData = createAsyncThunk(
  "config/fetchConfigData",
  async (
    { username, userId }: { username: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      return await getConfigData({ username, id: userId });
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
    builder.addCase(fetchConfigData.fulfilled, (state, action) => {
      state.configData = action.payload;
    });
  },
});

export default configSlice.reducer;
