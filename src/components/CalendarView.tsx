import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import {
    format,
    parse,
    startOfWeek,
    getDay,
    addDays,
    addWeeks,
    addMonths,
    addYears,
    isBefore,
    isAfter
} from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./calendar-styles.css";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Eye,
    Briefcase,
    MapPin,
    Phone,
    Mail,
    Sun,
    Moon,
    Filter,
    X,
    Search,
    CheckCircle2,
    AlertCircle,
    MessageSquare,
    Save,
    Lock,
    CheckCheck
} from "lucide-react";
import { RootState, AppDispatch } from "@/store";
import { fetchContracts, updateJobForContract, fetchContractSuggestions } from "@/store/contract/thunk";
import { clearSuggestions } from "@/store/contract/slice";
import { Job } from "@/types/contract";
import { useNavigate } from "react-router-dom";
import { fetchInvoices } from "@/store/invoice/thunk";

// Setup the localizer for react-big-calendar
const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const DnDCalendar = withDragAndDrop(Calendar) as any;

// Custom event interface for the calendar
interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: 'job_occurrence' | 'invoice';
    resource: {
        job: Job;
        contractId: string;
        contractTitle: string;
        contractNumber: string;
        email: string;
        phone: string;
        address: string;
        serviceName?: string;
        visitNotes?: string;
    };
    status?: string;
}

