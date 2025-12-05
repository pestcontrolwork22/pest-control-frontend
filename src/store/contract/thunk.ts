import api from "@/api/axios";
import { InvoiceReminder, ServicesProduct } from "@/types/contract";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchContracts = createAsyncThunk(
  "contracts/fetchAll",
  async (
    {
      page = 1,
      limit = 10,
      search = "",
    }: { page: number; limit: number; search: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.get("/contracts", {
        params: { page, limit, search },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Fetch Single Contract
export const fetchContractById = createAsyncThunk(
  "contracts/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/contracts/${id}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Create Contract
export const createContract = createAsyncThunk(
  "contracts/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post("/contracts", formData);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update Contract
export const updateContract = createAsyncThunk(
  "contracts/update",
  async (
    { id, formData }: { id: string; formData: any },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.patch(`/contracts/${id}`, formData);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Delete Contract
export const deleteContract = createAsyncThunk(
  "contracts/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/contracts/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

interface JobPayload {
  jobType: string;
  contractDate: string;
  startDate: string;
  endDate: string;
  contractedBy: string;
  expiryRemindBefore: number;
  isTaxExempt: boolean;
  invoiceReminder: InvoiceReminder;
  servicesProducts: ServicesProduct[];
  subtotal: number;
  vat: number;
  grandTotal: number;
}

export const createJobForContract = createAsyncThunk(
  "contracts/createJob",
  async (
    { contractId, jobData }: { contractId: string; jobData: JobPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post(`/contracts/${contractId}/jobs`, jobData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Something went wrong");
    }
  }
);
