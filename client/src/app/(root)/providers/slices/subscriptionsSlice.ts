import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getSubscriptions } from "../../(configuracion)/Profile/actions";
import { Subscription } from "@/types/subscriptions";
import { toastifyError } from "@/utils/functions/toastify";

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
// Helper function to implement retry logic
const fetchWithRetry = async (userId: string, maxRetries = 5): Promise<any> => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const subscriptions = await getSubscriptions(userId);
      return subscriptions;
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
  return { accountType: undefined, postsPacks: [] };
};

export const fetchSubscriptions = createAsyncThunk(
  "subscriptions/fetchSubscriptions",
  async (userId: string, { rejectWithValue }) => {
    try {
      // Use the retry function with 5 max attempts
      const subscriptions = await fetchWithRetry(userId, 5);
      return subscriptions;
    } catch (error) {
      // Only show error toast after all retries have failed
      toastifyError(
        "Error al obtener las suscripciones. Por favor recarga la página."
      );
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
