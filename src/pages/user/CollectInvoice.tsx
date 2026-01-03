import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useDispatch";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { createInvoice } from "@/store/invoice/thunk";
import { fetchJobById } from "@/store/contract/thunk";
import { ArrowLeft, Briefcase, Calendar, CheckCircle2, DollarSign } from "lucide-react";

export default function CollectInvoice() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const contractId = searchParams.get("contractId");
    const jobId = searchParams.get("jobId");
    const scheduledDate = searchParams.get("scheduledDate");

    // Fetch job details
    useEffect(() => {
        if (contractId && jobId) {
            dispatch(fetchJobById({ contractId, jobId }));
        }
    }, [contractId, jobId, dispatch]);

    const { currentJob: job, loading } = useSelector((state: RootState) => state.contracts);
    const contract = useSelector((state: RootState) => state.contracts.single || state.contracts.items.find(c => c._id === contractId));

    const [formData, setFormData] = useState({
        collectionDate: new Date().toISOString().split("T")[0],
        items: [] as any[]
    });

    useEffect(() => {
        if (job) {
            const invoiceItems = job.servicesProducts.map(sp => ({
                description: sp.serviceType.replace(/_/g, ' '),
                units: sp.units,
                rate: sp.rate,
                subtotal: sp.units * sp.rate
            }));

            setFormData(prev => ({ ...prev, items: invoiceItems }));
        }
    }, [job]);

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'units' || field === 'rate') {
            newItems[index].subtotal = Number(newItems[index].units) * Number(newItems[index].rate);
        }

        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    };

    const handleSubmit = async () => {
        if (!contractId || !jobId || !scheduledDate) return;

        try {
            await dispatch(createInvoice({
                contractId,
                jobId,
                contractNumber: contract?.contractNumber,
                scheduledDate: new Date(scheduledDate).toISOString(),
                collectionDate: new Date(formData.collectionDate).toISOString(),
                items: formData.items,
                grandTotal: calculateTotal()
            })).unwrap();

            navigate('/invoices');
        } catch (error) {
            console.error("Failed to collect invoice:", error);
        }
    };

    if (loading || !job) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Preparing invoice details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-4xl mx-auto">

                {/* Navigation */}
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center text-slate-500 hover:text-indigo-600 transition-colors mb-6 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Cancel & Back
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* Header */}
                    <div className="px-6 py-6 sm:px-8 border-b border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                                    <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <DollarSign className="w-6 h-6" />
                                    </span>
                                    Collect Invoice
                                </h1>
                                <p className="text-slate-500 mt-2 text-sm">
                                    Creating payment record for <span className="font-semibold text-slate-700">{contract?.title}</span>
                                </p>
                            </div>
                            <div className="self-start">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
                                    {contract?.contractNumber}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-8">

                        {/* Dates Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Read-Only Scheduled Date */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Original Schedule</span>
                                <div className="flex items-center gap-3 text-slate-700">
                                    <Calendar className="w-5 h-5 text-slate-400" />
                                    <span className="text-lg font-semibold">{new Date(scheduledDate!).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                </div>
                            </div>

                            {/* Editable Collection Date */}
                            <div className="p-4 rounded-xl bg-white border-2 border-indigo-100 hover:border-indigo-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm">
                                <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 block">Actual Collection Date</label>
                                <input
                                    type="date"
                                    value={formData.collectionDate}
                                    onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
                                    className="w-full text-lg font-semibold text-slate-900 outline-none bg-transparent cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Line Items Table */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                <Briefcase className="w-4 h-4 text-indigo-600" />
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Invoice Line Items</h3>
                            </div>

                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                {/* Table Header (Hidden on Mobile) */}
                                <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                    <div className="col-span-5">Description</div>
                                    <div className="col-span-2">Units</div>
                                    <div className="col-span-2">Rate</div>
                                    <div className="col-span-3 text-right">Subtotal</div>
                                </div>

                                {/* Table Rows */}
                                <div className="divide-y divide-slate-100 bg-white">
                                    {formData.items.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50/80 transition-colors group">

                                            {/* Description Input */}
                                            <div className="col-span-1 md:col-span-5">
                                                <label className="md:hidden text-xs font-bold text-slate-400 uppercase mb-1 block">Description</label>
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                                    className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400 py-1 transition-colors"
                                                    placeholder="Service description"
                                                />
                                            </div>

                                            {/* Units Input */}
                                            <div className="col-span-1 md:col-span-2">
                                                <label className="md:hidden text-xs font-bold text-slate-400 uppercase mb-1 block">Units</label>
                                                <input
                                                    type="number"
                                                    value={item.units}
                                                    onChange={(e) => handleItemChange(idx, 'units', Number(e.target.value))}
                                                    className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none text-sm text-slate-600 py-1 transition-colors"
                                                    placeholder="0"
                                                />
                                            </div>

                                            {/* Rate Input */}
                                            <div className="col-span-1 md:col-span-2">
                                                <label className="md:hidden text-xs font-bold text-slate-400 uppercase mb-1 block">Rate</label>
                                                <div className="relative">
                                                    <span className="absolute left-0 top-1 text-slate-400 text-sm hidden group-focus-within:inline">$</span>
                                                    <input
                                                        type="number"
                                                        value={item.rate}
                                                        onChange={(e) => handleItemChange(idx, 'rate', Number(e.target.value))}
                                                        className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none text-sm text-slate-600 py-1 transition-colors"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>

                                            {/* Subtotal Display */}
                                            <div className="col-span-1 md:col-span-3 text-left md:text-right">
                                                <label className="md:hidden text-xs font-bold text-slate-400 uppercase mb-1 block">Subtotal</label>
                                                <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                                    AED {Number(item.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="text-center sm:text-left">
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Collected Amount</p>
                                <p className="text-3xl font-bold text-indigo-600 mt-1">
                                    AED {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Confirm Collection
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}