import { createSlice } from "@reduxjs/toolkit";
import { fetchInvoices, createInvoice } from "./thunk";
import { InvoicesState } from "@/types/invoice";

const initialState: InvoicesState = {
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

const invoiceSlice = createSlice({
    name: "invoices",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch Invoices
        builder
            .addCase(fetchInvoices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInvoices.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchInvoices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Create Invoice
        builder
            .addCase(createInvoice.pending, (state) => {
                state.loading = true;
            })
            .addCase(createInvoice.fulfilled, (state, action) => {
                state.loading = false;
                state.items.unshift(action.payload);
            })
            .addCase(createInvoice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default invoiceSlice.reducer;
