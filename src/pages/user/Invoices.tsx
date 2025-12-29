import { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useDispatch";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { fetchContracts, updateJobForContract, fetchContractSuggestions } from "@/store/contract/thunk";
import { clearSuggestions } from "@/store/contract/slice";
import { fetchInvoices } from "@/store/invoice/thunk";
import { Search } from "lucide-react";
import { Job } from "@/types/contract";
import { Pagination } from "@/components/common/Pagination";
import {
    Calendar,
    Clock,
    Edit3,
    FileText,
    Save,
    Loader2,
    ChevronDown,
    ChevronUp,
    X
} from "lucide-react";

export default function Invoices() {
    const dispatch = useAppDispatch();
    const { items: contracts, loading, pagination } = useSelector(
        (state: RootState) => state.contracts
    );
    const { items: collectedInvoices, loading: invoicesLoading } = useSelector(
        (state: RootState) => (state as any).invoices || { items: [] }
    );

    const [activeTab, setActiveTab] = useState<'projected' | 'collected'>('projected');
    const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
    const [editingJobId, setEditingJobId] = useState<string | null>(null);

    const [editDates, setEditDates] = useState({
        startDate: "",
        endDate: "",
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { suggestions } = useSelector((state: RootState) => state.contracts);

    useEffect(() => {
        if (searchTerm.length >= 3) {
            dispatch(fetchContractSuggestions(searchTerm));
            setShowSuggestions(true);
        } else {
            dispatch(clearSuggestions());
            setShowSuggestions(false);
        }

        dispatch(fetchContracts({ page: 1, limit: 10, search: searchTerm }));
    }, [dispatch, searchTerm]);

    useEffect(() => {
        if (activeTab === 'collected') {
            dispatch(fetchInvoices({}));
        }
    }, [dispatch, activeTab]);

    const handlePageChange = (page: number) => {
        dispatch(fetchContracts({ page, limit: 10, search: searchTerm }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleEditClick = (job: Job) => {
        setEditingJobId(job._id);
        setEditDates({
            startDate: new Date(job.invoiceReminder.startDate).toISOString().split("T")[0],
            endDate: new Date(job.invoiceReminder.endDate).toISOString().split("T")[0],
        });
        setExpandedJobId(job._id);
    };

    const handleCancelEdit = () => {
        setEditingJobId(null);
        setEditDates({ startDate: "", endDate: "" });
    };

    const handleSaveInvoice = async (contractId: string, job: Job) => {
        try {
            await dispatch(
                updateJobForContract({
                    contractId,
                    jobId: job._id,
                    updates: {
                        invoiceReminder: {
                            ...job.invoiceReminder,
                            startDate: new Date(editDates.startDate),
                            endDate: new Date(editDates.endDate),
                        },
                    },
                })
            ).unwrap();
            setEditingJobId(null);
        } catch (error) {
            console.error("Failed to update invoice dates:", error);
        }
    };

    const toggleExpand = (jobId: string) => {
        setExpandedJobId(expandedJobId === jobId ? null : jobId);
    };

    const renderPaymentSchedule = (job: Job, currentStart: string, currentEnd: string) => {
        const start = new Date(currentStart);
        const end = new Date(currentEnd);
        let current = new Date(start);

        let months = 1;
        switch (job.invoiceReminder.billingFrequency) {
            case "monthly": months = 1; break;
            case "quarterly": months = 3; break;
            case "semi_annually": months = 6; break;
            case "annually": months = 12; break;
        }

        const dates = [];
        if (start <= end && months > 0) {
            let count = 0;
            while (current <= end && count < 50) {
                dates.push(new Date(current));
                current.setMonth(current.getMonth() + months);
                count++;
            }
        }

        const amountPerInvoice = dates.length > 0 ? job.grandTotal / dates.length : 0;

        return (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider flex items-center justify-between">
                    <span>Projected Payment Schedule</span>
                    <span className="text-xs normal-case bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Frequency: {job.invoiceReminder.billingFrequency.replace("_", " ")}
                    </span>
                </h4>
                <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-2 border-b border-gray-200 pb-1">
                            <span>Invoice Date</span>
                            <span>Amount (Inc. VAT)</span>
                        </div>
                        {dates.map((date, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-gray-700">{formatDate(date.toISOString())}</span>
                                <span className="font-medium text-gray-900">AED {amountPerInvoice.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-600" />
                            Invoice Management
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Manage and track all invoice schedules and collections across contracts.
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6 relative">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by contract title or number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-1/2 pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-[51%] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                                title="Clear search"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full md:w-1/2 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                            {suggestions.map((contract) => (
                                <button
                                    key={contract._id}
                                    onClick={() => {
                                        setSearchTerm(contract.title);
                                        setShowSuggestions(false);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                                >
                                    <div className="font-semibold text-gray-900 text-sm">{contract.title}</div>
                                    <div className="text-xs text-gray-500">{contract.contractNumber}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex space-x-1 bg-gray-200 p-1 rounded-xl mb-6 w-fit">
                    <button
                        onClick={() => setActiveTab('projected')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'projected' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Projected Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab('collected')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'collected' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Collected Invoices
                    </button>
                </div>

                {activeTab === 'projected' ? (
                    <div className="space-y-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                                <p className="text-gray-500 mt-4">Loading contracts...</p>
                            </div>
                        ) : contracts.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900">No Invoices Found</h3>
                                <p className="text-gray-500">No active contracts with invoice reminders available.</p>
                            </div>
                        ) : (
                            contracts.map((contract) => (
                                contract.jobs.map((job) => (
                                    <div key={job._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-blue-50 p-3 rounded-xl">
                                                        <FileText className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900">{contract.title}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-sm font-medium text-gray-500">{contract.contractNumber}</span>
                                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                                                {job.jobType}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Value</p>
                                                    <p className="text-2xl font-bold text-gray-900">AED {job.grandTotal.toFixed(2)}</p>
                                                </div>
                                            </div>

                                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 rounded-xl p-5 border border-gray-100">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Calendar className="w-4 h-4 text-gray-500" />
                                                        <span className="text-sm font-medium text-gray-600">Start Date</span>
                                                    </div>
                                                    {editingJobId === job._id ? (
                                                        <input
                                                            type="date"
                                                            value={editDates.startDate}
                                                            onChange={(e) => setEditDates({ ...editDates, startDate: e.target.value })}
                                                            className="w-full text-sm bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                                                        />
                                                    ) : (
                                                        <p className="text-base font-semibold text-gray-900">
                                                            {formatDate(job.invoiceReminder?.startDate || job.startDate)}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Clock className="w-4 h-4 text-gray-500" />
                                                        <span className="text-sm font-medium text-gray-600">End Date</span>
                                                    </div>
                                                    {editingJobId === job._id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="date"
                                                                value={editDates.endDate}
                                                                onChange={(e) => setEditDates({ ...editDates, endDate: e.target.value })}
                                                                className="w-full text-sm bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className="text-base font-semibold text-gray-900">
                                                            {formatDate(job.invoiceReminder?.endDate || job.endDate)}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-end justify-end">
                                                    {editingJobId === job._id ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 font-medium"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleSaveInvoice(contract._id, job)}
                                                                className="flex items-center gap-1 bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-green-700 font-medium shadow-sm transition-colors"
                                                            >
                                                                <Save className="w-3 h-3" />
                                                                Save
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleEditClick(job)}
                                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-semibold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                                                        >
                                                            <Edit3 className="w-3 h-3" />
                                                            Edit Dates
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expandable Schedule */}
                                            <div className="mt-4">
                                                <button
                                                    onClick={() => toggleExpand(job._id)}
                                                    className="flex items-center gap-2 w-full justify-center text-sm font-medium text-gray-500 hover:text-gray-700 py-2 hover:bg-gray-50 rounded-lg transition-colors group"
                                                >
                                                    {expandedJobId === job._id ? (
                                                        <>
                                                            Hide Payment Schedule <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            View Payment Schedule <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                                        </>
                                                    )}
                                                </button>

                                                {expandedJobId === job._id && (
                                                    <div className="mt-4 border-t border-gray-100 pt-4 animate-in slide-in-from-top-2 duration-200">
                                                        {renderPaymentSchedule(
                                                            job,
                                                            editingJobId === job._id ? editDates.startDate : (job.invoiceReminder?.startDate || job.startDate),
                                                            editingJobId === job._id ? editDates.endDate : (job.invoiceReminder?.endDate || job.endDate)
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ))
                        )}

                        {contracts.length > 0 && (
                            <div className="mt-8">
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {invoicesLoading ? (
                            <div className="text-center py-12">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                                <p className="text-gray-500 mt-4">Loading collected invoices...</p>
                            </div>
                        ) : collectedInvoices.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900">No Collected Invoices</h3>
                                <p className="text-gray-500">Go to calendar and collect invoices from scheduled events.</p>
                            </div>
                        ) : (
                            collectedInvoices.map((invoice: any) => (
                                <div key={invoice._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                Invoice #{invoice._id.slice(-6).toUpperCase()}
                                            </h3>
                                            <p className="text-gray-500 text-sm">{invoice.contractNumber}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-green-600">AED {invoice.grandTotal.toFixed(2)}</span>
                                            <p className="text-xs text-gray-400">Collected</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Scheduled Date</p>
                                            <p className="font-semibold">{new Date(invoice.scheduledDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <p className="text-xs text-green-700 mb-1">Collection Date</p>
                                            <p className="font-semibold text-green-800">{new Date(invoice.collectionDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Items</p>
                                        <div className="space-y-2">
                                            {invoice.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                                                    <span>{item.description} <span className="text-gray-400 text-xs">x{item.units}</span></span>
                                                    <span className="font-medium">{(item.subtotal || 0).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
