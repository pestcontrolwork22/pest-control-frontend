import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Loader2,
  X,
  FileText
} from "lucide-react";
import { AddContractModal } from "./modal/AddContractModal";
import { Pagination } from "./common/Pagination";
import type { RootState, AppDispatch } from "@/store";
import {
  createContract,
  deleteContract,
  fetchContracts,
  updateContract,
  fetchContractSuggestions
} from "@/store/contract/thunk";
import { clearSuggestions } from "@/store/contract/slice";
import { useNavigate } from "react-router-dom";
import { Contract } from "@/types/contract";

export const Contracts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, pagination, loading, error } = useSelector(
    (state: RootState) => state.contracts
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions } = useSelector((state: RootState) => state.contracts);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Fetch contracts when component mounts or dependencies change
  useEffect(() => {
    if (searchTerm.length >= 3) {
      dispatch(fetchContractSuggestions(searchTerm));
      setShowSuggestions(true);
    } else {
      dispatch(clearSuggestions());
      setShowSuggestions(false);
    }

    dispatch(
      fetchContracts({
        page: currentPage,
        limit: 5,
        search: searchTerm,
      })
    );
  }, [dispatch, currentPage, searchTerm]);

  // Handle create contract
  const handleAddContract = async (formData: any) => {
    try {
      await dispatch(createContract(formData)).unwrap();
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to create contract:", err);
    }
  };

  // Handle update contract
  const handleEditContract = async (formData: any) => {
    try {
      await dispatch(
        updateContract({
          id: selectedContract._id,
          formData,
        })
      ).unwrap();
      setShowEditModal(false);
      setSelectedContract(null);
    } catch (err) {
      console.error("Failed to update contract:", err);
    }
  };

  // Handle delete contract
  const handleDeleteContract = async () => {
    try {
      await dispatch(deleteContract(selectedContract._id)).unwrap();
      setShowDeleteConfirm(false);
      setSelectedContract(null);
    } catch (err) {
      console.error("Failed to delete contract:", err);
    }
  };

  const openEditModal = (contract: any) => {
    setSelectedContract(contract);
    setShowEditModal(true);
  };

  const openDeleteConfirm = (contract: any) => {
    setSelectedContract(contract);
    setShowDeleteConfirm(true);
  };

  const handleViewContract = (contractId: string) => {
    navigate(`/contracts/${contractId}`);
  };

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contracts</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage and track all your client agreements.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-indigo-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Contract</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3 animate-pulse">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-semibold text-sm">Unable to load contracts</h3>
            <p className="text-red-600 text-xs mt-1">
              {typeof error === "string"
                ? error
                : (error as any)?.message || "Please check your connection and try again."}
            </p>
          </div>
        </div>
      )}

      {/* Toolbar (Search & Filter) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">

          {/* Search Input Group */}
          <div className="flex-1 relative z-20">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-indigo-500" />
              <input
                type="text"
                placeholder="Search by contract number or client..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                <div className="p-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  Suggested Results
                </div>
                {suggestions.map((contract) => (
                  <button
                    key={contract._id}
                    onClick={() => {
                      setSearchTerm(contract.title);
                      setShowSuggestions(false);
                      setCurrentPage(1);
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

          {/* Filter Button */}
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-20 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading contracts data...</p>
        </div>
      ) : (
        <>
          {/* Empty State */}
          {items.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center mb-5 ring-8 ring-slate-50">
                  <FileText className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-semibold text-lg mb-2">No contracts found</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                  Try adjusting your search terms or create a new contract to get started.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Contract
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {items.map((contract: Contract) => (
                  <div
                    key={contract._id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {contract.title.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">{contract.title}</h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 mt-1">
                            {contract.contractNumber}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-100">
                        Active
                      </span>
                    </div>

                    {/* Card Details */}
                    <div className="space-y-2 mb-4 bg-slate-50/50 rounded-lg p-3 border border-slate-100">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="font-medium text-slate-400 text-xs w-14">Email</span>
                        <span className="text-slate-700 truncate flex-1">{contract.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="font-medium text-slate-400 text-xs w-14">Phone</span>
                        <span className="text-slate-700">{contract.phone}</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleViewContract(contract._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-50 text-indigo-600 font-medium text-xs rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => openEditModal(contract)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-50 text-emerald-600 font-medium text-xs rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(contract)}
                        className="p-2.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contract ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Client / Title</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Info</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((contract: Contract) => (
                        <tr key={contract._id} className="group hover:bg-indigo-50/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                              {contract.contractNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm mr-3 shadow-sm">
                                {contract.title.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900">{contract.title}</div>
                                <div className="text-xs text-slate-500">Business Client</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-0.5">
                              <span className="text-sm text-slate-700">{contract.email}</span>
                              <span className="text-xs text-slate-400">{contract.phone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex justify-center items-center gap-1">
                              <button
                                onClick={() => handleViewContract(contract._id)}
                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(contract)}
                                className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <div className="w-px h-4 bg-slate-200 mx-1"></div>
                              <button
                                onClick={() => openDeleteConfirm(contract)}
                                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Footer */}
              {pagination.totalPages > 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4 mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* --- Modals --- */}

      {showAddModal && (
        <AddContractModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddContract}
        />
      )}

      {showEditModal && selectedContract && (
        <AddContractModal
          onClose={() => {
            setShowEditModal(false);
            setSelectedContract(null);
          }}
          onSubmit={handleEditContract}
          initialData={selectedContract}
          isEdit={true}
        />
      )}

      {showDeleteConfirm && selectedContract && (
        <DeleteConfirmModal
          contract={selectedContract}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedContract(null);
          }}
          onConfirm={handleDeleteContract}
        />
      )}
    </div>
  );
};

// --- Sub-components ---

const DeleteConfirmModal = ({
  contract,
  onClose,
  onConfirm,
}: {
  contract: any;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

    {/* Modal Content */}
    <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Delete Contract?</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-slate-800">{contract?.title}</span>?
          <br />This action cannot be undone.
        </p>

        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);