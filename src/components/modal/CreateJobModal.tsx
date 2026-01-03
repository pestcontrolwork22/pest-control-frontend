import { useState, useEffect } from "react";
import { X, Plus, Trash2, DollarSign, Briefcase, Settings, Calculator, Save } from "lucide-react";
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
  const dispatch = useAppDispatch();

  // --- STATE MANAGEMENT (Unchanged Logic) ---
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
      billingFrequency: string;
      customFrequencyValue?: number | string;
      customFrequencyUnit?: "day" | "week" | "month" | "year";
    };
    servicesProducts: Array<{
      serviceType: string;
      instructions: string;
      units: number | string;
      rate: number | string;
      subtotalPerYear: number;
      frequencyDays: number | string;
      frequencyUnit: "day" | "week" | "month" | "year";
      isEvery: boolean;
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
      billingFrequency: "monthly",
      customFrequencyValue: 15,
      customFrequencyUnit: "day",
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
        isEvery: false,
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
    { value: "tanks_containers_cleaning", label: "Tanks & Containers Cleaning Services" },
    { value: "disinfection_sterilization", label: "Disinfection & Sterilization Services" },
    { value: "pest_control", label: "Public Health Pests Control Services" },
  ];

  const billingFrequencies = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "semi_annually", label: "Semi-Annually" },
    { value: "annually", label: "Annually" },
    { value: "custom", label: "Custom" },
  ];

  // --- EFFECTS & LOGIC (Unchanged) ---
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
          billingFrequency: job.invoiceReminder.billingFrequency,
          customFrequencyValue: job.invoiceReminder.customFrequencyValue,
          customFrequencyUnit: job.invoiceReminder.customFrequencyUnit,
        },
        servicesProducts: job.servicesProducts.map(s => ({
          ...s,
          frequencyUnit: s.frequencyUnit || "month"
        })),
      });
    } else if (mode === "create") {
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
          billingFrequency: "monthly",
          customFrequencyValue: 15,
          customFrequencyUnit: "day",
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
            isEvery: false,
          },
        ],
      });
    }
  }, [mode, job]);

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

  const updateService = (index: number, field: string, value: any) => {
    const updated = [...formData.servicesProducts];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "units" || field === "rate" || field === "frequencyDays" || field === "frequencyUnit" || field === "isEvery") {
      const service = updated[index];
      const units = Number(service.units) || 0;
      const rate = Number(service.rate) || 0;
      const freq = Number(service.frequencyDays) || 1;

      let occurrencesPerYear;

      if (service.isEvery) {
        if (service.frequencyUnit === "day") occurrencesPerYear = 365 / freq;
        else if (service.frequencyUnit === "week") occurrencesPerYear = 52 / freq;
        else if (service.frequencyUnit === "month") occurrencesPerYear = 12 / freq;
        else if (service.frequencyUnit === "year") occurrencesPerYear = 1 / freq;
        else occurrencesPerYear = 12 / freq;
      } else {
        if (service.frequencyUnit === "day") occurrencesPerYear = freq * 365;
        else if (service.frequencyUnit === "week") occurrencesPerYear = freq * 52;
        else if (service.frequencyUnit === "month") occurrencesPerYear = freq * 12;
        else if (service.frequencyUnit === "year") occurrencesPerYear = freq * 1;
        else occurrencesPerYear = freq * 12;
      }

      updated[index].subtotalPerYear = units * rate * occurrencesPerYear;
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
          frequencyDays: 1,
          frequencyUnit: "month",
          isEvery: false,
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

  const handleSubmit = async () => {
    try {
      const jobData = {
        ...formData,
        dayType: formData.dayType || "day",
        expiryRemindBefore: Number(formData.expiryRemindBefore) || 0,
        status: "work pending",
        invoiceReminder: {
          ...formData.invoiceReminder,
          customFrequencyValue: Number(formData.invoiceReminder.customFrequencyValue),
        },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {mode === "create" ? "Create New Job" : "Edit Job Details"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500">
                {mode === "edit" && job ? `Ref: ${job._id.slice(-6).toUpperCase()}` : "Configure job parameters and services below."}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
          <div className="p-6 sm:p-8 space-y-8">

            {/* 1. Job Information Section */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <SectionHeader icon={<Briefcase className="w-4 h-4" />} title="Job Parameters" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <SelectField
                  label="Job Type"
                  value={formData.jobType}
                  options={[{ value: "recurring", label: "Recurring" }, { value: "one_off", label: "One Off" }]}
                  onChange={(e: any) => setFormData({ ...formData, jobType: e.target.value })}
                  required
                />
                <InputField
                  label="Contract Date"
                  type="date"
                  value={formData.contractDate}
                  onChange={(e: any) => setFormData({ ...formData, contractDate: e.target.value })}
                  required
                />
                <SelectField
                  label="Contracted By"
                  value={formData.contractedBy}
                  options={employees.map(e => ({ value: e.id, label: e.name }))}
                  onChange={(e: any) => setFormData({ ...formData, contractedBy: e.target.value })}
                  required
                />

                <InputField
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e: any) => {
                    const startValue = e.target.value;
                    let newEndDate = formData.endDate;
                    if (startValue) {
                      const date = new Date(startValue);
                      date.setFullYear(date.getFullYear() + 1);
                      newEndDate = date.toISOString().split("T")[0];
                    }
                    setFormData({ ...formData, startDate: startValue, endDate: newEndDate });
                  }}
                  required
                />
                <InputField
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e: any) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />

                <SelectField
                  label="Shift Type"
                  value={formData.dayType}
                  options={[{ value: "day", label: "Day Shift" }, { value: "night", label: "Night Shift" }]}
                  onChange={(e: any) => setFormData({ ...formData, dayType: e.target.value })}
                  required
                />

                <div className="md:col-span-3 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <InputField
                      label="Expiry Reminder (Days)"
                      type="number"
                      value={formData.expiryRemindBefore}
                      onChange={(e: any) => setFormData({ ...formData, expiryRemindBefore: e.target.value })}
                      min="0"
                      className="w-32"
                    />
                    <div className="h-8 w-px bg-slate-200 mx-2"></div>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isTaxExempt ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                        {formData.isTaxExempt && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.isTaxExempt}
                        onChange={(e) => setFormData({ ...formData, isTaxExempt: e.target.checked })}
                        className="hidden"
                      />
                      <span className="text-sm font-medium text-slate-700">Tax Exempt Status</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Invoice Settings Section */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <SectionHeader icon={<Settings className="w-4 h-4" />} title="Invoicing Schedule" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <InputField
                  label="Invoice Start Date"
                  type="date"
                  value={formData.invoiceReminder.startDate}
                  onChange={(e: any) => {
                    const startValue = e.target.value;
                    let newEndDate = formData.invoiceReminder.endDate;
                    if (startValue) {
                      const date = new Date(startValue);
                      date.setFullYear(date.getFullYear() + 1);
                      newEndDate = date.toISOString().split("T")[0];
                    }
                    setFormData({ ...formData, invoiceReminder: { ...formData.invoiceReminder, startDate: startValue, endDate: newEndDate } });
                  }}
                  required
                />
                <InputField
                  label="Invoice End Date"
                  type="date"
                  value={formData.invoiceReminder.endDate}
                  onChange={(e: any) => setFormData({ ...formData, invoiceReminder: { ...formData.invoiceReminder, endDate: e.target.value } })}
                  required
                />
                <SelectField
                  label="Billing Frequency"
                  value={formData.invoiceReminder.billingFrequency}
                  options={billingFrequencies}
                  onChange={(e: any) => setFormData({ ...formData, invoiceReminder: { ...formData.invoiceReminder, billingFrequency: e.target.value } })}
                  required
                />

                {formData.invoiceReminder.billingFrequency === 'custom' && (
                  <div className="md:col-span-3 bg-amber-50 rounded-xl p-4 border border-amber-100 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <InputField
                        label="Frequency Value"
                        type="number"
                        min="1"
                        value={formData.invoiceReminder.customFrequencyValue}
                        onChange={(e: any) => setFormData({ ...formData, invoiceReminder: { ...formData.invoiceReminder, customFrequencyValue: e.target.value } })}
                        required
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <SelectField
                        label="Frequency Unit"
                        value={formData.invoiceReminder.customFrequencyUnit}
                        options={[{ value: "day", label: "Days" }, { value: "week", label: "Weeks" }, { value: "month", label: "Months" }, { value: "year", label: "Years" }]}
                        onChange={(e: any) => setFormData({ ...formData, invoiceReminder: { ...formData.invoiceReminder, customFrequencyUnit: e.target.value as any } })}
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Services Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader icon={<Calculator className="w-4 h-4" />} title="Services & Products" />
                <button
                  type="button"
                  onClick={addService}
                  className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-semibold"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {formData.servicesProducts.map((service, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md hover:border-indigo-100">
                    {/* Service Header */}
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Item #{String(index + 1).padStart(2, '0')}
                      </span>
                      {formData.servicesProducts.length > 1 && (
                        <button
                          onClick={() => removeService(index)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          title="Remove Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Service Body */}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5">

                      {/* Type & Instructions (Left) */}
                      <div className="md:col-span-7 space-y-4">
                        <SelectField
                          label="Service Type"
                          value={service.serviceType}
                          options={serviceTypes}
                          onChange={(e: any) => updateService(index, "serviceType", e.target.value)}
                        />
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Instructions
                          </label>
                          <textarea
                            value={service.instructions}
                            onChange={(e) => updateService(index, "instructions", e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-sm resize-none"
                            placeholder="Specific requirements..."
                          />
                        </div>
                      </div>

                      {/* Calculation Details (Right) */}
                      <div className="md:col-span-5 bg-slate-50/50 rounded-xl p-4 border border-slate-100 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <InputField
                            label="Units"
                            type="number"
                            value={service.units}
                            onChange={(e: any) => updateService(index, "units", e.target.value)}
                            min="0"
                          />
                          <InputField
                            label="Rate (AED)"
                            type="number"
                            value={service.rate}
                            onChange={(e: any) => updateService(index, "rate", e.target.value)}
                            min="0"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 items-start">
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                              Frequency
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={service.frequencyDays}
                                onChange={(e) => updateService(index, "frequencyDays", e.target.value)}
                                className="w-16 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                min="1"
                              />
                              <select
                                value={service.frequencyUnit}
                                onChange={(e) => updateService(index, "frequencyUnit", e.target.value)}
                                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                              >
                                <option value="day">Day</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                                <option value="year">Year</option>
                              </select>
                            </div>
                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={service.isEvery}
                                onChange={(e) => updateService(index, "isEvery", e.target.checked)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-xs text-slate-600">Repeat Every X Interval</span>
                            </label>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-500 uppercase">Subtotal (Year)</span>
                          <span className="text-sm font-bold text-slate-900">AED {service.subtotalPerYear.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Financial Summary */}
            <section className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-6 opacity-80">
                <DollarSign className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-widest text-sm">Annual Financial Summary</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="font-medium text-slate-200">AED {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">VAT (5%)</span>
                  <div className="text-right">
                    <span className="font-medium text-slate-200 block">AED {vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    {formData.isTaxExempt && <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Tax Exempt</span>}
                  </div>
                </div>
                <div className="h-px bg-slate-700/50 my-2"></div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-slate-200">Grand Total</span>
                  <span className="font-bold text-emerald-400">AED {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-white hover:border-slate-300 hover:text-slate-800 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all text-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {mode === "create" ? "Create Job" : "Update Job"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- REUSABLE COMPONENTS (Matches previous Modal Style) ---

const SectionHeader = ({ icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-100">
    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
      {icon}
    </div>
    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
      {title}
    </h3>
  </div>
);

const InputField = ({ label, className, ...props }: any) => (
  <div className={`group ${className}`}>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 group-focus-within:text-indigo-600 transition-colors">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-sm"
    />
  </div>
);

const SelectField = ({ label, options, ...props }: any) => (
  <div className="group">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 group-focus-within:text-indigo-600 transition-colors">
      {label}
    </label>
    <div className="relative">
      <select
        {...props}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none text-sm cursor-pointer"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>
);