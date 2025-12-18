import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, FileText, Calendar, User } from "lucide-react";
import { AppDispatch, RootState } from "@/store";
import { fetchInvoices } from "@/store/invoice/thunk";
import { CreateInvoiceModal } from "@/components/modal/CreateInvoiceModal";
import { Invoice } from "@/types/invoice";

const Invoices = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items, loading } = useSelector(
        (state: RootState) => state.invoices
    );
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        dispatch(fetchInvoices({ page: 1, limit: 10, search }));
    }, [dispatch, search]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid":
                return "bg-green-100 text-green-800";
            case "overdue":
                return "bg-red-100 text-red-800";
            default:
                return "bg-yellow-100 text-yellow-800";
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
                    <p className="text-gray-500">Manage and track your invoices</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Invoice</span>
                </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by contract or invoice #"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading invoices...</div>
                ) : items.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No invoices found. Create one to get started.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {items.map((invoice: Invoice) => (
                            <div
                                key={invoice._id}
                                className="p-4 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <FileText className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            {invoice.contractTitle}
                                        </h3>
                                        <p className="text-sm text-gray-500 flex items-center space-x-2">
                                            <span>Ref: {invoice.contractNumber}</span>
                                        </p>
                                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                Inv: {new Date(invoice.invoiceDate).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                Due: {new Date(invoice.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-6">
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500 flex items-center justify-end space-x-1">
                                            <User className="w-3 h-3" />
                                            <span>{invoice.invoicedBy}</span>
                                        </div>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(invoice.status)}`}>
                                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreateInvoiceModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};

export default Invoices;
