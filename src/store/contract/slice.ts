import { createSlice } from "@reduxjs/toolkit";
import {
  createContract,
  deleteContract,
  fetchContractById,
  fetchContracts,
  updateContract,
} from "./thunk";
import { ContractsState } from "@/types/contract";

const initialState: ContractsState = {
  items: [],
  single: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

const contractSlice = createSlice({
  name: "contracts",
  initialState,

  reducers: {
    clearContract(state) {
      state.single = null;
    },
  },

  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchContracts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch One
    builder
      .addCase(fetchContractById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContractById.fulfilled, (state, action) => {
        state.loading = false;
        state.single = action.payload;
      })
      .addCase(fetchContractById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create
    builder
      .addCase(createContract.pending, (state) => {
        state.loading = true;
      })
      .addCase(createContract.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update
    builder
      .addCase(updateContract.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateContract.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete
    builder
      .addCase(deleteContract.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteContract.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearContract } = contractSlice.actions;

export default contractSlice.reducer;
