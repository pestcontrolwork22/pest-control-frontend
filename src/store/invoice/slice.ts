import { createSlice } from "@reduxjs/toolkit";
import { InvoiceState } from "@/types/invoice";
import { createInvoice, fetchInvoices } from "./thunk";

const initialState: InvoiceState = {
    items: [],
    currentInvoice: null,
    loading: false,
    error: null,
};

const invoiceSlice = createSlice({
    name: "invoices",
    initialState,
    reducers: {
        clearCurrentInvoice: (state) => {
            state.currentInvoice = null;
        },
    },
    extraReducers: (builder) => {
        // Create Invoice
        builder.addCase(createInvoice.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createInvoice.fulfilled, (state, action) => {
            state.loading = false;
            state.items.unshift(action.payload.data);
        });
        builder.addCase(createInvoice.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch Invoices
        builder.addCase(fetchInvoices.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchInvoices.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload.data;
        });
        builder.addCase(fetchInvoices.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});

export const { clearCurrentInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;
