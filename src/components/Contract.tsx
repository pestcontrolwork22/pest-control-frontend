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
} from "lucide-react";
import { AddContractModal } from "./modal/AddContractModal";
import { Pagination } from "./common/Pagination";
import type { RootState, AppDispatch } from "@/store";
import {
  createContract,
  deleteContract,
  fetchContracts,
  updateContract,
} from "@/store/contract/thunk";
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
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Fetch contracts when component mounts or dependencies change
  useEffect(() => {
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
      // Optional: Add toast notification for success
    } catch (err) {
      console.error("Failed to create contract:", err);
      // Optional: Add toast notification for error
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Contracts</h1>
          <p className="text-gray-600 mt-1">Manage all your client contracts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Add Contract</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-semibold">Error</h3>
            <p className="text-red-700 text-sm">
              {typeof error === "string"
                ? error
                : (error as any)?.message || "An error occurred"}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center space-x-2 transition">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading contracts...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Contracts Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Contract Number
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No contracts found. Click "Add Contract" to create one.
                      </td>
                    </tr>
                  ) : (
                    items.map((contract: Contract) => (
                      <tr
                        key={contract._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {contract.contractNumber}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {contract.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {contract.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {contract.phone}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleViewContract(contract._id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(contract)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteConfirm(contract)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 border-t border-gray-100">
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

      {/* Add Modal */}
      {showAddModal && (
        <AddContractModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddContract}
        />
      )}

      {/* Edit Modal */}
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

      {/* Delete Confirmation Modal */}
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

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({
  contract,
  onClose,
  onConfirm,
}: {
  contract: any;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-red-100 p-3 rounded-full">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Delete Contract</h2>
      </div>
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete{" "}
        <span className="font-semibold">{contract?.title}</span>? This action
        cannot be undone.
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);
