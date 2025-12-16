import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useDispatch";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { deleteJobForContract, fetchJobById, updateJobForContract } from "@/store/contract/thunk";
import {
  Briefcase,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  ArrowLeft,
  Package,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle
} from "lucide-react";
import JobModal from "./modal/CreateJobModal";

export default function JobViewPage() {
  const { id: contractId, jobId } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const job = useSelector((state: RootState) => state.contracts.currentJob);
  const loading = useSelector((state: RootState) => state.contracts.loading);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (contractId && jobId) {
      dispatch(fetchJobById({ contractId, jobId }));
    }
  }, [contractId, jobId, dispatch]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await dispatch(deleteJobForContract({ contractId: contractId!, jobId: jobId! })).unwrap();
        navigate(`/contracts/${contractId}`);
      } catch (error) {
        console.error("Failed to delete job:", error);
      }
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!job || !contractId) return;
    try {
      await dispatch(
        updateJobForContract({
          contractId,
          jobId: job._id,
          updates: { status: newStatus },
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Job not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Contract</span>
          </button>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="w-8 h-8" />
                    <h1 className="text-3xl font-bold">Job Details</h1>
                  </div>
                  <p className="text-blue-100 text-sm">Job ID: {job._id}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm mb-1">Job Type</p>
                  <span className="bg-white/20 px-4 py-2 rounded-lg text-white font-semibold">
                    {job.jobType}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              {/* Status Section */}
              <div className="mb-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-full ${job.status === "work done"
                          ? "bg-green-100 text-green-600"
                          : job.status === "work informed"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                    >
                      {job.status === "work done" ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : job.status === "work informed" ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Clock className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Current Status
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Update the job status to track progress
                      </p>
                    </div>
                  </div>

                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg border-2 font-semibold outline-none cursor-pointer transition-colors ${job.status === "work done"
                        ? "border-green-200 bg-green-50 text-green-700 focus:border-green-500"
                        : job.status === "work informed"
                          ? "border-blue-200 bg-blue-50 text-blue-700 focus:border-blue-500"
                          : "border-amber-200 bg-amber-50 text-amber-700 focus:border-amber-500"
                      }`}
                  >
                    <option value="work pending">Work Pending</option>
                    <option value="work informed">Work Informed</option>
                    <option value="work done">Work Done</option>
                  </select>
                </div>
              </div>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Contract Date</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(job.contractDate)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Start Date</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(job.startDate)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border border-orange-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-orange-600 p-2 rounded-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">End Date</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(job.endDate)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Expiry Reminder</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {job.expiryRemindBefore} days before
                  </p>
                </div>
              </div>

              {/* Tax Status */}
              <div className="mb-8">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 inline-flex items-center gap-3">
                  {job.isTaxExempt ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-gray-900 font-semibold">Tax Exempt</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-gray-600" />
                      <span className="text-gray-900 font-semibold">Tax Applicable (5% VAT)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Invoice Reminder Section */}
              <div className="mb-8 bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-green-600" />
                  Invoice Reminder Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Invoice Start Date</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {formatDate(job.invoiceReminder.startDate)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 font-medium">Invoice End Date</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {formatDate(job.invoiceReminder.endDate)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 font-medium">Billing Frequency</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                      {job.invoiceReminder.billingFrequency.replace('_', ' ')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {job.invoiceReminder.isAdvanceInvoice ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Advance Invoice</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {job.invoiceReminder.invoiceAfterJobsClosed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Invoice After Jobs Closed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-6 h-6 text-gray-700" />
                  <h3 className="text-2xl font-bold text-gray-900">Services & Products</h3>
                </div>

                <div className="space-y-4">
                  {job.servicesProducts.map((service, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 capitalize">
                              {service.serviceType.replace(/_/g, ' ')}
                            </h4>
                            {service.instructions && (
                              <p className="text-sm text-gray-600 mt-1">{service.instructions}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-gray-600">Rate</span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            AED {service.rate.toFixed(2)}
                          </span>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-gray-600">Units</span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {service.units}
                          </span>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span className="text-xs text-gray-600">Frequency</span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {service.isEveryDay
                              ? 'Daily'
                              : `Every ${service.frequencyDays} ${service.frequencyUnit}${service.frequencyDays > 1 ? 's' : ''}`
                            }
                          </span>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-gray-600">Subtotal/Year</span>
                          </div>
                          <span className="font-bold text-blue-600">
                            AED {service.subtotalPerYear.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  Financial Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-700 font-medium">Subtotal:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      AED {job.subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-700 font-medium">
                      VAT (5%):
                      {job.isTaxExempt && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                          EXEMPT
                        </span>
                      )}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      AED {job.vat.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-4 bg-gradient-to-r from-blue-100 to-indigo-100 px-6 rounded-lg">
                    <span className="text-lg font-bold text-gray-900">Grand Total:</span>
                    <span className="text-3xl font-bold text-blue-600">
                      AED {job.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Edit3 className="w-5 h-5" />
                  Edit Job
                </button>

                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Job
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Job Modal */}
      {job && (
        <JobModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          contractId={contractId!}
          job={job}
          mode="edit"
        />
      )}
    </>
  );
}