function computeAllScheduledDates(job: Job): Date[] {
    const dates: Date[] = [];
    const jobStart = new Date(job.startDate);
    const jobEnd = new Date(job.endDate);

    if (!job.servicesProducts || job.servicesProducts.length === 0) return dates;

    job.servicesProducts.forEach((service) => {
        if (!service.frequencyDays || !service.frequencyUnit) {
            dates.push(new Date(jobStart));
            return;
        }
        let cur = new Date(jobStart);
        let safety = 0;
        while ((isBefore(cur, jobEnd) || cur.getTime() === jobEnd.getTime()) && safety < 10000) {
            safety++;
            dates.push(new Date(cur));
            if (service.frequencyUnit === 'custom') {
                const v = (service as any).customFrequencyValue || 1;
                const u = (service as any).customFrequencyUnit || 'day';
                if (u === 'day') cur = addDays(cur, v);
                else if (u === 'week') cur = addWeeks(cur, v);
                else if (u === 'month') cur = addMonths(cur, v);
                else if (u === 'year') cur = addYears(cur, v);
                else break;
            } else if (service.frequencyUnit === 'day') {
                cur = addDays(cur, service.frequencyDays);
            } else if (service.frequencyUnit === 'week') {
                cur = addWeeks(cur, service.frequencyDays);
            } else if (service.frequencyUnit === 'month') {
                cur = addMonths(cur, service.frequencyDays);
            } else if (service.frequencyUnit === 'year') {
                cur = addYears(cur, service.frequencyDays);
            } else break;
        }
    });

    const seen = new Set<string>();
    return dates.filter(d => {
        const k = d.toDateString();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

export const CalendarView = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { items: contracts } = useSelector(
        (state: RootState) => state.contracts
    );

    const [view, setView] = useState<View>("month");
    const [date, setDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [dayNightFilter, setDayNightFilter] = useState<'all' | 'day' | 'night'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'work pending' | 'work done' | 'work informed' | 'invoice'>('all');
    const [searchTerm, setSearchTerm] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { suggestions } = useSelector((state: RootState) => state.contracts);

    const [remarksText, setRemarksText] = useState("");
    const [isEditingRemarks, setIsEditingRemarks] = useState(false);
    const [savingRemarks, setSavingRemarks] = useState(false);

    const [closeJobConfirm, setCloseJobConfirm] = useState<{
        contractId: string;
        job: Job;
    } | null>(null);

    const getDateRange = (date: Date, view: View) => {
        let start, end;
        if (view === "month") {
            start = startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1));
            end = startOfWeek(new Date(date.getFullYear(), date.getMonth() + 1, 1));
            end.setDate(end.getDate() + 42);
        } else if (view === "week") {
            start = startOfWeek(date);
            end = new Date(start);
            end.setDate(end.getDate() + 7);
        } else if (view === "day") {
            start = new Date(date);
            start.setHours(0, 0, 0, 0);
            end = new Date(date);
            end.setHours(23, 59, 59, 999);
        } else {
            start = startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1));
            end = startOfWeek(new Date(date.getFullYear(), date.getMonth() + 1, 1));
            end.setDate(end.getDate() + 42);
        }
        return { start, end };
    };

    useEffect(() => {
        const { start, end } = getDateRange(date, view);

        if (searchTerm.length >= 3) {
            dispatch(fetchContractSuggestions(searchTerm));
            setShowSuggestions(true);
        } else {
            dispatch(clearSuggestions());
            setShowSuggestions(false);
        }

        const timeoutId = setTimeout(() => {
            dispatch(
                fetchContracts({
                    page: 1,
                    limit: 1000,
                    search: searchTerm,
                    startDate: start.toISOString(),
                    endDate: end.toISOString()
                })
            );

            dispatch(
                fetchInvoices({
                    scheduledStartDate: start.toISOString(),
                    scheduledEndDate: end.toISOString()
                })
            );
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [dispatch, date, view, searchTerm]);

    const { items: collectedInvoices } = useSelector((state: RootState) => (state as any).invoices || { items: [] });

    const events: CalendarEvent[] = useMemo(() => {
        const calendarEvents: CalendarEvent[] = [];
        const { start: viewStart, end: viewEnd } = getDateRange(date, view);

        contracts.forEach((contract) => {
            if (contract.jobs && contract.jobs.length > 0) {
                contract.jobs.forEach((job) => {
                    if (dayNightFilter !== 'all' && job.dayType !== dayNightFilter) {
                        return;
                    }

                    const jobStart = new Date(job.startDate);
                    const jobEnd = new Date(job.endDate);

                    if (job.servicesProducts && job.servicesProducts.length > 0) {
                        job.servicesProducts.forEach((service, serviceIdx) => {
                            let currentServiceDate = new Date(jobStart);
                            if (service.frequencyDays && service.frequencyUnit) {
                                let safetyCounter = 0;
                                while ((isBefore(currentServiceDate, jobEnd) || currentServiceDate.getTime() === jobEnd.getTime()) && safetyCounter < 10000) {
                                    safetyCounter++;

                                    const record = job.visitRecords?.find(r =>
                                        new Date(r.visitDate).toDateString() === currentServiceDate.toDateString()
                                    );
                                    const status = record ? record.status : job.status;

                                    if (statusFilter === 'all' || status === statusFilter) {
                                        if (currentServiceDate >= viewStart && currentServiceDate <= viewEnd) {
                                            calendarEvents.push({
                                                id: `${contract._id}-${job._id}-service-${serviceIdx}-${currentServiceDate.getTime()}`,
                                                title: `${contract.title} - ${service.serviceType.replace(/_/g, ' ')}`,
                                                start: new Date(currentServiceDate),
                                                end: new Date(currentServiceDate),
                                                type: 'job_occurrence',
                                                status: status,
                                                resource: {
                                                    job,
                                                    contractId: contract._id,
                                                    contractTitle: contract.title,
                                                    contractNumber: contract.contractNumber,
                                                    email: contract.email,
                                                    phone: contract.phone,
                                                    address: `${contract.address.city}, ${contract.address.emirate}`,
                                                    serviceName: service.serviceType,
                                                    visitNotes: record?.notes || ""
                                                },
                                            });
                                        }
                                    }

                                    if (service.frequencyUnit === 'custom') {
                                        const customVal = (service as any).customFrequencyValue || 1;
                                        const customUnit = (service as any).customFrequencyUnit || 'day';
                                        if (customUnit === 'day') {
                                            currentServiceDate = addDays(currentServiceDate, customVal);
                                        } else if (customUnit === 'week') {
                                            currentServiceDate = addWeeks(currentServiceDate, customVal);
                                        } else if (customUnit === 'month') {
                                            currentServiceDate = addMonths(currentServiceDate, customVal);
                                        } else if (customUnit === 'year') {
                                            currentServiceDate = addYears(currentServiceDate, customVal);
                                        } else {
                                            break;
                                        }
                                    } else if (service.frequencyUnit === 'day') {
                                        currentServiceDate = addDays(currentServiceDate, service.frequencyDays);
                                    } else if (service.frequencyUnit === 'week') {
                                        currentServiceDate = addWeeks(currentServiceDate, service.frequencyDays);
                                    } else if (service.frequencyUnit === 'month') {
                                        currentServiceDate = addMonths(currentServiceDate, service.frequencyDays);
                                    } else if (service.frequencyUnit === 'year') {
                                        currentServiceDate = addYears(currentServiceDate, service.frequencyDays);
                                    } else {
                                        break;
                                    }

                                    if (isAfter(currentServiceDate, viewEnd)) {
                                        break;
                                    }
                                }
                            } else {
                                if (jobStart >= viewStart && jobStart <= viewEnd) {
                                    const record = job.visitRecords?.find(r =>
                                        new Date(r.visitDate).toDateString() === jobStart.toDateString()
                                    );
                                    const status = record ? record.status : job.status;

                                    if (statusFilter === 'all' || status === statusFilter) {
                                        calendarEvents.push({
                                            id: `${contract._id}-${job._id}-once-${serviceIdx}`,
                                            title: `${contract.title} - ${service.serviceType.replace(/_/g, ' ')}`,
                                            start: jobStart,
                                            end: jobStart,
                                            type: 'job_occurrence',
                                            status: status,
                                            resource: {
                                                job,
                                                contractId: contract._id,
                                                contractTitle: contract.title,
                                                contractNumber: contract.contractNumber,
                                                email: contract.email,
                                                phone: contract.phone,
                                                address: `${contract.address.city}, ${contract.address.emirate}`,
                                                serviceName: service.serviceType,
                                                visitNotes: record?.notes || ""
                                            },
                                        });
                                    }
                                }
                            }
                        });
                    } else {
                        // Fallback if no services defined
                        if (jobStart >= viewStart && jobStart <= viewEnd) {
                            const record = job.visitRecords?.find(r =>
                                new Date(r.visitDate).toDateString() === jobStart.toDateString()
                            );
                            const status = record ? record.status : job.status;

                            if (statusFilter === 'all' || status === statusFilter) {
                                calendarEvents.push({
                                    id: `${contract._id}-${job._id}`,
                                    title: `${contract.title} - ${job.jobType}`,
                                    start: jobStart,
                                    end: jobStart,
                                    type: 'job_occurrence',
                                    status: status,
                                    resource: {
                                        job,
                                        contractId: contract._id,
                                        contractTitle: contract.title,
                                        contractNumber: contract.contractNumber,
                                        email: contract.email,
                                        phone: contract.phone,
                                        address: `${contract.address.city}, ${contract.address.emirate}`,
                                        visitNotes: record?.notes || ""
                                    },
                                });
                            }
                        }
                    }

                    // 2. Generate Invoice Reminders
                    if (job.invoiceReminder && job.invoiceReminder.billingFrequency) {
                        const invoiceStart = new Date(job.invoiceReminder.startDate);
                        const invoiceEnd = new Date(job.invoiceReminder.endDate);

                        let currentInvoiceDate = new Date(invoiceStart);
                        let safetyCounter = 0;

                        while ((isBefore(currentInvoiceDate, invoiceEnd) || currentInvoiceDate.getTime() === invoiceEnd.getTime()) && safetyCounter < 1000) {
                            safetyCounter++;

                            if (currentInvoiceDate >= viewStart && currentInvoiceDate <= viewEnd) {
                                const isCollected = collectedInvoices.some((inv: any) =>
                                    inv.contractId === contract._id &&
                                    inv.jobId === job._id &&
                                    new Date(inv.scheduledDate).toDateString() === currentInvoiceDate.toDateString()
                                );

                                if (statusFilter === 'all' || statusFilter === 'invoice') {
                                    calendarEvents.push({
                                        id: `${contract._id}-${job._id}-invoice-${currentInvoiceDate.getTime()}`,
                                        title: `${contract.title} - Invoice${isCollected ? ' (Collected)' : ''}`,
                                        start: new Date(currentInvoiceDate),
                                        end: new Date(currentInvoiceDate),
                                        type: 'invoice',
                                        status: isCollected ? 'collected' : 'pending',
                                        resource: {
                                            job,
                                            contractId: contract._id,
                                            contractTitle: contract.title,
                                            contractNumber: contract.contractNumber,
                                            email: contract.email,
                                            phone: contract.phone,
                                            address: `${contract.address.city}, ${contract.address.emirate}`,
                                        },
                                    });
                                }
                            }

                            switch (job.invoiceReminder.billingFrequency) {
                                case 'monthly':
                                    currentInvoiceDate = addMonths(currentInvoiceDate, 1);
                                    break;
                                case 'quarterly':
                                    currentInvoiceDate = addMonths(currentInvoiceDate, 3);
                                    break;
                                case 'semi_annually':
                                    currentInvoiceDate = addMonths(currentInvoiceDate, 6);
                                    break;
                                case 'annually':
                                    currentInvoiceDate = addYears(currentInvoiceDate, 1);
                                    break;
                                case 'custom':
                                    if (job.invoiceReminder.customFrequencyValue && job.invoiceReminder.customFrequencyUnit) {
                                        const value = job.invoiceReminder.customFrequencyValue;
                                        switch (job.invoiceReminder.customFrequencyUnit) {
                                            case 'day':
                                                currentInvoiceDate = addDays(currentInvoiceDate, value);
                                                break;
                                            case 'week':
                                                currentInvoiceDate = addWeeks(currentInvoiceDate, value);
                                                break;
                                            case 'month':
                                                currentInvoiceDate = addMonths(currentInvoiceDate, value);
                                                break;
                                            case 'year':
                                                currentInvoiceDate = addYears(currentInvoiceDate, value);
                                                break;
                                            default:
                                                currentInvoiceDate = addMonths(currentInvoiceDate, 1);
                                        }
                                    } else {
                                        currentInvoiceDate = addMonths(currentInvoiceDate, 1);
                                    }
                                    break;
                                default:
                                    currentInvoiceDate = addMonths(currentInvoiceDate, 1);
                            }

                            if (isAfter(currentInvoiceDate, viewEnd)) {
                                break;
                            }
                        }
                    }
                });
            }
        });

        return calendarEvents;
    }, [contracts, dayNightFilter, statusFilter, date, view, collectedInvoices]);

    // --- Styles for Events ---
    const eventStyleGetter = (event: CalendarEvent) => {
        let backgroundColor = "#f59e0b";
        let borderLeftColor = "#b45309";

        if (event.type === 'invoice') {
            if (event.status === 'collected') {
                backgroundColor = "#15803d";
                borderLeftColor = "#14532d";
            } else {
                backgroundColor = "#ef4444";
                borderLeftColor = "#b91c1c";
            }
        } else {
            const status = event.status || event.resource.job.status;

            if (status === "work done") {
                backgroundColor = "#10b981";
                borderLeftColor = "#047857";
            } else if (status === "work informed") {
                backgroundColor = "#3b82f6";
                borderLeftColor = "#1d4ed8";
            } else if (status === "work pending") {
                backgroundColor = "#f59e0b";
                borderLeftColor = "#b45309";
            }
        }

        return {
            style: {
                backgroundColor,
                borderRadius: "4px",
                opacity: 1,
                color: "white",
                border: "none",
                borderLeft: `4px solid ${borderLeftColor}`,
                display: "block",
                fontWeight: "600",
                fontSize: "0.75rem",
                padding: "2px 6px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
            },
        };
    };

    // Custom event component to show remarks indicator
    const CustomEventComponent = ({ event }: { event: CalendarEvent }) => {
        // Only show 💬 if THIS occurrence's visitNotes has content
        const hasRemarks = !!(event.resource.visitNotes && event.resource.visitNotes.trim());
        return (
            <span style={{ display: "flex", alignItems: "center", gap: "3px", width: "100%", overflow: "hidden" }}>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {event.title}
                </span>
                {hasRemarks && (
                    <span
                        title={event.resource.visitNotes}
                        style={{
                            flexShrink: 0,
                            background: "rgba(255,255,255,0.3)",
                            borderRadius: "50%",
                            width: "14px",
                            height: "14px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "8px",
                            lineHeight: 1,
                        }}
                    >
                        💬
                    </span>
                )}
            </span>
        );
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
        // Seed remarks from THIS occurrence's visit record notes (not job-level)
        setRemarksText(event.resource.visitNotes || "");
        setIsEditingRemarks(false);
    };

    const handleEventDrop = async ({ event, start }: any) => {
        const { contractId, job } = event.resource;
        const newStartDateObj = new Date(start);
        const timeDiff = newStartDateObj.getTime() - new Date(event.start).getTime();

        try {
            if (event.type === 'invoice') {
                const currentInvoiceStart = new Date(job.invoiceReminder.startDate);
                const currentInvoiceEnd = new Date(job.invoiceReminder.endDate);

                const newInvoiceStart = new Date(currentInvoiceStart.getTime() + timeDiff).toISOString();
                const newInvoiceEnd = new Date(currentInvoiceEnd.getTime() + timeDiff).toISOString();

                await dispatch(
                    updateJobForContract({
                        contractId,
                        jobId: job._id,
                        updates: {
                            invoiceReminder: {
                                ...job.invoiceReminder,
                                startDate: newInvoiceStart,
                                endDate: newInvoiceEnd,
                            }
                        },
                    })
                ).unwrap();
            } else {
                const newJobStartDate = new Date(new Date(job.startDate).getTime() + timeDiff).toISOString();
                const newJobEndDate = new Date(new Date(job.endDate).getTime() + timeDiff).toISOString();

                const updatedVisitRecords = job.visitRecords?.map((record: any) => ({
                    ...record,
                    visitDate: new Date(new Date(record.visitDate).getTime() + timeDiff).toISOString()
                })) || [];

                await dispatch(
                    updateJobForContract({
                        contractId,
                        jobId: job._id,
                        updates: {
                            startDate: newJobStartDate,
                            endDate: newJobEndDate,
                            visitRecords: updatedVisitRecords,
                        },
                    })
                ).unwrap();
            }
        } catch (error) {
            console.error("Failed to update date:", error);
        }
    };

    // ─── Check if this is the last schedule and all are done ────────────────
    const isLastScheduleCompleted = (job: Job, updatedRecords: any[], visitDate: Date): boolean => {
        const allScheduledDates = computeAllScheduledDates(job);
        if (allScheduledDates.length === 0) return false;

        // Determine the last scheduled date
        const lastDate = allScheduledDates.reduce((latest, d) => d > latest ? d : latest, allScheduledDates[0]);

        // Is the current visit the last one?
        if (visitDate.toDateString() !== lastDate.toDateString()) return false;

        // Are all scheduled dates either in updatedRecords as 'work done'?
        const allDone = allScheduledDates.every(scheduledDate => {
            const record = updatedRecords.find(
                r => new Date(r.visitDate).toDateString() === scheduledDate.toDateString()
            );
            return record && record.status === 'work done';
        });

        return allDone;
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!selectedEvent) return;

        const { contractId, job } = selectedEvent.resource;
        const visitDate = selectedEvent.start;
        const dateString = visitDate.toISOString();

        const newRecord = {
            visitDate: dateString,
            status: newStatus,
            updatedAt: new Date().toISOString()
        };

        const currentRecords = job.visitRecords ? [...job.visitRecords] : [];
        const otherRecords = currentRecords.filter(r =>
            new Date(r.visitDate).toDateString() !== visitDate.toDateString()
        );

        const updatedRecords = [...otherRecords, newRecord];

        try {
            await dispatch(
                updateJobForContract({
                    contractId,
                    jobId: job._id,
                    updates: {
                        visitRecords: updatedRecords,
                    },
                })
            ).unwrap();

            setSelectedEvent((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    status: newStatus,
                    resource: {
                        ...prev.resource,
                        job: {
                            ...prev.resource.job,
                            visitRecords: updatedRecords as any
                        },
                    },
                };
            });

            // Check if last schedule completed
            if (newStatus === 'work done') {
                const jobWithUpdatedRecords = { ...job, visitRecords: updatedRecords as any };
                if (isLastScheduleCompleted(jobWithUpdatedRecords, updatedRecords, visitDate)) {
                    setCloseJobConfirm({ contractId, job: jobWithUpdatedRecords });
                }
            }

        } catch (error) {
            console.error("Failed to update job status:", error);
        }
    };

    const handleSaveRemarks = async () => {
        if (!selectedEvent) return;
        const { contractId, job } = selectedEvent.resource;
        const visitDate = selectedEvent.start;
        const dateString = visitDate.toISOString();
        setSavingRemarks(true);
        try {
            // Update the notes on the visitRecord for this specific date only
            const currentRecords = job.visitRecords ? [...job.visitRecords] : [];
            const existingRecord = currentRecords.find(
                r => new Date(r.visitDate).toDateString() === visitDate.toDateString()
            );
            const otherRecords = currentRecords.filter(
                r => new Date(r.visitDate).toDateString() !== visitDate.toDateString()
            );
            const updatedRecord = {
                ...(existingRecord || { visitDate: dateString, status: job.status }),
                notes: remarksText,
            };
            const updatedVisitRecords = [...otherRecords, updatedRecord];

            await dispatch(
                updateJobForContract({
                    contractId,
                    jobId: job._id,
                    updates: { visitRecords: updatedVisitRecords },
                })
            ).unwrap();

            setIsEditingRemarks(false);
            // Update local event state so modal reflects new notes immediately
            setSelectedEvent(prev => prev ? {
                ...prev,
                resource: {
                    ...prev.resource,
                    visitNotes: remarksText,
                    job: {
                        ...prev.resource.job,
                        visitRecords: updatedVisitRecords as any
                    }
                }
            } : null);
        } catch (err) {
            console.error("Failed to save remarks:", err);
        } finally {
            setSavingRemarks(false);
        }
    };

    const handleCloseJob = async () => {
        if (!closeJobConfirm) return;
        const { contractId, job } = closeJobConfirm;
        try {
            await dispatch(
                updateJobForContract({
                    contractId,
                    jobId: job._id,
                    updates: { status: 'work done' },
                })
            ).unwrap();
        } catch (err) {
            console.error("Failed to close job:", err);
        } finally {
            setCloseJobConfirm(null);
            setSelectedEvent(null);
        }
    };

    const handleNavigate = (newDate: Date) => {
        setDate(newDate);
    };

    const handleViewChange = (newView: View) => {
        setView(newView);
    };

    const handleViewJob = () => {
        if (selectedEvent) {
            navigate(
                `/contracts/${selectedEvent.resource.contractId}/jobs/${selectedEvent.resource.job._id}`
            );
        }
    };

    // --- Custom Toolbar Component ---
    const CustomToolbar = ({ label, onNavigate, onView }: any) => {
        return (
            <div className="bg-white rounded-t-2xl px-6 py-5 border-b border-slate-200">
                <div className="flex flex-col xl:flex-row items-center justify-between gap-4">

                    {/* Navigation Group */}
                    <div className="flex items-center gap-4 w-full xl:w-auto">
                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
                            <button
                                onClick={() => onNavigate("PREV")}
                                className="p-1.5 hover:bg-white hover:text-indigo-600 rounded-md transition-all text-slate-500"
                                title="Previous"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => onNavigate("TODAY")}
                                className="px-3 py-1 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => onNavigate("NEXT")}
                                className="p-1.5 hover:bg-white hover:text-indigo-600 rounded-md transition-all text-slate-500"
                                title="Next"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{label}</h2>
                    </div>

                    {/* Filters Group */}
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">

                        {/* Status Filter */}
                        <div className="relative group w-full md:w-auto">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <Filter className="w-4 h-4" />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full md:w-44 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer hover:border-slate-300"
                            >
                                <option value="all">All Statuses</option>
                                <option value="work pending">Pending</option>
                                <option value="work informed">Informed</option>
                                <option value="work done">Completed</option>
                                <option value="invoice">Invoices</option>
                            </select>
                        </div>

                        {/* View Switcher */}
                        <div className="flex bg-slate-100 rounded-lg p-1 w-full md:w-auto">
                            {['month', 'week', 'day'].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => onView(v)}
                                    className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === v
                                        ? "bg-white text-indigo-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                        }`}
                                >
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen">

            {/* Page Header */}
            <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <CalendarIcon className="w-6 h-6 text-indigo-600" />
                        Jobs Calendar
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Manage scheduled operations and invoice reminders.
                    </p>
                </div>

                {/* Global Search */}
                <div className="w-full lg:w-96 relative z-20">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search contracts or clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => { setSearchTerm(""); setStatusFilter("all"); setDayNightFilter("all"); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {suggestions.map((contract) => (
                                <button
                                    key={contract._id}
                                    onClick={() => {
                                        setSearchTerm(contract.title);
                                        setShowSuggestions(false);
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
            </div>

            {/* Filter Chips / Legend */}
            <div className="flex flex-wrap gap-3 mb-6 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm w-fit">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Filters:</span>

                {/* Day/Night Toggle */}
                <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-4">
                    <button
                        onClick={() => setDayNightFilter('all')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${dayNightFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        ALL
                    </button>
                    <button
                        onClick={() => setDayNightFilter('day')}
                        className={`p-1 rounded transition-all ${dayNightFilter === 'day' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400'}`}
                        title="Day Jobs"
                    >
                        <Sun className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setDayNightFilter('night')}
                        className={`p-1 rounded transition-all ${dayNightFilter === 'night' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-400'}`}
                        title="Night Jobs"
                    >
                        <Moon className="w-4 h-4" />
                    </button>
                </div>

                {/* Legend / Quick Filter */}
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span className="text-xs font-medium text-slate-600">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span className="text-xs font-medium text-slate-600">Informed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span className="text-xs font-medium text-slate-600">Done</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        <span className="text-xs font-medium text-slate-600">Invoice</span>
                    </div>
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                        <span className="text-xs">💬</span>
                        <span className="text-xs font-medium text-slate-600">Has Remarks</span>
                    </div>
                </div>
            </div>

            {/* Calendar Component */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <DnDCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 750 }}
                    view={view}
                    onView={handleViewChange}
                    date={date}
                    onNavigate={handleNavigate}
                    onSelectEvent={handleSelectEvent}
                    onEventDrop={handleEventDrop}
                    eventPropGetter={eventStyleGetter}
                    components={{
                        toolbar: CustomToolbar,
                        event: CustomEventComponent,
                    }}
                    popup
                    selectable
                    resizable
                />
            </div>

            {/* ─── Event Details Modal ─── */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedEvent(null)} />

                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">

                        {/* Modal Header */}
                        <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-start justify-between z-10">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${selectedEvent.type === 'invoice' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {selectedEvent.type === 'invoice' ? <AlertCircle className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {selectedEvent.resource.job.jobType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                            {selectedEvent.resource.contractNumber}
                                        </span>
                                        <span className="text-sm text-slate-500 truncate max-w-[200px]">
                                            {selectedEvent.resource.contractTitle}
                                        </span>
                                        {selectedEvent.resource.visitNotes && (
                                            <span className="text-xs bg-violet-50 text-violet-600 border border-violet-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                                <MessageSquare className="w-3 h-3" />
                                                Remarks
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-slate-50/50">

                            {/* 1. Status Selector (For non-invoices) */}
                            {selectedEvent.type !== 'invoice' && (
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Update Status</label>
                                    <select
                                        value={selectedEvent.status || selectedEvent.resource.job.status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="work pending">Work Pending</option>
                                        <option value="work informed">Work Informed</option>
                                        <option value="work done">Work Done</option>
                                    </select>
                                </div>
                            )}

                            {/* ─── Remarks Section ─── */}
                            {selectedEvent.type !== 'invoice' && (
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
                                            Remarks
                                        </label>
                                        {!isEditingRemarks ? (
                                            <button
                                                onClick={() => setIsEditingRemarks(true)}
                                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                                            >
                                                <MessageSquare className="w-3 h-3" />
                                                {remarksText ? "Edit" : "Add Remark"}
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setIsEditingRemarks(false); setRemarksText(selectedEvent.resource.visitNotes || ""); }}
                                                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveRemarks}
                                                    disabled={savingRemarks}
                                                    className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-60"
                                                >
                                                    <Save className="w-3 h-3" />
                                                    {savingRemarks ? "Saving..." : "Save"}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditingRemarks ? (
                                        <textarea
                                            value={remarksText}
                                            onChange={(e) => setRemarksText(e.target.value)}
                                            placeholder="Add remarks for this date (e.g. timing changes, special instructions)..."
                                            rows={3}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                                        />
                                    ) : remarksText ? (
                                        <div className="bg-violet-50 border border-violet-100 rounded-lg p-3 text-sm text-violet-900 leading-relaxed">
                                            {remarksText}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">No remarks added yet. Click "Add Remark" to add notes.</p>
                                    )}
                                </div>
                            )}

                            {/* 2. Contact Info */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Client Contact</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Mail className="w-4 h-4 text-indigo-400" />
                                        <span>{selectedEvent.resource.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Phone className="w-4 h-4 text-indigo-400" />
                                        <span>{selectedEvent.resource.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <MapPin className="w-4 h-4 text-indigo-400" />
                                        <span>{selectedEvent.resource.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Job Specifics */}
                            {selectedEvent.type !== 'invoice' && (
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Service Details</h3>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-center bg-slate-50 p-2 rounded-lg border border-slate-100 flex-1 mr-2">
                                            <span className="block text-xs text-slate-400 mb-1">Date</span>
                                            <span className="block text-sm font-bold text-slate-800">{format(new Date(selectedEvent.resource.job.startDate), "MMM dd")}</span>
                                        </div>
                                        <div className="text-center bg-slate-50 p-2 rounded-lg border border-slate-100 flex-1 ml-2">
                                            <span className="block text-xs text-slate-400 mb-1">Total</span>
                                            <span className="block text-sm font-bold text-slate-800">AED {selectedEvent.resource.job.grandTotal.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {selectedEvent.resource.job.servicesProducts?.map((service, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-2 border-t border-slate-100">
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{service.serviceType}</p>
                                                <p className="text-xs text-slate-500">{service.units} units × AED {service.rate}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">AED {service.subtotalPerYear.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-white px-6 py-4 border-t border-slate-100 flex justify-end gap-3 z-10">
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm"
                            >
                                Close
                            </button>
                            {selectedEvent.type === 'invoice' ? (
                                <button
                                    onClick={() => {
                                        const { contractId, job } = selectedEvent.resource;
                                        navigate(`/invoices/collect?contractId=${contractId}&jobId=${job._id}&scheduledDate=${selectedEvent.start.toISOString()}`);
                                    }}
                                    className={`px-5 py-2.5 rounded-xl text-white font-medium shadow-lg active:scale-95 transition-all text-sm flex items-center gap-2 ${selectedEvent.status === 'collected' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                        }`}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    {selectedEvent.status === 'collected' ? 'View Collection' : 'Collect Invoice'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleViewJob}
                                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all text-sm flex items-center gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    View Full Details
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Close Job Confirmation Popup ─── */}
            {closeJobConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />

                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                        {/* Icon */}
                        <div className="flex flex-col items-center text-center mb-5">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
                                <CheckCheck className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">All Schedules Completed!</h2>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                All scheduled visits in this job are now marked as <span className="font-semibold text-emerald-700">Work Done</span>.
                                <br /><br />
                                Do you want to <span className="font-semibold text-slate-800">close this job</span>?
                            </p>
                        </div>

                        {/* Info badge */}
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
                            <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 leading-relaxed">
                                Closing the job will set its overall status to <strong>Work Done</strong>. You can still view all details.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setCloseJobConfirm(null)}
                                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm"
                            >
                                Keep Open
                            </button>
                            <button
                                onClick={handleCloseJob}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-200 transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Close Job
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};