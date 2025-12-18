import api from "@/api/axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchInvoices = createAsyncThunk(
    "invoices/fetchAll",
    async (
        {
            page = 1,
            limit = 10,
            search = "",
        }: { page: number; limit: number; search: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.get("/invoices", {
                params: { page, limit, search },
            });
            console.log("response of invoice:", res);
            
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const createInvoice = createAsyncThunk(
    "invoices/create",
    async (formData: any, { rejectWithValue }) => {
        try {
            const res = await api.post("/invoices", formData);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);
