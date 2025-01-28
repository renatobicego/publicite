import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Magazine } from "@/types/magazineTypes";
import { getMagazinesOfUser } from "@/services/magazineService";
import { toastifyError } from "@/utils/functions/toastify";

interface PostInMagazine {
  postId: string;
  section: string;
}

export interface MagazineState {
  magazines?: Magazine[];
  postsInMagazine: PostInMagazine[];
}

const initialState: MagazineState = {
  magazines: [],
  postsInMagazine: [],
};

export const fetchMagazines = createAsyncThunk(
  "magazine/fetchMagazines",
  async (userId: string | undefined, { rejectWithValue }) => {
    if (!userId) return [];
    try {
      const magazines: Magazine[] = await getMagazinesOfUser();
      return magazines;
    } catch (error) {
      toastifyError(
        "Error al obtener las revistas. Por favor recarga la página."
      );
      return rejectWithValue(error);
    }
  }
);

const magazineSlice = createSlice({
  name: "magazine",
  initialState,
  reducers: {
    addPostToMagazine(state, action: PayloadAction<PostInMagazine>) {
      // Add the post to postsInMagazine array
      state.postsInMagazine.push(action.payload);
    },
    removePostFromMagazine(state, action: PayloadAction<PostInMagazine>) {
      // Remove the post by postId
      state.postsInMagazine = state.postsInMagazine.filter(
        (post) =>
          post.postId !== action.payload.postId &&
          post.section !== action.payload.section
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMagazines.fulfilled, (state, action) => {
      state.magazines = action.payload;
      state.postsInMagazine = action.payload.flatMap((magazine) =>
        magazine.sections.flatMap((section) =>
          section.posts.map((post) => ({
            postId: post._id,
            section: section._id,
          }))
        )
      );
    });
  },
});

export const { addPostToMagazine, removePostFromMagazine } =
  magazineSlice.actions;
export default magazineSlice.reducer;
