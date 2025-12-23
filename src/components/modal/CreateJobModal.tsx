import { useState, useEffect } from "react";
import { X, Plus, Trash2, DollarSign } from "lucide-react";
import { useAppDispatch } from "@/hooks/useDispatch";
import { createJobForContract, updateJobForContract } from "@/store/contract/thunk";
import { Job } from "@/types/contract";

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  job?: Job | null;
  mode: "create" | "edit";
}

export default function JobModal({
  isOpen,
  onClose,
  contractId,
  job = null,
  mode = "create"
}: JobModalProps) {
  const [formData, setFormData] = useState<{
    jobType: string;
    contractDate: string;
    startDate: string;
    endDate: string;
    contractedBy: string;
    dayType: string;
    expiryRemindBefore: number | string;
    isTaxExempt: boolean;
    invoiceReminder: {
      startDate: string;
      endDate: string;
      isAdvanceInvoice: boolean;
      invoiceAfterJobsClosed: boolean;
      billingFrequency: string;
    };
    servicesProducts: Array<{
      serviceType: string;
      instructions: string;
      units: number | string;
      rate: number | string;
      subtotalPerYear: number;
      frequencyDays: number | string;
      frequencyUnit: "day" | "week" | "month" | "year";
      isEveryDay: boolean;
    }>;
  }>({
    jobType: "recurring",
    contractDate: "",
    startDate: "",
    endDate: "",
    contractedBy: "",
    dayType: "day",
    expiryRemindBefore: 30,
    isTaxExempt: false,
    invoiceReminder: {
      startDate: "",
      endDate: "",
      isAdvanceInvoice: false,
      invoiceAfterJobsClosed: false,
      billingFrequency: "monthly",
    },
    servicesProducts: [
      {
        serviceType: "building_cleaning",
        instructions: "",
        units: 1,
        rate: 0,
        subtotalPerYear: 0,
        frequencyDays: 1,
        frequencyUnit: "month",
        isEveryDay: false,
      },
    ],
  });

  const [employees] = useState([
    { id: "emp1", name: "Manzoor" },
    { id: "emp2", name: "Rafi" },
    { id: "emp3", name: "Sabith" },
    { id: "emp4", name: "Shakir" },
    { id: "emp5", name: "Shanu" },
    { id: "emp6", name: "Aboobaker" },
    { id: "emp7", name: "Faijas" },
    { id: "emp8", name: "Shareef" },
    { id: "emp9", name: "Ahil" },
    { id: "emp10", name: "Huwaiz" },
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

  const dispatch = useAppDispatch();

  // Load job data when in edit mode
  useEffect(() => {
    if (mode === "edit" && job) {
      setFormData({
        jobType: job.jobType,
        contractDate: job.contractDate.split("T")[0],
        startDate: job.startDate.split("T")[0],
        endDate: job.endDate.split("T")[0],
        contractedBy: job.contractedBy,
        dayType: job.dayType || "day",
        expiryRemindBefore: job.expiryRemindBefore,
        isTaxExempt: job.isTaxExempt,
        invoiceReminder: {
          startDate: job.invoiceReminder.startDate.split("T")[0],
          endDate: job.invoiceReminder.endDate.split("T")[0],
          isAdvanceInvoice: job.invoiceReminder.isAdvanceInvoice,
          invoiceAfterJobsClosed: job.invoiceReminder.invoiceAfterJobsClosed,
          billingFrequency: job.invoiceReminder.billingFrequency,
        },
        servicesProducts: job.servicesProducts.map(s => ({
          ...s,
          frequencyUnit: s.frequencyUnit || "month"
        })),
      });
    } else if (mode === "create") {
      // Reset form for create mode
      setFormData({
        jobType: "recurring",
        contractDate: "",
        startDate: "",
        endDate: "",
        contractedBy: "",
        dayType: "day",
        expiryRemindBefore: 30,
        isTaxExempt: false,
        invoiceReminder: {
          startDate: "",
          endDate: "",
          isAdvanceInvoice: false,
          invoiceAfterJobsClosed: false,
          billingFrequency: "monthly",
        },
        servicesProducts: [
          {
            serviceType: "building_cleaning",
            instructions: "",
            units: 1,
            rate: 0,
            subtotalPerYear: 0,
            frequencyDays: 1,
            frequencyUnit: "month",
            isEveryDay: false,
          },
        ],
      });
    }
  }, [mode, job]);

  // Calculate totals
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

  // Update service/product
  const updateService = (index: number, field: string, value: any) => {
    const updated = [...formData.servicesProducts];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calculate subtotal per year based on frequency
    if (field === "units" || field === "rate" || field === "frequencyDays" || field === "frequencyUnit" || field === "isEveryDay") {
      const service = updated[index];
      const units = Number(service.units) || 0;
      const rate = Number(service.rate) || 0;
      const freq = Number(service.frequencyDays) || 1;

      let occurrencesPerYear;

      if (service.isEveryDay) {
        // "Every" checked: Interval logic (Every X Days/Weeks/Months/Years)
        if (service.frequencyUnit === "day") {
          occurrencesPerYear = 365 / freq;
        } else if (service.frequencyUnit === "week") {
          occurrencesPerYear = 52 / freq;
        } else if (service.frequencyUnit === "month") {
          occurrencesPerYear = 12 / freq;
        } else if (service.frequencyUnit === "year") {
          occurrencesPerYear = 1 / freq;
        } else {
          occurrencesPerYear = 12 / freq;
        }
      } else {
        // "Every" NOT checked: Frequency logic (X times per Day/Week/Month/Year)
        if (service.frequencyUnit === "day") {
          // X times per day
          occurrencesPerYear = freq * 365;
        } else if (service.frequencyUnit === "week") {
          // X times per week
          occurrencesPerYear = freq * 52;
        } else if (service.frequencyUnit === "month") {
          // X times per month
          occurrencesPerYear = freq * 12;
        } else if (service.frequencyUnit === "year") {
          // X times per year
          occurrencesPerYear = freq * 1;
        } else {
          occurrencesPerYear = freq * 12;
        }
      }

      updated[index].subtotalPerYear =
        units * rate * occurrencesPerYear;
    }

    setFormData({ ...formData, servicesProducts: updated });
  };

  // Add new service
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
          frequencyDays: 1,
          frequencyUnit: "month",
          isEveryDay: false,
        },
      ],
    });
  };

  // Remove service
  const removeService = (index: number) => {
    if (formData.servicesProducts.length > 1) {
      const updated = formData.servicesProducts.filter((_, i) => i !== index);
      setFormData({ ...formData, servicesProducts: updated });
    }
  };

  // Submit
  const handleSubmit = async () => {
    try {
      const jobData = {
        ...formData,
        dayType: formData.dayType || "day",
        expiryRemindBefore: Number(formData.expiryRemindBefore) || 0,
        status: "work pending",
        servicesProducts: formData.servicesProducts.map((s) => ({
          ...s,
          units: Number(s.units) || 0,
          rate: Number(s.rate) || 0,
          frequencyDays: Number(s.frequencyDays) || 1,
          frequencyUnit: s.frequencyUnit || "month",
        })),
        subtotal,
        vat,
        grandTotal,
      };

      if (mode === "create") {
        await dispatch(createJobForContract({ contractId, jobData })).unwrap();
      } else if (mode === "edit" && job) {
        await dispatch(
          updateJobForContract({
            contractId,
            jobId: job._id,
            updates: jobData,
          })
        ).unwrap();
      }

      onClose();
    } catch (error) {
      console.error(`Failed to ${mode} job:`, error);
      alert(`Failed to ${mode} job. Please try again.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-start justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === "create" ? "Create New Job" : "Edit Job"}
            </h2>
            {mode === "edit" && job && (
              <p className="text-sm text-gray-500 mt-1">Job ID: {job._id}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Job Type & Basic Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Job Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type *
                </label>
                <select
                  value={formData.jobType}
                  onChange={(e) =>
                    setFormData({ ...formData, jobType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Day Type *
                </label>
                <select
                  value={formData.dayType}
                  onChange={(e) =>
                    setFormData({ ...formData, dayType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="day">Day</option>
                  <option value="night">Night</option>
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
                      expiryRemindBefore: e.target.value === "" ? "" : e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
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
                <span className="text-sm font-medium text-gray-700">
                  Tax Exempt
                </span>
              </label>
            </div>
          </div>

          {/* Invoice Reminder */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Invoice Reminder
            </h3>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Invoice After Jobs Closed
                  </span>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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

          {/* Services/Products */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Services / Products
              </h3>
              <button
                type="button"
                onClick={addService}
                className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Service
              </button>
            </div>

            <div className="space-y-4">
              {formData.servicesProducts.map((service, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 border-2 border-purple-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">
                      Service #{index + 1}
                    </span>
                    {formData.servicesProducts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                              updateService(
                                index,
                                "units",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                            min="0"
                            step="0.01"
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
                              updateService(
                                index,
                                "rate",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                            min="0"
                            step="0.01"
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
                          Frequency
                        </label>
                        <input
                          type="number"
                          value={service.frequencyDays}
                          onChange={(e) =>
                            updateService(
                              index,
                              "frequencyDays",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Unit *
                        </label>
                        <select
                          value={service.frequencyUnit}
                          onChange={(e) =>
                            updateService(index, "frequencyUnit", e.target.value)
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="day">Day</option>
                          <option value="week">Week</option>
                          <option value="month">Month</option>
                          <option value="year">Year</option>
                        </select>
                      </div>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={service.isEveryDay}
                          onChange={(e) =>
                            updateService(index, "isEveryDay", e.target.checked)
                          }
                          className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Every</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contract Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
              Contract Summary (1 Year)
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Subtotal (1 Year):</span>
                <span className="text-xl font-bold text-gray-900">
                  AED {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700 font-medium">
                  VAT (5%):
                  {formData.isTaxExempt && (
                    <span className="ml-2 text-xs text-green-600 font-semibold">
                      TAX EXEMPT
                    </span>
                  )}
                </span>
                <span className="text-xl font-bold text-gray-900">
                  AED {vat.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-blue-100 px-4 rounded-lg">
                <span className="text-lg font-bold text-gray-900">
                  Grand Total (1 Year):
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  AED {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              {mode === "create" ? "Create Job" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}