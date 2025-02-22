import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getSubscriptions } from "../../(configuracion)/Profile/actions";
import { Subscription } from "@/types/subscriptions";

export interface SubscriptionsState {
  accountType?: Subscription;
  postsPacks: Subscription[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SubscriptionsState = {
  accountType: undefined,
  postsPacks: [],
  status: "idle",
  error: null,
};

export const fetchSubscriptions = createAsyncThunk(
  "subscriptions/fetchSubscriptions",
  async (userId: string, { rejectWithValue }) => {
    try {
      const data = await getSubscriptions(userId);
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const subscriptions = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accountType = action.payload?.accountType;
        state.postsPacks = action.payload?.postsPacks || [];
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch config data";
      });
  },
});

export default subscriptions.reducer;
