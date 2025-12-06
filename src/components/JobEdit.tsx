import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useDispatch";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { fetchJobById, updateJobForContract } from "@/store/contract/thunk";
import { ArrowLeft, Save, Plus, Trash2, DollarSign } from "lucide-react";
import { ServicesProduct } from "@/types/contract";

export default function JobEditPage() {
  const { id: contractId, jobId } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const job = useSelector((state: RootState) => state.contracts.currentJob);
  const loading = useSelector((state: RootState) => state.contracts.loading);

  const [formData, setFormData] = useState({
    jobType: "",
    contractDate: "",
    startDate: "",
    endDate: "",
    contractedBy: "",
    expiryRemindBefore: 30,
    isTaxExempt: false,
    invoiceReminder: {
      startDate: "",
      endDate: "",
      isAdvanceInvoice: false,
      invoiceAfterJobsClosed: false,
      billingFrequency: "monthly",
    },
    servicesProducts: [] as ServicesProduct[],
  });

  const [employees] = useState([
    { id: "emp1", name: "John Doe" },
    { id: "emp2", name: "Jane Smith" },
    { id: "emp3", name: "Ahmed Ali" },
    { id: "emp4", name: "Sara Mohammed" },
  ]);

  const serviceTypes = [
    { value: "building_cleaning", label: "Building Cleaning Service" },
    {
      value: "tanks_containers_cleaning",
      label: "Tanks & Containers Cleaning Services",
    },
    {
      value: "disinfection_sterilization",
      label: "Disinfection & Sterilization Services",
    },
    { value: "pest_control", label: "Public Health Pests Control Services" },
  ];

  const billingFrequencies = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "semi_annually", label: "Semi-Annually" },
    { value: "annually", label: "Annually" },
  ];

  useEffect(() => {
    if (contractId && jobId) {
      dispatch(fetchJobById({ contractId, jobId }));
    }
  }, [contractId, jobId, dispatch]);

  useEffect(() => {
    if (job) {
      setFormData({
        jobType: job.jobType,
        contractDate: job.contractDate.split("T")[0],
        startDate: job.startDate.split("T")[0],
        endDate: job.endDate.split("T")[0],
        contractedBy: job.contractedBy,
        expiryRemindBefore: job.expiryRemindBefore,
        isTaxExempt: job.isTaxExempt,
        invoiceReminder: {
          startDate: job.invoiceReminder.startDate.split("T")[0],
          endDate: job.invoiceReminder.endDate.split("T")[0],
          isAdvanceInvoice: job.invoiceReminder.isAdvanceInvoice,
          invoiceAfterJobsClosed: job.invoiceReminder.invoiceAfterJobsClosed,
          billingFrequency: job.invoiceReminder.billingFrequency,
        },
        servicesProducts: job.servicesProducts,
      });
    }
  }, [job]);

  const calculateTotals = () => {
    const subtotal = formData.servicesProducts.reduce(
      (sum, service) => sum + service.subtotalPerYear,
      0
    );
    const vat = formData.isTaxExempt ? 0 : subtotal * 0.05;
    const grandTotal = subtotal + vat;
    return { subtotal, vat, grandTotal };
  };

  const { subtotal, vat, grandTotal } = calculateTotals();

  const updateService = (index: number, field: keyof ServicesProduct, value: any) => {
    const updated = [...formData.servicesProducts];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "units" || field === "rate") {
      updated[index].subtotalPerYear = updated[index].units * updated[index].rate;
    }

    setFormData({ ...formData, servicesProducts: updated });
  };

  const addService = () => {
    setFormData({
      ...formData,
      servicesProducts: [
        ...formData.servicesProducts,
        {
          serviceType: "building_cleaning",
          instructions: "",
          units: 1,
          rate: 0,
          subtotalPerYear: 0,
          frequencyDays: 30,
          isEveryDay: false,
        },
      ],
    });
  };

  const removeService = (index: number) => {
    if (formData.servicesProducts.length > 1) {
      const updated = formData.servicesProducts.filter((_, i) => i !== index);
      setFormData({ ...formData, servicesProducts: updated });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updates = {
        ...formData,
        subtotal,
        vat,
        grandTotal,
      };
      
      await dispatch(
        updateJobForContract({
          contractId: contractId!,
          jobId: jobId!,
          updates,
        })
      ).unwrap();
      
      navigate(`/contracts/${contractId}/jobs/${jobId}`);
    } catch (error) {
      console.error("Failed to update job:", error);
      alert("Failed to update job. Please try again.");
    }
  };

  if (loading || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Title Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h1 className="text-3xl font-bold">Edit Job</h1>
            <p className="text-blue-100 text-sm mt-2">Job ID: {job._id}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* Basic Job Info */}
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type *
                  </label>
                  <select
                    value={formData.jobType}
                    onChange={(e) =>
                      setFormData({ ...formData, jobType: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="recurring">Recurring</option>
                    <option value="one_off">One Off</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Date *
                  </label>
                  <input
                    type="date"
                    value={formData.contractDate}
                    onChange={(e) =>
                      setFormData({ ...formData, contractDate: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contracted By *
                  </label>
                  <select
                    value={formData.contractedBy}
                    onChange={(e) =>
                      setFormData({ ...formData, contractedBy: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Remind Before (Days)
                  </label>
                  <input
                    type="number"
                    value={formData.expiryRemindBefore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expiryRemindBefore: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isTaxExempt}
                    onChange={(e) =>
                      setFormData({ ...formData, isTaxExempt: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Tax Exempt</span>
                </label>
              </div>
            </div>

            {/* Invoice Reminder */}
            <div className="bg-green-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Reminder</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.invoiceReminder.startDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        invoiceReminder: {
                          ...formData.invoiceReminder,
                          startDate: e.target.value,
                        },
                      })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <label className="flex items-center space-x-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.invoiceReminder.isAdvanceInvoice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          invoiceReminder: {
                            ...formData.invoiceReminder,
                            isAdvanceInvoice: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Advance Invoice</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.invoiceReminder.endDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        invoiceReminder: {
                          ...formData.invoiceReminder,
                          endDate: e.target.value,
                        },
                      })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <label className="flex items-center space-x-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.invoiceReminder.invoiceAfterJobsClosed}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          invoiceReminder: {
                            ...formData.invoiceReminder,
                            invoiceAfterJobsClosed: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Invoice After Jobs Closed</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Frequency *
                  </label>
                  <select
                    value={formData.invoiceReminder.billingFrequency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        invoiceReminder: {
                          ...formData.invoiceReminder,
                          billingFrequency: e.target.value,
                        },
                      })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {billingFrequencies.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Services Section */}
            <div className="bg-purple-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Services & Products</h3>
                <button
                  type="button"
                  onClick={addService}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Service
                </button>
              </div>

              <div className="space-y-4">
                {formData.servicesProducts.map((service, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-5 border-2 border-purple-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-gray-700">
                        Service #{index + 1}
                      </span>
                      {formData.servicesProducts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      <div className="lg:col-span-7">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Type *
                        </label>
                        <select
                          value={service.serviceType}
                          onChange={(e) =>
                            updateService(index, "serviceType", e.target.value)
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          {serviceTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>

                        <label className="block text-sm font-medium text-gray-700 mb-2 mt-3">
                          Instructions
                        </label>
                        <textarea
                          value={service.instructions}
                          onChange={(e) =>
                            updateService(index, "instructions", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          rows={3}
                          placeholder="Enter service instructions..."
                        />
                      </div>

                      <div className="lg:col-span-5 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Units *
                            </label>
                            <input
                              type="number"
                              value={service.units}
                              onChange={(e) =>
                                updateService(index, "units", parseFloat(e.target.value) || 0)
                              }
                              required
                              min="0"
                              step="0.01"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Rate (AED) *
                            </label>
                            <input
                              type="number"
                              value={service.rate}
                              onChange={(e) =>
                                updateService(index, "rate", parseFloat(e.target.value) || 0)
                              }
                              required
                              min="0"
                              step="0.01"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Subtotal (1 Year)
                          </label>
                          <div className="bg-gray-100 px-2 py-1 rounded border border-gray-300 text-sm font-semibold text-gray-900">
                            AED {service.subtotalPerYear.toFixed(2)}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Frequency (Days)
                          </label>
                          <input
                            type="number"
                            value={service.frequencyDays}
                            onChange={(e) =>
                              updateService(index, "frequencyDays", parseInt(e.target.value) || 1)
                            }
                            min="1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={service.isEveryDay}
                            onChange={(e) =>
                              updateService(index, "isEveryDay", e.target.checked)
                            }
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span className="text-sm text-gray-700">Every Day</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Financial Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">Subtotal:</span>
                  <span className="text-xl font-bold text-gray-900">
                    AED {subtotal.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">
                    VAT (5%):
                    {formData.isTaxExempt && (
                      <span className="ml-2 text-xs text-green-600 font-semibold">TAX EXEMPT</span>
                    )}
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    AED {vat.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 bg-blue-100 px-4 rounded-lg">
                  <span className="text-lg font-bold text-gray-900">Grand Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    AED {grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}