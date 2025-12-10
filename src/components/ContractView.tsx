"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  Smartphone,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Edit,
  Building2,
  User,
  FileText,
  Timer,
  Briefcase,
} from "lucide-react";

import { useAppDispatch } from "@/hooks/useDispatch";
import { fetchContractById } from "@/store/contract/thunk";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import JobModal from "./modal/CreateJobModal";

export default function ContractView() {
  const params = useParams();
  const id = params?.id as string;

  const dispatch = useAppDispatch();

  const contract = useSelector((state: RootState) => state.contracts.single);
  const loading = useSelector((state: RootState) => state.contracts.loading);

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  const navigate = useNavigate();

  // -------------------------------------
  // Fetch contract data
  // -------------------------------------
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        await dispatch(fetchContractById(id as string)).unwrap();
      } catch (error) {
        console.error("Failed to fetch contract:", error);
      }
    };

    load();
  }, [id, dispatch]);

  // -------------------------------------
  // UI Loading State
  // -------------------------------------
  if (loading || !contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contract details...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------
  // UI Helpers
  // -------------------------------------

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // -------------------------------------
  // Actions
  // -------------------------------------
  const handleCreateJob = () => {
    setIsJobModalOpen(true);
  };

  const handleScheduleContracts = () => {
    console.log("Schedule contracts:", contract._id);
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Contracts
            </button>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {contract.title}
                    </h1>
                  </div>
                  <p className="text-gray-600 text-lg">{contract.aliasName}</p>
                  <p className="text-gray-500 text-sm mt-2">
  Contract No:{" "}
  <span className="font-semibold text-gray-700">
    {contract.contractNumber}
  </span>
</p>

                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateJob}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Create Job
                  </button>
                  <button
                    onClick={handleScheduleContracts}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md"
                  >
                    <Timer className="w-4 h-4 mr-2" />
                    Schedule
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Credit Limit</p>
                    <p className="text-lg font-bold text-gray-900">
                      AED {contract.creditLimit.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quote Validity</p>
                    <p className="text-lg font-bold text-gray-900">
                      {contract.quoteValidityDays} Days
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Briefcase className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Jobs</p>
                    <p className="text-lg font-bold text-gray-900">
                      {contract.jobs?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs Section */}
          {contract.jobs && contract.jobs.length > 0 && (
            <div className="mb-6 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                Associated Jobs ({contract.jobs.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contract.jobs.map((job: any, index: number) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Job #{index + 1}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          job.status === "active"
                            ? "bg-green-100 text-green-700"
                            : job.status === "completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {job.jobType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Type: <span className="font-medium">{job.jobType}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Services:{" "}
                      <span className="font-medium">
                        {job.servicesProducts.length}
                      </span>
                    </p>
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      AED {job.grandTotal.toFixed(2)}
                    </p>
                    <button
                      onClick={() =>
                        navigate(`/contracts/${contract._id}/jobs/${job._id}`)
                      }
                      className="text-blue-600 hover:underline text-sm mt-2"
                    >
                      View Job →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Contact & Address */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    icon={<Mail className="w-5 h-5 text-blue-600" />}
                    label="Email"
                    value={contract.email}
                    link={`mailto:${contract.email}`}
                  />
                  <InfoItem
                    icon={<Phone className="w-5 h-5 text-green-600" />}
                    label="Phone"
                    value={contract.phone}
                    link={`tel:${contract.phone}`}
                  />
                  <InfoItem
                    icon={<Smartphone className="w-5 h-5 text-purple-600" />}
                    label="Mobile"
                    value={contract.mobile}
                    link={`tel:${contract.mobile}`}
                  />
                  <InfoItem
                    icon={<FileText className="w-5 h-5 text-orange-600" />}
                    label="TRN Number"
                    value={contract.trnNumber}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Address Details
                </h2>

                <div className="space-y-3">
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">
                      Street 1:
                    </span>
                    <span className="text-gray-600">
                      {contract.address.street1}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">
                      Street 2:
                    </span>
                    <span className="text-gray-600">
                      {contract.address.street2}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">
                      City:
                    </span>
                    <span className="text-gray-600">
                      {contract.address.city}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">
                      PO Box:
                    </span>
                    <span className="text-gray-600">
                      {contract.address.poBox}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">
                      Emirate:
                    </span>
                    <span className="text-gray-600">
                      {contract.address.emirate}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">
                      Country:
                    </span>
                    <span className="text-gray-600">
                      {contract.address.country}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Remarks
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {contract.remarks}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Additional Details */}
            <div className="space-y-6">
              {/* Business Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Business Details
                </h2>

                <div className="space-y-4">
                  <DetailItem
                    label="Referred By"
                    value={contract.referredByEmployee}
                  />
                  <DetailItem
                    label="Quote Validity"
                    value={`${contract.quoteValidityDays} Days`}
                  />
                  <DetailItem
                    label="Credit Limit"
                    value={`AED ${contract.creditLimit.toLocaleString()}`}
                  />
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Timeline
                </h2>

                <div className="space-y-4">
                  <TimelineItem
                    label="Created"
                    date={formatDate(contract.createdAt!)}
                    icon="create"
                  />
                  <TimelineItem
                    label="Last Updated"
                    date={formatDate(contract.updatedAt!)}
                    icon="update"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Job Modal */}
      {contract && (
        <JobModal
          isOpen={isJobModalOpen}
          onClose={() => setIsJobModalOpen(false)}
          contractId={contract._id}
          mode="create"
        />
      )}
    </>
  );
}

// Reusable Components
const InfoItem = ({ icon, label, value, link }: any) => (
  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
    <div className="flex-shrink-0 mt-1">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      {link ? (
        <a
          href={link}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium text-gray-900 break-all">{value}</p>
      )}
    </div>
  </div>
);

const DetailItem = ({ label, value }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-600 font-medium">{label}</span>
    <span className="text-sm text-gray-900 font-semibold">
      {typeof value === "string" ? value : value}
    </span>
  </div>
);

const TimelineItem = ({ label, date, icon }: any) => (
  <div className="flex items-start space-x-3">
    <div
      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        icon === "create" ? "bg-green-100" : "bg-blue-100"
      }`}
    >
      {icon === "create" ? (
        <Calendar className="w-4 h-4 text-green-600" />
      ) : (
        <Clock className="w-4 h-4 text-blue-600" />
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-500">{date}</p>
    </div>
  </div>
);