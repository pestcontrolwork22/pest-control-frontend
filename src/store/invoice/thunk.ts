import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axios";
import { InvoiceCollection } from "@/types/invoice";

export const createInvoice = createAsyncThunk(
    "invoices/create",
    async (payload: Partial<InvoiceCollection>, { rejectWithValue }) => {
        try {
            const response = await axios.post("/invoices", payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchInvoices = createAsyncThunk(
    "invoices/fetchAll",
    async (filters: any, { rejectWithValue }) => {
        try {
            const response = await axios.get("/invoices", { params: filters });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const checkInvoiceStatus = createAsyncThunk(
    "invoices/checkStatus",
    async ({ contractId, jobId, scheduledDate }: { contractId: string, jobId: string, scheduledDate: string }, { rejectWithValue }) => {
        try {
            const response = await axios.get("/invoices/status", {
                params: { contractId, jobId, scheduledDate }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);
