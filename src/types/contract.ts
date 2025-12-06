export interface Address {
  street1: string;
  street2: string;
  city: string;
  poBox: string;
  emirate: string;
  country: string;
}

export interface Contract {
  _id: string;
  title: string;
  aliasName: string;
  trnNumber: string;
  email: string;
  phone: string;
  mobile: string;
  address: Address;
  referredByEmployee: string;
  quoteValidityDays: number;
  creditLimit: number;
  jobs: Job[];
  remarks: string;
  createdAt?: string;
  updatedAt?: string;
  contractNumber: string;
}

export interface ContractsState {
  items: Contract[];
  single: Contract | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: any;
  currentJob: Job | null;
}

export interface Job {
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
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceReminder {
  startDate: string;
  endDate: string;
  isAdvanceInvoice: boolean;
  invoiceAfterJobsClosed: boolean;
  billingFrequency: string;
}

export interface ServicesProduct {
  serviceType: string;
  instructions: string;
  units: number;
  rate: number;
  subtotalPerYear: number;
  frequencyDays: number;
  isEveryDay: boolean;
}
