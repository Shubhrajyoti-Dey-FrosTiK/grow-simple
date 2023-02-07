import { createSlice } from "@reduxjs/toolkit";

export const simulationSlice = createSlice({
  name: "simulation",
  initialState: {
    play: true,
  },
  reducers: {
    trigger: (state) => {
      state.play = !state.play;
    },
  },
});

//Exporting the dispatch functions
export const { trigger } = simulationSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectSimulation = (state) => state.simulation.play;

// Default export whole slice
export default simulationSlice;
