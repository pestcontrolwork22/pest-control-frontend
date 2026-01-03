import { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, FileText, Bell, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import api from "@/api/axios";

// --- Interfaces (Unchanged) ---
interface Contract {
  id: string;
  client: string;
  expiry: string;
  status: 'expired' | 'expiring';
}

interface Schedule {
  id: string;
  client: string;
  service: string;
  dueDate: string;
  daysOverdue: number;
}

interface DashboardStats {
  expiredContracts: Contract[];
  expiringContracts: Contract[];
  overdueSchedules: Schedule[];
  stats: {
    totalActiveContracts: number;
    scheduledThisWeek: number;
    actionRequired: number;
  };
}

const PestControlDashboard = () => {
  const [activeTab, setActiveTab] = useState<'actions' | 'reminders'>('actions');
  const [data, setData] = useState<DashboardStats>({
    expiredContracts: [],
    expiringContracts: [],
    overdueSchedules: [],
    stats: {
      totalActiveContracts: 0,
      scheduledThisWeek: 0,
      actionRequired: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [dubaiTime, setDubaiTime] = useState<{ time: string; date: string } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/contracts/stats');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Dubai Time Clock
  useEffect(() => {
    const fetchDubaiTime = async () => {
      try {
        const res = await fetch('https://worldtimeapi.org/api/timezone/Asia/Dubai');
        const data = await res.json();
        const dateTime = new Date(data.datetime);
        updateTimeDisplay(dateTime);
      } catch {
        // Fallback to calculated Dubai time (UTC+4)
        const now = new Date();
        const dubaiOffset = 4 * 60; // Dubai is UTC+4
        const localOffset = now.getTimezoneOffset();
        const dubaiDate = new Date(now.getTime() + (localOffset + dubaiOffset) * 60000);
        updateTimeDisplay(dubaiDate);
      }
    };

    const updateTimeDisplay = (date: Date) => {
      setDubaiTime({
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    };

    fetchDubaiTime();

    // Update every second
    const interval = setInterval(() => {
      const now = new Date();
      const dubaiOffset = 4 * 60;
      const localOffset = now.getTimezoneOffset();
      const dubaiDate = new Date(now.getTime() + (localOffset + dubaiOffset) * 60000);
      updateTimeDisplay(dubaiDate);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const { expiredContracts, expiringContracts, overdueSchedules, stats } = data;

  // --- Design Update: Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
        <div className="text-sm font-medium text-slate-500 animate-pulse">Syncing Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Top Header with Decoration */}
      <header className="bg-slate-900 overflow-hidden relative">
        {/* Background Decorations */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        <div className="absolute top-[-50%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Header Content */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between text-white">
            <div>
              <p className="text-indigo-200 text-sm font-semibold tracking-wider uppercase mb-1">Overview</p>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            {/* Dubai Time Widget */}
            <div className="mt-4 md:mt-0 flex items-center gap-3 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg">
              <div className="flex items-center gap-1.5 text-indigo-300 border-r border-white/10 pr-3">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Dubai</span>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-sm font-bold text-white tracking-wide font-mono">
                    {dubaiTime?.time || '--:--:--'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {dubaiTime?.date || '---'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Grid (Summary) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <StatCard
            title="Active Contracts"
            value={stats.totalActiveContracts}
            icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
            visualType="trend"
          />
          <StatCard
            title="Scheduled (Week)"
            value={stats.scheduledThisWeek}
            icon={<Calendar className="w-5 h-5 text-blue-500" />}
            visualType="bar"
          />
          <StatCard
            title="Action Required"
            value={stats.actionRequired}
            icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
            alert={true}
            visualType="alert"
          />
        </div>

        {/* Tab Navigation (Pill Style) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 mb-6 inline-flex w-full md:w-auto">
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'actions'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Actions Needed</span>
            {expiredContracts.length + overdueSchedules.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {expiredContracts.length + overdueSchedules.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'reminders'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            <Bell className="w-4 h-4" />
            <span>Reminders</span>
            {expiringContracts.length > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {expiringContracts.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-6">

          {/* --- TAB: ACTIONS --- */}
          {activeTab === 'actions' && (
            <div className="grid gap-6 animate-fade-in">

              {/* Expired Contracts Card */}
              <SectionCard
                title="Expired Contracts"
                count={expiredContracts.length}
                icon={<XCircle className="w-5 h-5 text-red-500" />}
                type="danger"
              >
                {expiredContracts.length === 0 ? (
                  <EmptyState message="No expired contracts found. Good job!" />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {expiredContracts.map((contract) => (
                      <div key={contract.id} className="group flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                            <FileText className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{contract.client}</p>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium">ID: {contract.id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md inline-block mb-2">
                            Expired: {contract.expiry}
                          </p>
                          <button className="block w-full text-xs font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all">
                            Renew Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* Overdue Schedules Card */}
              <SectionCard
                title="Overdue Schedule Plans"
                count={overdueSchedules.length}
                icon={<Clock className="w-5 h-5 text-amber-600" />}
                type="warning"
              >
                {overdueSchedules.length === 0 ? (
                  <EmptyState message="All schedules are up to date." />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {overdueSchedules.map((schedule) => (
                      <div key={schedule.id} className="group flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                            <Calendar className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{schedule.client}</p>
                            <p className="text-xs text-slate-500 font-medium">{schedule.service}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-100/50">
                            <AlertTriangle className="w-3 h-3" />
                            {schedule.daysOverdue} days overdue
                          </span>

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* --- TAB: REMINDERS --- */}
          {activeTab === 'reminders' && (
            <div className="animate-fade-in">
              <SectionCard
                title="Expiring Soon"
                count={expiringContracts.length}
                icon={<Bell className="w-5 h-5 text-indigo-500" />}
                type="info"
              >
                {expiringContracts.length === 0 ? (
                  <EmptyState message="No contracts expiring soon." />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {expiringContracts.map((contract) => (
                      <div key={contract.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                            <FileText className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{contract.client}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-400 font-medium">#{contract.id}</span>
                              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                Expires: {contract.expiry}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="flex-1 sm:flex-none text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-slate-300 hover:shadow-sm transition-all">
                            Send Reminder
                          </button>
                          <button className="flex-1 sm:flex-none text-xs font-semibold text-white bg-indigo-600 border border-indigo-600 rounded-lg px-3 py-2 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all">
                            Contact
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          )}
        </div>
      </main>

    </div>
  );
};

// --- Sub-components for Cleaner Code ---

// 1. Stat Card Component with Visual Variants
const StatCard = ({
  title,
  value,
  icon,
  alert = false,
  visualType = 'default'
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  alert?: boolean;
  visualType?: 'trend' | 'bar' | 'alert' | 'default';
}) => {
  // Get current day (0 = Sunday, so adjust for Mon-Sun display)
  const today = new Date().getDay();
  const currentDayIndex = today === 0 ? 6 : today - 1; // Convert to Mon(0) - Sun(6)

  // Static bar heights for weekly visualization (randomized feel)
  const barHeights = [65, 40, 80, 55, 90, 35, 25];
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className={`relative bg-white p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md overflow-hidden ${alert ? 'border-amber-100 bg-amber-50/30' : 'border-slate-100'
      }`}>
      {/* Main Content */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={visualType === 'bar' ? 'flex-1' : ''}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
            <div className={visualType === 'bar' ? 'flex items-end justify-between' : ''}>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>

              {/* Bar Variant: Weekly Activity Bars */}
              {visualType === 'bar' && (
                <div className="flex items-end gap-1 ml-4 mr-12">
                  {barHeights.map((height, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`w-2.5 rounded-t-sm transition-all duration-300 ${index === currentDayIndex
                          ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-sm shadow-blue-200'
                          : 'bg-gradient-to-t from-slate-200 to-slate-100'
                          }`}
                        style={{ height: `${height * 0.4}px` }}
                      />
                      <span className={`text-[8px] mt-1 font-medium ${index === currentDayIndex ? 'text-blue-600' : 'text-slate-400'
                        }`}>
                        {dayLabels[index]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className={`p-2.5 rounded-xl ${alert ? 'bg-amber-100' : 'bg-slate-50'}`}>
            {icon}
          </div>
        </div>

        {/* Alert Variant: Severity Meter */}
        {visualType === 'alert' && (
          <div className="mt-4 pt-3 border-t border-amber-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Severity Breakdown</span>
            </div>
            <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-slate-100">
              <div className="w-[35%] bg-gradient-to-r from-red-500 to-red-400 rounded-l-full" title="Critical" />
              <div className="w-[40%] bg-gradient-to-r from-orange-400 to-amber-400" title="Warning" />
              <div className="w-[25%] bg-gradient-to-r from-slate-300 to-slate-200 rounded-r-full" title="Low" />
            </div>
            <div className="flex justify-between mt-1.5 text-[9px] font-medium">
              <span className="text-red-500">Critical</span>
              <span className="text-amber-500">Warning</span>
              <span className="text-slate-400">Low</span>
            </div>
          </div>
        )}
      </div>

      {/* Trend Variant: Decorative Sparkline SVG */}
      {visualType === 'trend' && (
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none">
          <svg
            className="w-full h-full"
            viewBox="0 0 200 50"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path
              d="M0 50 L0 35 Q10 32, 20 30 T40 28 T60 32 T80 25 T100 22 T120 18 T140 20 T160 15 T180 12 T200 8 L200 50 Z"
              fill="url(#sparklineGradient)"
            />
            {/* Line stroke */}
            <path
              d="M0 35 Q10 32, 20 30 T40 28 T60 32 T80 25 T100 22 T120 18 T140 20 T160 15 T180 12 T200 8"
              fill="none"
              stroke="rgb(16, 185, 129)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Animated dot at end */}
            <circle cx="200" cy="8" r="3" fill="rgb(16, 185, 129)">
              <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      )}
    </div>
  );
};

// 2. Section Card Container
const SectionCard = ({ title, count, icon, children, type }: any) => {
  const badgeColors = {
    danger: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-indigo-100 text-indigo-700',
  }[type as 'danger' | 'warning' | 'info'] || 'bg-slate-100 text-slate-700';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badgeColors}`}>
          {count}
        </span>
      </div>
      <div className="bg-white">
        {children}
      </div>
    </div>
  );
};

// 3. Empty State Helper
const EmptyState = ({ message }: { message: string }) => (
  <div className="p-8 text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3">
      <CheckCircle className="w-6 h-6 text-slate-300" />
    </div>
    <p className="text-slate-500 text-sm font-medium">{message}</p>
  </div>
);

export default PestControlDashboard;