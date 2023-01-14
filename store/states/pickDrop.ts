import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export interface Pick {
  location: string;
  product_id: string;
  numbers: string;
}

export interface Drop {
  location: string;
  product_id: string;
  AWB: string;
}

export interface PickDrop {
  pickupPoints: Array<Pick>;
  dropPoints: Array<Drop>;
}

export interface UpdatePickPoints {
  pickPoints: Array<Pick>;
}

export interface UpdateDropPoints {
  dropPoints: Array<Drop>;
}

// Define the initial state using that type
const initialState: PickDrop = {
  pickupPoints: [],
  dropPoints: [],
};

export const pickDropSlice = createSlice({
  name: "pickDrop",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    updatePickPoints: (state, action: PayloadAction<UpdatePickPoints>) => {
      state.pickupPoints = action.payload.pickPoints;
    },

    updateDropPoints: (state, action: PayloadAction<UpdateDropPoints>) => {
      state.dropPoints = action.payload.dropPoints;
    },
  },
});

export const { updatePickPoints, updateDropPoints } = pickDropSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectPickDrop = (state: RootState) => state.form;

export default pickDropSlice;
