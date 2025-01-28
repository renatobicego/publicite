import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserType } from "@/types/userTypes";

export interface UserState {
  usernameLogged: string | null | undefined;
  userIdLogged: string | undefined;
  clerkIdLogged: string | undefined;
  userTypeLogged?: UserType;
}

const initialState: UserState = {
  usernameLogged: null,
  userIdLogged: undefined,
  clerkIdLogged: undefined,
  userTypeLogged: undefined,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
