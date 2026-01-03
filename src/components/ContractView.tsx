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
  CheckCircle2,
  Hash,
  ChevronRight
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium text-sm">Loading contract details...</p>
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
      month: "short",
      day: "numeric",
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
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
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-['Montserrat']">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Top Navigation */}
          <button
            onClick={handleBack}
            className="group flex items-center text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
            Back to Contracts
          </button>

          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

              {/* Title & Badge */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                    {contract.title}
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Hash className="w-3 h-3 mr-1" />
                    {contract.contractNumber}
                  </span>
                </div>
                {contract.aliasName && (
                  <p className="text-lg text-slate-500 font-medium">{contract.aliasName}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleScheduleContracts}
                  className="flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all font-medium text-sm shadow-sm"
                >
                  <Timer className="w-4 h-4 mr-2" />
                  Schedule
                </button>
                <button
                  onClick={handleCreateJob}
                  className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium text-sm shadow-lg shadow-indigo-200 active:scale-95"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Create Job
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100">
              <StatCard
                label="Credit Limit"
                value={`AED ${contract.creditLimit.toLocaleString()}`}
                icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
                bg="bg-emerald-50"
              />
              <StatCard
                label="Quote Validity"
                value={`${contract.quoteValidityDays} Days`}
                icon={<Calendar className="w-5 h-5 text-indigo-600" />}
                bg="bg-indigo-50"
              />
              <StatCard
                label="Total Jobs"
                value={contract.jobs?.length || 0}
                icon={<Briefcase className="w-5 h-5 text-amber-600" />}
                bg="bg-amber-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column (Main Info) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Contact & Address Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Client Details</h2>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact</h3>
                    <div className="space-y-3">
                      <ContactRow icon={<Mail className="w-4 h-4" />} label="Email" value={contract.email} href={`mailto:${contract.email}`} />
                      <ContactRow icon={<Phone className="w-4 h-4" />} label="Phone" value={contract.phone} href={`tel:${contract.phone}`} />
                      <ContactRow icon={<Smartphone className="w-4 h-4" />} label="Mobile" value={contract.mobile} href={`tel:${contract.mobile}`} />
                      <ContactRow icon={<FileText className="w-4 h-4" />} label="TRN" value={contract.trnNumber} />
                    </div>
                  </div>

                  {/* Address Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Location</h3>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-1.5 bg-slate-100 rounded-md">
                        <MapPin className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="text-sm text-slate-700 space-y-1">
                        <p className="font-medium">{contract.address.street1}</p>
                        {contract.address.street2 && <p>{contract.address.street2}</p>}
                        <p>{contract.address.city}, {contract.address.emirate}</p>
                        <p className="text-slate-500">{contract.address.country} {contract.address.poBox && `(PO Box: ${contract.address.poBox})`}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jobs Section */}
              {contract.jobs && contract.jobs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Job History</h2>
                    </div>
                    <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {contract.jobs.length}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {contract.jobs.map((job: any, index: number) => (
                      <div
                        key={index}
                        onClick={() => navigate(`/contracts/${contract._id}/jobs/${job._id}`)}
                        className="group p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg mt-1 ${job.status === "active" ? "bg-emerald-100 text-emerald-600" :
                              job.status === "completed" ? "bg-blue-100 text-blue-600" :
                                "bg-slate-100 text-slate-500"
                            }`}>
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-900 text-sm">Job #{String(index + 1).padStart(3, '0')}</span>
                              <StatusBadge status={job.status} />
                            </div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{job.jobType}</p>
                            <p className="text-xs text-slate-400 mt-1">{job.servicesProducts.length} Services included</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-14 sm:pl-0">
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">AED {job.grandTotal.toFixed(2)}</p>
                            <p className="text-xs text-slate-400">Total</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remarks Section */}
              {contract.remarks && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Remarks</h2>
                  </div>
                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                    {contract.remarks}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-6">

              {/* Business Details */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Business Info</h2>
                </div>
                <div className="p-6 space-y-4">
                  <SidebarItem label="Sales Rep" value={contract.referredByEmployee} />
                  <div className="h-px bg-slate-100" />
                  <SidebarItem label="Quote Validity" value={`${contract.quoteValidityDays} Days`} />
                  <div className="h-px bg-slate-100" />
                  <SidebarItem label="Credit Limit" value={`AED ${contract.creditLimit.toLocaleString()}`} />
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Timeline</h2>
                </div>
                <div className="p-6 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[39px] top-8 bottom-8 w-0.5 bg-slate-100"></div>

                  <div className="space-y-6 relative z-10">
                    <TimelineEvent
                      label="Created"
                      date={formatDate(contract.createdAt!)}
                      time={formatTime(contract.createdAt!)}
                      icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      bg="bg-emerald-100"
                    />
                    <TimelineEvent
                      label="Last Updated"
                      date={formatDate(contract.updatedAt!)}
                      time={formatTime(contract.updatedAt!)}
                      icon={<Clock className="w-3 h-3 text-blue-600" />}
                      bg="bg-blue-100"
                    />
                  </div>
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

// ---------------------------
// Sub-Components
// ---------------------------

const StatCard = ({ label, value, icon, bg }: any) => (
  <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
    <div className={`p-3 rounded-lg mr-4 ${bg}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const ContactRow = ({ icon, label, value, href }: any) => (
  <div className="flex items-center gap-3 group">
    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-slate-400 font-bold uppercase">{label}</p>
      {href ? (
        <a href={href} className="text-sm font-medium text-slate-700 hover:text-indigo-600 truncate block transition-colors">
          {value || "N/A"}
        </a>
      ) : (
        <p className="text-sm font-medium text-slate-700 truncate">{value || "N/A"}</p>
      )}
    </div>
  </div>
);

const SidebarItem = ({ label, value }: any) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-slate-500 font-medium">{label}</span>
    <span className="text-sm text-slate-900 font-semibold">{value || "-"}</span>
  </div>
);

const TimelineEvent = ({ label, date, time, icon, bg }: any) => (
  <div className="flex items-start gap-4">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center ring-4 ring-white ${bg}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-bold text-slate-900">{label}</p>
      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
        <span>{date}</span>
        <span>•</span>
        <span>{time}</span>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    cancelled: "bg-red-100 text-red-700 border-red-200"
  }[status] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles}`}>
      {status}
    </span>
  );
};