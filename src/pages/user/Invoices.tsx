import { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useDispatch";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { fetchContracts, updateJobForContract, fetchContractSuggestions } from "@/store/contract/thunk";
import { clearSuggestions } from "@/store/contract/slice";
import { fetchInvoices } from "@/store/invoice/thunk";
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
    X,
    Search,
    Receipt,
    CheckCircle2,
    DollarSign,
    Briefcase
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
            month: "short",
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
            <div className="mt-6 bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-100/50 flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5" />
                        Projected Payment Schedule
                    </h4>
                    <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                        {job.invoiceReminder.billingFrequency.replace("_", " ")}
                    </span>
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 bg-slate-50 uppercase sticky top-0">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Invoice Date</th>
                                <th className="px-5 py-3 font-semibold text-right">Amount (Inc. VAT)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {dates.map((date, idx) => (
                                <tr key={idx} className="hover:bg-white transition-colors">
                                    <td className="px-5 py-3 font-medium text-slate-700">
                                        {formatDate(date.toISOString())}
                                    </td>
                                    <td className="px-5 py-3 text-right font-bold text-slate-900">
                                        AED {amountPerInvoice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <Receipt className="w-6 h-6 text-indigo-600" />
                            Invoice Management
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">
                            Track billing schedules and view collection history.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full md:w-96 relative z-20">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search contracts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                {suggestions.map((contract) => (
                                    <button
                                        key={contract._id}
                                        onClick={() => {
                                            setSearchTerm(contract.title);
                                            setShowSuggestions(false);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0 group"
                                    >
                                        <div className="font-medium text-slate-700 text-sm group-hover:text-indigo-700">{contract.title}</div>
                                        <div className="text-xs text-slate-500 group-hover:text-indigo-500">{contract.contractNumber}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Switcher (Segmented Control) */}
                <div className="inline-flex p-1.5 bg-slate-200/60 rounded-xl">
                    <button
                        onClick={() => setActiveTab('projected')}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            activeTab === 'projected'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Projected Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab('collected')}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            activeTab === 'collected'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Collected Invoices
                    </button>
                </div>

                {/* Content Area */}
                <div className="space-y-6">
                    {activeTab === 'projected' ? (
                        <>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                                    <p className="text-slate-500 font-medium">Loading schedules...</p>
                                </div>
                            ) : contracts.length === 0 ? (
                                <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-slate-300">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">No Invoices Found</h3>
                                    <p className="text-slate-500 mt-1 max-w-sm mx-auto">No active contracts with invoice reminders available matching your search.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {contracts.map((contract) => (
                                        contract.jobs.map((job) => (
                                            <div key={job._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md hover:border-indigo-100">
                                                <div className="p-6">
                                                    
                                                    {/* Top Row: Title & Value */}
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                                                        <div className="flex items-start gap-4">
                                                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hidden sm:block">
                                                                <FileText className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-bold text-slate-900">{contract.title}</h3>
                                                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                                        {contract.contractNumber}
                                                                    </span>
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                                        {job.jobType}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-left md:text-right bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none">
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contract Value</p>
                                                            <p className="text-2xl font-bold text-slate-900">AED {job.grandTotal.toLocaleString()}</p>
                                                        </div>
                                                    </div>

                                                    {/* Dates Row */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50 rounded-xl border border-slate-100">
                                                        {/* Start Date */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2 text-slate-500">
                                                                <Calendar className="w-4 h-4" />
                                                                <span className="text-xs font-bold uppercase tracking-wide">Start Date</span>
                                                            </div>
                                                            {editingJobId === job._id ? (
                                                                <input
                                                                    type="date"
                                                                    value={editDates.startDate}
                                                                    onChange={(e) => setEditDates({ ...editDates, startDate: e.target.value })}
                                                                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                                />
                                                            ) : (
                                                                <p className="text-sm font-semibold text-slate-800">
                                                                    {formatDate(job.invoiceReminder?.startDate || job.startDate)}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* End Date */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2 text-slate-500">
                                                                <Clock className="w-4 h-4" />
                                                                <span className="text-xs font-bold uppercase tracking-wide">End Date</span>
                                                            </div>
                                                            {editingJobId === job._id ? (
                                                                <input
                                                                    type="date"
                                                                    value={editDates.endDate}
                                                                    onChange={(e) => setEditDates({ ...editDates, endDate: e.target.value })}
                                                                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                                />
                                                            ) : (
                                                                <p className="text-sm font-semibold text-slate-800">
                                                                    {formatDate(job.invoiceReminder?.endDate || job.endDate)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions Footer */}
                                                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                        <button
                                                            onClick={() => toggleExpand(job._id)}
                                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                                                        >
                                                            {expandedJobId === job._id ? (
                                                                <>Hide Schedule <ChevronUp className="w-4 h-4" /></>
                                                            ) : (
                                                                <>View Schedule <ChevronDown className="w-4 h-4" /></>
                                                            )}
                                                        </button>

                                                        {editingJobId === job._id ? (
                                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                                <button
                                                                    onClick={handleCancelEdit}
                                                                    className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-white hover:border-slate-300 text-sm font-medium transition-all"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSaveInvoice(contract._id, job)}
                                                                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-sm flex items-center justify-center gap-2 transition-all"
                                                                >
                                                                    <Save className="w-4 h-4" /> Save
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleEditClick(job)}
                                                                className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                                                            >
                                                                <Edit3 className="w-4 h-4" /> Edit Dates
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Expanded Schedule */}
                                                    {expandedJobId === job._id && (
                                                        renderPaymentSchedule(
                                                            job,
                                                            editingJobId === job._id ? editDates.startDate : (job.invoiceReminder?.startDate || job.startDate),
                                                            editingJobId === job._id ? editDates.endDate : (job.invoiceReminder?.endDate || job.endDate)
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ))}
                                </div>
                            )}

                            {contracts.length > 0 && (
                                <div className="pt-4">
                                    <Pagination
                                        currentPage={pagination.page}
                                        totalPages={pagination.totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        // COLLECTED TAB
                        <div className="space-y-6">
                            {invoicesLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                                    <p className="text-slate-500 font-medium">Loading collected invoices...</p>
                                </div>
                            ) : collectedInvoices.length === 0 ? (
                                <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-slate-300">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Receipt className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">No Collected Invoices</h3>
                                    <p className="text-slate-500 mt-1 max-w-sm mx-auto">Collected invoices from the calendar will appear here.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {collectedInvoices.map((invoice: any) => (
                                        <div key={invoice._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
                                            <div className="p-6">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hidden sm:block">
                                                            <CheckCircle2 className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                                Invoice #{invoice._id.slice(-6).toUpperCase()}
                                                            </h3>
                                                            <p className="text-slate-500 text-sm mt-1 font-medium">{invoice.contractNumber}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-left md:text-right">
                                                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide mb-2">
                                                            Collected
                                                        </span>
                                                        <p className="text-2xl font-bold text-emerald-600">AED {invoice.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Scheduled Date</span>
                                                        <span className="text-sm font-semibold text-slate-700">{formatDate(invoice.scheduledDate)}</span>
                                                    </div>
                                                    <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100">
                                                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide block mb-1">Collection Date</span>
                                                        <span className="text-sm font-semibold text-emerald-800">{formatDate(invoice.collectionDate)}</span>
                                                    </div>
                                                </div>

                                                <div className="border-t border-slate-100 pt-4">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                                                        <Briefcase className="w-3 h-3" /> Line Items
                                                    </p>
                                                    <div className="space-y-2">
                                                        {invoice.items.map((item: any, idx: number) => (
                                                            <div key={idx} className="flex justify-between text-sm py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-2 rounded">
                                                                <div className="text-slate-700">
                                                                    <span className="font-medium">{item.description}</span>
                                                                    <span className="text-slate-400 ml-2 text-xs">x{item.units}</span>
                                                                </div>
                                                                <span className="font-semibold text-slate-900">AED {(item.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}