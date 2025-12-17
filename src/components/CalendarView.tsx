import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
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
} from "lucide-react";
import { RootState, AppDispatch } from "@/store";
import { fetchContracts, updateJobForContract } from "@/store/contract/thunk";
import { Job } from "@/types/contract";
import { useNavigate } from "react-router-dom";

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
    resource: {
        job: Job;
        contractId: string;
        contractTitle: string;
        contractNumber: string;
        email: string;
        phone: string;
        address: string;
    };
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
    const [statusFilter, setStatusFilter] = useState<'all' | 'work pending' | 'work done' | 'work informed'>('all');

    useEffect(() => {
        dispatch(
            fetchContracts({
                page: 1,
                limit: 1000,
                search: "",
            })
        );
    }, [dispatch]);

    const events: CalendarEvent[] = useMemo(() => {
        const calendarEvents: CalendarEvent[] = [];

        contracts.forEach((contract) => {
            if (contract.jobs && contract.jobs.length > 0) {
                contract.jobs.forEach((job) => {
                    if (dayNightFilter !== 'all' && job.dayType !== dayNightFilter) {
                        return;
                    }

                    if (statusFilter !== 'all' && job.status !== statusFilter) {
                        return;
                    }

                    const startDate = new Date(job.startDate);
                    calendarEvents.push({
                        id: `${contract._id}-${job._id}`,
                        title: `${contract.title} - ${job.jobType}`,
                        start: startDate,
                        end: startDate,
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
                });
            }
        });

        return calendarEvents;
    }, [contracts, dayNightFilter, statusFilter]);

    const eventStyleGetter = (event: CalendarEvent) => {
        const status = event.resource.job.status;

        let backgroundColor = "#f59e0b";

        if (status === "work done") {
            backgroundColor = "#10b981"; // Green
        } else if (status === "work informed") {
            backgroundColor = "#3b82f6"; // Blue
        } else if (status === "work pending") {
            backgroundColor = "#f59e0b"; // Orange
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

        const originalStart = new Date(job.startDate).getTime();
        const originalEnd = new Date(job.endDate).getTime();
        const duration = originalEnd - originalStart;

        const newStartDateObj = new Date(start);
        const newEndDateObj = new Date(newStartDateObj.getTime() + duration);

        const newStartDate = newStartDateObj.toISOString();
        const newEndDate = newEndDateObj.toISOString();

        try {
            await dispatch(
                updateJobForContract({
                    contractId,
                    jobId: job._id,
                    updates: {
                        startDate: newStartDate,
                        endDate: newEndDate,
                    },
                })
            ).unwrap();
        } catch (error) {
            console.error("Failed to update job date:", error);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!selectedEvent) return;

        const { contractId, job } = selectedEvent.resource;

        try {
            await dispatch(
                updateJobForContract({
                    contractId,
                    jobId: job._id,
                    updates: {
                        status: newStatus,
                    },
                })
            ).unwrap();

            setSelectedEvent((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    resource: {
                        ...prev.resource,
                        job: {
                            ...prev.resource.job,
                            status: newStatus as any,
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
            <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
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
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedEvent(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5">
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
                        <div className="p-6 space-y-6">
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

                                {/* Status Update */}
                                <div className="bg-white border rounded-xl p-4 shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                        Job Status
                                    </h3>
                                    <div className="space-y-3">
                                        <select
                                            value={selectedEvent.resource.job.status}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium ${selectedEvent.resource.job.status === "work done"
                                                ? "bg-green-50 text-green-700 border-green-200"
                                                : selectedEvent.resource.job.status ===
                                                    "work informed"
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
                            </div>

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
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
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
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleViewJob}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center space-x-2 shadow-md"
                            >
                                <Eye className="w-4 h-4" />
                                <span>View Full Details</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
