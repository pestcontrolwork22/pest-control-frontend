import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useDispatch";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { createInvoice } from "@/store/invoice/thunk";
import { fetchJobById } from "@/store/contract/thunk";
import { ArrowLeft, Save, Briefcase, FileText, Calendar } from "lucide-react";

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
        return <div className="p-8 text-center text-gray-500">Loading invoice details...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-blue-600 p-8 text-white">
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <FileText className="w-8 h-8" />
                            Collect Invoice
                        </h1>
                        <p className="text-blue-100 mt-2">
                            Generate and record invoice for {contract?.title} ({contract?.contractNumber})
                        </p>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Header Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
                                    Scheduled Date
                                </label>
                                <div className="flex items-center gap-2 font-semibold text-gray-900">
                                    <Calendar className="w-5 h-5 text-blue-500" />
                                    {new Date(scheduledDate!).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
                                    Collection Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.collectionDate}
                                    onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
                                    className="w-full bg-white border border-gray-300 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Line Items */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-gray-500" />
                                Service Details
                            </h3>

                            <div className="space-y-4">
                                {formData.items.map((item, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                            <div className="md:col-span-1">
                                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Service Name</label>
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Units</label>
                                                <input
                                                    type="number"
                                                    value={item.units}
                                                    onChange={(e) => handleItemChange(idx, 'units', Number(e.target.value))}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Rate</label>
                                                <input
                                                    type="number"
                                                    value={item.rate}
                                                    onChange={(e) => handleItemChange(idx, 'rate', Number(e.target.value))}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Subtotal</label>
                                                <input
                                                    type="number"
                                                    value={item.subtotal}
                                                    onChange={(e) => handleItemChange(idx, 'subtotal', Number(e.target.value))}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-bold text-blue-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer / Total */}
                        <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-right w-full md:w-auto ml-auto">
                                <p className="text-sm text-gray-500 mb-1 uppercase font-semibold">Grand Total</p>
                                <p className="text-3xl font-bold text-blue-600">AED {calculateTotal().toFixed(2)}</p>
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                            >
                                <Save className="w-6 h-6" />
                                Save Collected Invoice
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
