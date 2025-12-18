import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { AppDispatch, RootState } from "@/store";
import { fetchContracts } from "@/store/contract/thunk";
import { createInvoice } from "@/store/invoice/thunk";
import { Contract } from "@/types/contract";

interface CreateInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateInvoiceModal = ({
    isOpen,
    onClose,
}: CreateInvoiceModalProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { items: contracts } = useSelector(
        (state: RootState) => state.contracts
    );

    const [formData, setFormData] = useState({
        contractId: "",
        contractNumber: "",
        contractTitle: "",
        invoiceDate: "",
        dueDate: "",
        invoicedBy: "",
    });

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchContracts({ page: 1, limit: 100, search: "" }));
        }
    }, [dispatch, isOpen]);

    const handleContractChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const contractId = e.target.value;
        const contract = contracts.find((c: Contract) => c._id === contractId);

        if (contract) {
            // Default invoice date to contract start date (first job's start date)
            const startDate = contract.jobs?.[0]?.startDate
                ? new Date(contract.jobs[0].startDate).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0];

            setFormData({
                ...formData,
                contractId: contract._id!,
                contractNumber: contract.contractNumber,
                contractTitle: contract.title,
                invoiceDate: startDate,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await dispatch(createInvoice(formData));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Create New Invoice</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Contract Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Contract</label>
                        <select
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.contractId}
                            onChange={handleContractChange}
                        >
                            <option value="">Select a Contract</option>
                            {contracts.map((contract: Contract) => (
                                <option key={contract._id} value={contract._id}>
                                    {contract.title} ({contract.contractNumber})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Reference Display */}
                    {formData.contractNumber && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                                <span className="font-semibold">Reference:</span> {formData.contractNumber}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {/* Invoice Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Invoiced Date
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    required
                                    className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.invoiceDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, invoiceDate: e.target.value })
                                    }
                                />
                                <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                            </div>
                        </div>

                        {/* Due Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Due Date
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    required
                                    className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.dueDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, dueDate: e.target.value })
                                    }
                                />
                                <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                            </div>
                        </div>
                    </div>

                    {/* Invoiced By */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Invoiced By
                        </label>
                        <select
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.invoicedBy}
                            onChange={(e) =>
                                setFormData({ ...formData, invoicedBy: e.target.value })
                            }
                        >
                            <option value="">Select User</option>
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Staff">Staff</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                        >
                            Create Invoice
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
