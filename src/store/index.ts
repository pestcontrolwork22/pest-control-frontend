import { configureStore } from "@reduxjs/toolkit";
import contractReducer from "./contract/slice";
import invoiceReducer from "./invoice/slice";

const store = configureStore({
  reducer: {
    contracts: contractReducer,
    invoices: invoiceReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;