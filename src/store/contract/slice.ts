import { createSlice } from "@reduxjs/toolkit";
import {
  createContract,
  createJobForContract,
  deleteContract,
  deleteJobForContract,
  fetchContractById,
  fetchContracts,
  fetchJobById,
  updateContract,
  updateJobForContract,
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
  currentJob: null,
};

const contractSlice = createSlice({
  name: "contracts",
  initialState,

  reducers: {
    clearContract(state) {
      state.single = null;
    },
    clearCurrentJob(state) {
      state.currentJob = null;
    },
  },

  extraReducers: (builder) => {
    // Fetch All Contracts
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

    // Fetch Single Contract
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

    // Create Contract
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

    // Update Contract
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
        if (state.single?._id === action.payload._id) {
          state.single = action.payload;
        }
      })
      .addCase(updateContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Contract
    builder
      .addCase(deleteContract.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteContract.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((c) => c._id !== action.payload);
        if (state.single?._id === action.payload) {
          state.single = null;
        }
      })
      .addCase(deleteContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Job for Contract
    builder
      .addCase(createJobForContract.pending, (state) => {
        state.loading = true;
      })
      .addCase(createJobForContract.fulfilled, (state, action) => {
        state.loading = false;
        if (state.single) {
          state.single = action.payload.data;
        }
      })
      .addCase(createJobForContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Job by ID
    builder
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Job for Contract
    builder
      .addCase(updateJobForContract.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateJobForContract.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;

        if (state.single && state.single.jobs) {
          const jobIndex = state.single.jobs.findIndex(
            (job) => job._id === action.payload._id
          );
          if (jobIndex !== -1) {
            state.single.jobs[jobIndex] = action.payload;
          }
        }

        // Update job in the contracts list (items)
        const contractIndex = state.items.findIndex(
          (c) => c._id === action.meta.arg.contractId
        );
        if (contractIndex !== -1) {
          const contract = state.items[contractIndex];
          if (contract.jobs) {
            const jobIndex = contract.jobs.findIndex(
              (j) => j._id === action.payload._id
            );
            if (jobIndex !== -1) {
              contract.jobs[jobIndex] = action.payload;
            }
          }
        }
      })
      .addCase(updateJobForContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Job for Contract
    builder
      .addCase(deleteJobForContract.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteJobForContract.fulfilled, (state, action) => {
        state.loading = false;

        if (state.single && state.single.jobs) {
          state.single.jobs = state.single.jobs.filter(
            (job) => job._id !== action.payload
          );
        }

        if (state.currentJob?._id === action.payload) {
          state.currentJob = null;
        }
      })
      .addCase(deleteJobForContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearContract, clearCurrentJob } = contractSlice.actions;

export default contractSlice.reducer;
