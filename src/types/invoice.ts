export interface InvoiceItem {
    description: string;
    units: number;
    rate: number;
    subtotal: number;
}

export interface InvoiceCollection {
    _id: string;
    contractId: string;
    jobId: string;
    contractNumber?: string;

    scheduledDate: string;
    collectionDate: string;

    items: InvoiceItem[];
    grandTotal: number;

    createdAt: string;
    updatedAt: string;
}

export interface InvoiceState {
    items: InvoiceCollection[];
    currentInvoice: InvoiceCollection | null;
    loading: boolean;
    error: any;
}
