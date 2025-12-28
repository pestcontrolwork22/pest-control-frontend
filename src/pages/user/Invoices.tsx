
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useDispatch";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { fetchContracts, updateJobForContract } from "@/store/contract/thunk";
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
    ChevronUp
} from "lucide-react";

export default function Invoices() {
    const dispatch = useAppDispatch();
    const { items: contracts, loading, pagination } = useSelector(
        (state: RootState) => state.contracts
    );

    const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
    const [editingJobId, setEditingJobId] = useState<string | null>(null);

    const [editDates, setEditDates] = useState({
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        dispatch(fetchContracts({ page: 1, limit: 10, search: "" }));
    }, [dispatch]);

    const handlePageChange = (page: number) => {
        dispatch(fetchContracts({ page, limit: 10, search: "" }));
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
        if (expandedJobId === jobId) {
            setExpandedJobId(null);
        } else {
            setExpandedJobId(jobId);
        }
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
                        {dates.length === 0 && (
                            <div className="text-center text-gray-500 py-2 text-sm">
                                No invoices scheduled for this range.
                            </div>
                        )}
                        <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center font-bold text-gray-800 text-sm">
                            <span>Total ({dates.length} invoices)</span>
                            <span>AED {job.grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && contracts.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
                    <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-500">Manage and view invoice schedules for all jobs</p>
                </div>
            </div>

            <div className="space-y-6">
                {contracts.map((contract) => (
                    contract.jobs && contract.jobs.length > 0 && contract.jobs.map((job) => {
                        const isEditing = editingJobId === job._id;
                        const isExpanded = expandedJobId === job._id;

                        return (
                            <div key={job._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                                {/* Header Row */}
                                <div
                                    className="p-6 cursor-pointer bg-gradient-to-r from-white to-gray-50"
                                    onClick={() => toggleExpand(job._id)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-gray-900">{contract.title}</h3>
                                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                                    {contract.contractNumber}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">Job: {job.jobType}</p>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Grand Total</p>
                                                <p className="text-lg font-bold text-blue-600">AED {job.grandTotal.toFixed(2)}</p>
                                            </div>
                                            <div className={`p-2 rounded-full ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="p-6 border-t border-gray-100 bg-white animation-fade-in">
                                        <div className="flex justify-between items-start mb-6">
                                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-gray-500" />
                                                Invoice Schedule
                                            </h3>
                                            {!isEditing ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditClick(job);
                                                    }}
                                                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                    Edit Dates
                                                </button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCancelEdit();
                                                        }}
                                                        className="text-sm font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSaveInvoice(contract._id, job);
                                                        }}
                                                        className="flex items-center gap-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        Save
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Dates Section */}
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">
                                                            Invoice Start Date
                                                        </label>
                                                        {isEditing ? (
                                                            <input
                                                                type="date"
                                                                value={editDates.startDate}
                                                                onChange={(e) => setEditDates({ ...editDates, startDate: e.target.value })}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                                {formatDate(job.invoiceReminder.startDate)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">
                                                            Invoice End Date
                                                        </label>
                                                        {isEditing ? (
                                                            <input
                                                                type="date"
                                                                value={editDates.endDate}
                                                                onChange={(e) => setEditDates({ ...editDates, endDate: e.target.value })}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                                                <Clock className="w-4 h-4 text-gray-400" />
                                                                {formatDate(job.invoiceReminder.endDate)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Calculation Section */}
                                            <div>
                                                {renderPaymentSchedule(
                                                    job,
                                                    isEditing ? editDates.startDate : job.invoiceReminder.startDate,
                                                    isEditing ? editDates.endDate : job.invoiceReminder.endDate
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ))}

                {contracts.length === 0 && !loading && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No invoices found</h3>
                        <p className="text-gray-500">Create contracts and jobs to see invoices here.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="mt-8">
                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                />
            </div>
        </div>
    );
}
