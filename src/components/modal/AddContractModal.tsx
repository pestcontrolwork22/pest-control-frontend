import { Contract } from "@/types/contract";
import { X, Save, Building2, User, MapPin, FileText } from "lucide-react";
import { useState } from "react";

export const AddContractModal = ({
  onClose,
  onSubmit,
  initialData = null,
  isEdit = false,
}: {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Contract | null;
  isEdit?: boolean;
}) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      aliasName: "",
      trnNumber: "",
      email: "",
      phone: "",
      mobile: "",
      address: {
        street1: "",
        street2: "",
        city: "",
        poBox: "",
        emirate: "",
        country: "",
      },
      referredByEmployee: "",
      quoteValidityDays: "",
      creditLimit: "",
      remarks: "",
    }
  );

  const emirates = [
    "Abu Dhabi",
    "Dubai",
    "Sharjah",
    "Ajman",
    "Umm Al Quwain",
    "Ras Al Khaimah",
    "Fujairah",
  ];
  const countries = [
    "United Arab Emirates",
    "Saudi Arabia",
    "Oman",
    "Qatar",
    "Kuwait",
    "Bahrain",
  ];
  const employees = [
    "Manzoor",
    "Rafi",
    "Sabith",
    "Shakir",
    "Shanu",
    "Aboobaker",
    "Faijas",
    "Shareef",
    "Ahil",
    "Huwaiz"
  ];

  // ----------------------
  // HANDLE NORMAL FIELDS
  // ----------------------
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ----------------------
  // HANDLE ADDRESS FIELDS
  // ----------------------
  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        [e.target.name]: e.target.value,
      },
    });
  };

  // ----------------------
  // SUBMIT FORM
  // ----------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      quoteValidityDays: Number(formData.quoteValidityDays),
      creditLimit: Number(formData.creditLimit),
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">

        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEdit ? "Edit Contract Details" : "New Contract"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? `Updating record: ${initialData?.contractNumber}` : "Fill in the details below to create a new client contract."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form id="contract-form" onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-10">

            {/* SECTION 1: BASIC INFO */}
            <section>
              <SectionHeader icon={<Building2 className="w-4 h-4" />} title="Organization Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <InputField
                  label="Company Name"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Al Futtaim Group"
                  required
                />
                <InputField
                  label="Alias / Trade Name"
                  name="aliasName"
                  value={formData.aliasName}
                  onChange={handleChange}
                  placeholder="e.g. AFG"
                />
                <InputField
                  label="TRN Number"
                  name="trnNumber"
                  value={formData.trnNumber}
                  onChange={handleChange}
                  placeholder="Tax Registration Number"
                />
              </div>
            </section>

            {/* SECTION 2: CONTACT INFO */}
            <section>
              <SectionHeader icon={<User className="w-4 h-4" />} title="Contact Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <InputField
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Phone (Landline)"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="04 123 4567"
                  />
                  <InputField
                    label="Mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="050 123 4567"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 3: ADDRESS */}
            <section>
              <SectionHeader icon={<MapPin className="w-4 h-4" />} title="Location Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <InputField
                  label="Street Address 1"
                  name="street1"
                  value={formData.address.street1}
                  onChange={handleAddressChange}
                  placeholder="Building Name, Floor"
                />
                <InputField
                  label="Street Address 2"
                  name="street2"
                  value={formData.address.street2}
                  onChange={handleAddressChange}
                  placeholder="Area / Street"
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="City"
                    name="city"
                    value={formData.address.city}
                    onChange={handleAddressChange}
                  />
                  <InputField
                    label="PO Box"
                    name="poBox"
                    value={formData.address.poBox}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Emirate"
                    name="emirate"
                    value={formData.address.emirate}
                    options={emirates}
                    onChange={handleAddressChange}
                  />
                  <SelectField
                    label="Country"
                    name="country"
                    value={formData.address.country}
                    options={countries}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
            </section>

            {/* SECTION 4: FINANCIAL & OTHER */}
            <section>
              <SectionHeader icon={<FileText className="w-4 h-4" />} title="Contract Terms" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                <SelectField
                  label="Sales Rep"
                  name="referredByEmployee"
                  value={formData.referredByEmployee}
                  options={employees}
                  onChange={handleChange}
                />
                <InputField
                  label="Quote Validity (Days)"
                  name="quoteValidityDays"
                  type="number"
                  value={formData.quoteValidityDays}
                  onChange={handleChange}
                  placeholder="e.g. 30"
                />
                <InputField
                  label="Credit Limit (AED)"
                  name="creditLimit"
                  type="number"
                  value={formData.creditLimit}
                  onChange={handleChange}
                  placeholder="e.g. 50000"
                />

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Internal Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-sm"
                    placeholder="Add any internal notes about this contract..."
                  />
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 backdrop-blur-sm z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-white hover:border-slate-300 hover:text-slate-800 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="contract-form"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all text-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isEdit ? "Update Contract" : "Save Contract"}
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------
// Styled Sub-components
// -------------------------

const SectionHeader = ({ icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
      {icon}
    </div>
    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
      {title}
    </h3>
  </div>
);

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}: any) => (
  <div className="group">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 group-focus-within:text-indigo-600 transition-colors">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-sm"
    />
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  valueKey,
  labelKey,
}: any) => (
  <div className="group">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 group-focus-within:text-indigo-600 transition-colors">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none text-sm cursor-pointer"
      >
        <option value="" className="text-slate-400">Select...</option>
        {options.map((opt: any) => (
          <option key={opt[valueKey] || opt} value={opt[valueKey] || opt}>
            {opt[labelKey] || opt}
          </option>
        ))}
      </select>
      {/* Custom Arrow for consistency */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>
);