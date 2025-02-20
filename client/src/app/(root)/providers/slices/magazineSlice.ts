import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Magazine, MagazineSection } from "@/types/magazineTypes";
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
    addMagazine(state, action: PayloadAction<Magazine>) {
      state.magazines?.push(action.payload);

      state.postsInMagazine = [
        ...state.postsInMagazine,
        ...action.payload.sections.flatMap((section) =>
          section.posts.map((post) => ({
            postId: post._id,
            section: section._id,
          }))
        ),
      ];
    },

    removeMagazine(state, action: PayloadAction<string>) {
      state.magazines = state.magazines?.filter((magazine) => {
        return magazine._id !== action.payload;
      });
    },

    editMagazineName(
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) {
      state.magazines = state.magazines?.map((magazine) => {
        if (magazine._id === action.payload.id) {
          return { ...magazine, name: action.payload.name };
        }
        return magazine;
      });
    },

    addSectionToMagazine(
      state,
      action: PayloadAction<{ id: string; section: MagazineSection }>
    ) {
      state.magazines = state.magazines?.map((magazine) => {
        if (magazine._id === action.payload.id) {
          return {
            ...magazine,
            sections: [...magazine.sections, action.payload.section],
          };
        }
        return magazine;
      });
    },

    removeSectionFromMagazine(
      state,
      action: PayloadAction<{ id: string; sectionId: string }>
    ) {
      state.magazines = state.magazines?.map((magazine) => {
        if (magazine._id === action.payload.id) {
          return {
            ...magazine,
            sections: magazine.sections.filter(
              (section) => section._id !== action.payload.sectionId
            ),
          };
        }
        return magazine;
      });
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

export const {
  addPostToMagazine,
  removePostFromMagazine,
  addMagazine,
  removeMagazine,
  addSectionToMagazine,
  removeSectionFromMagazine,
  editMagazineName,
} = magazineSlice.actions;
export default magazineSlice.reducer;
