import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    idToken: "",
  },
  reducers: {
    setUserToken(state, data) {
      state.idToken = data.payload;
    },
  },
});

//Exporting the dispatch functions
export const { setUserToken } = userSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectUserIdToken = (state) => state.user.idToken;

// Default export whole slice
export default userSlice;
