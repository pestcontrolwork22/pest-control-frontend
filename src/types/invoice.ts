export interface Invoice {
    _id: string;
    contractId: string;
    contractNumber: string;
    contractTitle: string;
    invoiceDate: string; // Date string
    dueDate: string; // Date string
    invoicedBy: string;
    status: "pending" | "paid" | "overdue";
    amount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface InvoicesState {
    items: Invoice[];
    single: Invoice | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    loading: boolean;
    error: any;
}
