import { configureStore } from "@reduxjs/toolkit";
import contractReducer from "./contract/slice";

const store = configureStore({
  reducer: {
    contracts: contractReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;