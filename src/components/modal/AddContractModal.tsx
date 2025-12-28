import { Contract } from "@/types/contract";
import { X } from "lucide-react";
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-2xl font-bold">{isEdit ? `Edit Contract: ${initialData?.contractNumber}` : "Add New Contract"}</h2>
          <button
            onClick={onClose}
            className="hover:bg-blue-700 p-2 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* BASIC INFO */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* TITLE */}
              <InputField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />

              {/* ALIAS */}
              <InputField
                label="Alias Name"
                name="aliasName"
                value={formData.aliasName}
                onChange={handleChange}
              />

              {/* TRN */}
              <InputField
                label="TRN Number"
                name="trnNumber"
                value={formData.trnNumber}
                onChange={handleChange}
              />

              {/* EMAIL */}
              <InputField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />

              {/* PHONE */}
              <InputField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />

              {/* MOBILE */}
              <InputField
                label="Mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* ADDRESS */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
              Address Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Street 1"
                name="street1"
                value={formData.address.street1}
                onChange={handleAddressChange}
              />
              <InputField
                label="Street 2"
                name="street2"
                value={formData.address.street2}
                onChange={handleAddressChange}
              />
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

              {/* EMIRATE */}
              <SelectField
                label="Emirate"
                name="emirate"
                value={formData.address.emirate}
                options={emirates}
                onChange={handleAddressChange}
              />

              {/* COUNTRY */}
              <SelectField
                label="Country"
                name="country"
                value={formData.address.country}
                options={countries}
                onChange={handleAddressChange}
              />
            </div>
          </section>

          {/* OTHER DETAILS */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
              Other Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* REFERRED BY EMPLOYEE */}
              <SelectField
                label="Referred By Employee"
                name="referredByEmployee"
                value={formData.referredByEmployee}
                options={employees}
                onChange={handleChange}
              />

              {/* QUOTE VALIDITY */}
              <InputField
                label="Quote Validity Days"
                name="quoteValidityDays"
                type="number"
                value={formData.quoteValidityDays}
                onChange={handleChange}
              />

              {/* CREDIT LIMIT */}
              <InputField
                label="Credit Limit"
                name="creditLimit"
                type="number"
                value={formData.creditLimit}
                onChange={handleChange}
              />

              {/* REMARKS */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter remarks"
                />
              </div>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
            >
              Save Contract
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------
// Reusable Input Component
// -------------------------
const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}: any) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

// -------------------------
// Reusable Select Component
// -------------------------
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
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Select {label}</option>
      {options.map((opt: any) => (
        <option key={opt[valueKey] || opt} value={opt[valueKey] || opt}>
          {opt[labelKey] || opt}
        </option>
      ))}
    </select>
  </div>
);
