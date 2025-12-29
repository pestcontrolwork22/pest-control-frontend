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
    X
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
    };
    status?: string;
}


export const CalendarView = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { items: contracts } = useSelector(
        (state: RootState) => state.contracts
    );

    const [view, setView] = useState<View>("month");
    const [date, setDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
        null
    );
    const [dayNightFilter, setDayNightFilter] = useState<'all' | 'day' | 'night'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'work pending' | 'work done' | 'work informed' | 'invoice'>('all');
    const [searchTerm, setSearchTerm] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { suggestions } = useSelector((state: RootState) => state.contracts);

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

        // Debounce search
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
                                                    serviceName: service.serviceType
                                                },
                                            });
                                        }
                                    }

                                    if (service.frequencyUnit === 'day') {
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
                                                serviceName: service.serviceType
                                            },
                                        });
                                    }
                                }
                            }
                        });
                    } else {
                        // Fallback if no services defined but job exists (legacy?)
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

    const eventStyleGetter = (event: CalendarEvent) => {


        let backgroundColor = "#f59e0b"; // Default color

        if (event.type === 'invoice') {
            if (event.status === 'collected') {
                backgroundColor = "#15803d"; // Darker Green for collected
            } else {
                backgroundColor = "#eab308"; // Yellow-500 for pending
            }
        } else {
            const status = event.status || event.resource.job.status;

            if (status === "work done") {
                backgroundColor = "#10b981"; // Green
            } else if (status === "work informed") {
                backgroundColor = "#3b82f6"; // Blue
            } else if (status === "work pending") {
                backgroundColor = "#f59e0b"; // Orange
            }
        }

        return {
            style: {
                backgroundColor,
                borderRadius: "6px",
                opacity: 0.9,
                color: "white",
                border: "none",
                display: "block",
                fontWeight: "500",
                fontSize: "0.875rem",
                padding: "2px 6px",
            },
        };
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
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
        } catch (error) {
            console.error("Failed to update job status:", error);
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

    const CustomToolbar = ({ label, onNavigate, onView }: any) => {
        return (
            <div className="bg-white rounded-t-xl px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    {/* Navigation */}
                    <div className="flex items-center w-full lg:w-auto justify-between lg:justify-start space-x-3">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => onNavigate("PREV")}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                title="Previous"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            <button
                                onClick={() => onNavigate("TODAY")}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => onNavigate("NEXT")}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                title="Next"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>

                        {/* Mobile Status Filter */}
                        <div className="lg:hidden">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-32 bg-gray-100 border-none rounded-lg text-xs font-medium p-2 outline-none focus:ring-0"
                            >
                                <option value="all">All Status</option>
                                <option value="work pending">Pending</option>
                                <option value="work informed">Informed</option>
                                <option value="work done">Done</option>
                                <option value="invoice">Invoice</option>
                            </select>
                        </div>

                        {/* Mobile Day/Night Filter */}
                        <div className="flex lg:hidden bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setDayNightFilter('all')}
                                className={`p-2 rounded-md transition ${dayNightFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                                title="All"
                            >
                                <span className="text-xs font-bold">ALL</span>
                            </button>
                            <button
                                onClick={() => setDayNightFilter('day')}
                                className={`p-2 rounded-md transition ${dayNightFilter === 'day' ? 'bg-white text-amber-500 shadow-sm' : 'text-gray-500'}`}
                                title="Day"
                            >
                                <Sun className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setDayNightFilter('night')}
                                className={`p-2 rounded-md transition ${dayNightFilter === 'night' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
                                title="Night"
                            >
                                <Moon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Current Date Label */}
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-800">{label}</h2>

                    <div className="flex items-center gap-4">
                        {/* Desktop Status Filter */}
                        <div className="hidden lg:flex items-center space-x-2 bg-gray-100 rounded-lg p-1 px-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="bg-transparent border-none text-sm font-medium text-gray-700 outline-none focus:ring-0 cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="work pending">Work Pending</option>
                                <option value="work informed">Work Informed</option>
                                <option value="work done">Work Done</option>
                                <option value="invoice">Invoice</option>
                            </select>
                        </div>

                        {/* Desktop Day/Night Filter */}
                        <div className="hidden lg:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setDayNightFilter('all')}
                                className={`px-3 py-2 rounded-md transition font-medium text-sm ${dayNightFilter === 'all'
                                    ? "bg-white text-gray-800 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                All Time
                            </button>
                            <button
                                onClick={() => setDayNightFilter('day')}
                                className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center space-x-1 ${dayNightFilter === 'day'
                                    ? "bg-white text-amber-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                <Sun className="w-4 h-4" />
                                <span>Day</span>
                            </button>
                            <button
                                onClick={() => setDayNightFilter('night')}
                                className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center space-x-1 ${dayNightFilter === 'night'
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                <Moon className="w-4 h-4" />
                                <span>Night</span>
                            </button>
                        </div>

                        {/* View Switcher */}
                        <div className="hidden lg:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => onView("month")}
                                className={`px-4 py-2 rounded-md transition font-medium text-sm ${view === "month"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => onView("week")}
                                className={`px-4 py-2 rounded-md transition font-medium text-sm ${view === "week"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => onView("day")}
                                className={`px-4 py-2 rounded-md transition font-medium text-sm ${view === "day"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Day
                            </button>
                            <button
                                onClick={() => onView("agenda")}
                                className={`px-4 py-2 rounded-md transition font-medium text-sm ${view === "agenda"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Agenda
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 mb-2 md:mb-0">
                    <div className="bg-blue-600 p-3 rounded-xl">
                        <CalendarIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Jobs Calendar</h1>
                        <p className="text-gray-600 mt-1">
                            View and manage all scheduled jobs
                        </p>
                    </div>
                </div>

                {/* Search Input */}
                <div className="w-full md:w-auto relative flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by Title or Pest Number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                    setDayNightFilter("all");
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                                title="Clear all filters"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {suggestions.map((contract) => (
                                <button
                                    key={contract._id}
                                    onClick={() => {
                                        setSearchTerm(contract.title);
                                        setShowSuggestions(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b last:border-0"
                                >
                                    <div className="font-semibold text-gray-800 text-sm">{contract.title}</div>
                                    <div className="text-xs text-gray-500">{contract.contractNumber}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Job Status Legend:
                </h3>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded bg-[#f59e0b]"></div>
                        <span className="text-sm text-gray-600">Work Pending</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded bg-[#10b981]"></div>
                        <span className="text-sm text-gray-600">Work Done</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded bg-[#3b82f6]"></div>
                        <span className="text-sm text-gray-600">Work Informed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded bg-[#eab308]"></div>
                        <span className="text-sm text-gray-600">Invoice</span>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <DnDCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 700 }}
                    view={view}
                    onView={handleViewChange}
                    date={date}
                    onNavigate={handleNavigate}
                    onSelectEvent={handleSelectEvent}
                    onEventDrop={handleEventDrop}
                    eventPropGetter={eventStyleGetter}
                    components={{
                        toolbar: CustomToolbar,
                    }}
                    popup
                    selectable
                    resizable
                />
            </div>

            {/* Event Details Modal */}
            {selectedEvent && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedEvent(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 shrink-0 rounded-t-2xl">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            {selectedEvent.resource.job.jobType}
                                        </h2>
                                        <p className="text-blue-100 mt-1">
                                            {selectedEvent.resource.contractNumber}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 overflow-y-auto">
                            {/* Status and Contract Info Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Contract Info */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                        Contract Details
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2 text-gray-700">
                                            <Briefcase className="w-4 h-4 text-blue-600" />
                                            <span className="font-medium">
                                                {selectedEvent.resource.contractTitle}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <Mail className="w-4 h-4 text-blue-600" />
                                            <span>{selectedEvent.resource.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <Phone className="w-4 h-4 text-blue-600" />
                                            <span>{selectedEvent.resource.phone}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <MapPin className="w-4 h-4 text-blue-600" />
                                            <span>{selectedEvent.resource.address}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Update - Only for non-invoice events */}
                                {selectedEvent.type !== 'invoice' && (
                                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                            Job Status
                                        </h3>
                                        <div className="space-y-3">
                                            <select
                                                value={selectedEvent.status || selectedEvent.resource.job.status}
                                                onChange={(e) => handleStatusChange(e.target.value)}
                                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium ${(selectedEvent.status || selectedEvent.resource.job.status) === "work done"
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : (selectedEvent.status || selectedEvent.resource.job.status) === "work informed"
                                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                                    }`}
                                            >
                                                <option value="work pending">Work Pending</option>
                                                <option value="work informed">Work Informed</option>
                                                <option value="work done">Work Done</option>
                                            </select>
                                            <p className="text-xs text-gray-500">
                                                Update the status to reflect current progress.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Job Timeline & Financials - Only for non-invoice events */}
                            {selectedEvent.type !== 'invoice' && (
                                <>
                                    {/* Job Timeline */}
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                            Job Timeline
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Start Date</p>
                                                <p className="text-lg font-semibold text-gray-800">
                                                    {format(new Date(selectedEvent.resource.job.startDate), "MMM dd, yyyy")}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {format(new Date(selectedEvent.resource.job.startDate), "EEEE")}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">End Date</p>
                                                <p className="text-lg font-semibold text-gray-800">
                                                    {format(new Date(selectedEvent.resource.job.endDate), "MMM dd, yyyy")}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {format(new Date(selectedEvent.resource.job.endDate), "EEEE")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Job Financial Info */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-green-50 rounded-xl p-4 text-center">
                                            <p className="text-xs text-gray-600 mb-1">Subtotal</p>
                                            <p className="text-xl font-bold text-green-700">
                                                AED {selectedEvent.resource.job.subtotal.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-amber-50 rounded-xl p-4 text-center">
                                            <p className="text-xs text-gray-600 mb-1">VAT</p>
                                            <p className="text-xl font-bold text-amber-700">
                                                AED {selectedEvent.resource.job.vat.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                                            <p className="text-xs text-gray-600 mb-1">Grand Total</p>
                                            <p className="text-xl font-bold text-blue-700">
                                                AED {selectedEvent.resource.job.grandTotal.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Services */}
                                    {selectedEvent.resource.job.servicesProducts &&
                                        selectedEvent.resource.job.servicesProducts.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                                    Services & Products
                                                </h3>
                                                <div className="space-y-2">
                                                    {selectedEvent.resource.job.servicesProducts.map(
                                                        (service, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-gray-800">
                                                                        {service.serviceType}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600">
                                                                        {service.units} units × AED {service.rate}
                                                                    </p>
                                                                </div>
                                                                <p className="font-semibold text-gray-800">
                                                                    AED {service.subtotalPerYear.toLocaleString()}
                                                                </p>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 shrink-0 rounded-b-2xl">
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
                            >
                                Close
                            </button>
                            {selectedEvent.type === 'invoice' ? (
                                <button
                                    onClick={() => {
                                        const { contractId, job } = selectedEvent.resource;
                                        // Pass scheduled date in ISO format
                                        navigate(`/invoices/collect?contractId=${contractId}&jobId=${job._id}&scheduledDate=${selectedEvent.start.toISOString()}`);
                                    }}
                                    className={`px-6 py-2 rounded-lg text-white font-medium flex items-center space-x-2 shadow-md transition ${selectedEvent.status === 'collected'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-amber-500 hover:bg-amber-600'
                                        }`}
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>{selectedEvent.status === 'collected' ? 'View Collection' : 'Collect Invoice'}</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleViewJob}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center space-x-2 shadow-md"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>View Full Details</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
