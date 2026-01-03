import { useState } from "react";
import {
    Settings,
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Database,
    FileText,
    CreditCard,
    Mail,
    Smartphone,
    Users,
    Building2,
    Lock,
    Key,
    Download,
    Upload,
    Trash2,
    HelpCircle,
    X,
    Clock,
    ChevronRight
} from "lucide-react";

interface SettingItem {
    id: string;
    icon: React.ElementType;
    title: string;
    description: string;
    category: string;
    color: string;
}

const settingsData: SettingItem[] = [
    // Account Settings
    { id: "profile", icon: User, title: "Profile Settings", description: "Update your personal information and avatar", category: "Account", color: "indigo" },
    { id: "password", icon: Lock, title: "Change Password", description: "Update your login credentials", category: "Account", color: "indigo" },
    { id: "2fa", icon: Key, title: "Two-Factor Authentication", description: "Add extra security to your account", category: "Account", color: "indigo" },

    // Notifications
    { id: "email-notif", icon: Mail, title: "Email Notifications", description: "Configure email alert preferences", category: "Notifications", color: "blue" },
    { id: "push-notif", icon: Bell, title: "Push Notifications", description: "Manage browser and mobile alerts", category: "Notifications", color: "blue" },
    { id: "sms-notif", icon: Smartphone, title: "SMS Alerts", description: "Set up text message reminders", category: "Notifications", color: "blue" },

    // Business Settings
    { id: "company", icon: Building2, title: "Company Details", description: "Update business name, address, and logo", category: "Business", color: "emerald" },
    { id: "team", icon: Users, title: "Team Management", description: "Add or remove team members and roles", category: "Business", color: "emerald" },
    { id: "billing", icon: CreditCard, title: "Billing & Payments", description: "Manage payment methods and invoices", category: "Business", color: "emerald" },

    // System Settings
    { id: "appearance", icon: Palette, title: "Appearance", description: "Switch themes, colors, and layouts", category: "System", color: "purple" },
    { id: "language", icon: Globe, title: "Language & Region", description: "Set language, timezone, and formats", category: "System", color: "purple" },
    { id: "integrations", icon: Database, title: "Integrations", description: "Connect third-party apps and services", category: "System", color: "purple" },

    // Data Management
    { id: "export", icon: Download, title: "Export Data", description: "Download reports and backup data", category: "Data", color: "amber" },
    { id: "import", icon: Upload, title: "Import Data", description: "Bulk upload contracts and clients", category: "Data", color: "amber" },
    { id: "delete", icon: Trash2, title: "Delete Account", description: "Permanently remove your account", category: "Data", color: "red" },

    // Support
    { id: "help", icon: HelpCircle, title: "Help & Support", description: "Access guides and contact support", category: "Support", color: "slate" },
    { id: "docs", icon: FileText, title: "Documentation", description: "View API docs and user manuals", category: "Support", color: "slate" },
    { id: "privacy", icon: Shield, title: "Privacy & Security", description: "Review data privacy settings", category: "Support", color: "slate" },
];

const colorMap: Record<string, { bg: string; text: string; light: string; border: string }> = {
    indigo: { bg: "bg-indigo-600", text: "text-indigo-600", light: "bg-indigo-50", border: "border-indigo-100" },
    blue: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-100" },
    emerald: { bg: "bg-emerald-600", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-100" },
    purple: { bg: "bg-purple-600", text: "text-purple-600", light: "bg-purple-50", border: "border-purple-100" },
    amber: { bg: "bg-amber-600", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-100" },
    red: { bg: "bg-red-600", text: "text-red-600", light: "bg-red-50", border: "border-red-100" },
    slate: { bg: "bg-slate-600", text: "text-slate-600", light: "bg-slate-50", border: "border-slate-100" },
};

export default function SettingsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSetting, setSelectedSetting] = useState<SettingItem | null>(null);

    const handleSettingClick = (setting: SettingItem) => {
        setSelectedSetting(setting);
        setIsModalOpen(true);
    };

    const categories = [...new Set(settingsData.map(s => s.category))];

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Settings className="w-6 h-6 text-indigo-600" />
                        Settings
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Manage your account, preferences, and system configurations.
                    </p>
                </div>

                {/* Settings Grid by Category */}
                <div className="space-y-8">
                    {categories.map((category) => (
                        <div key={category}>
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-8 h-px bg-slate-200"></span>
                                {category}
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {settingsData
                                    .filter(s => s.category === category)
                                    .map((setting) => {
                                        const colors = colorMap[setting.color];
                                        return (
                                            <button
                                                key={setting.id}
                                                onClick={() => handleSettingClick(setting)}
                                                className="group bg-white rounded-xl p-5 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-200 text-left flex items-start gap-4"
                                            >
                                                <div className={`p-3 ${colors.light} rounded-xl ${colors.text} group-hover:scale-110 transition-transform shrink-0`}>
                                                    <setting.icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                                            {setting.title}
                                                        </h3>
                                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0" />
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                        {setting.description}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Version Info */}
                <div className="mt-12 pt-6 border-t border-slate-200 text-center">
                    <p className="text-xs text-slate-400">
                        Tripower Dashboard v1.0.0 • © {new Date().getFullYear()} All rights reserved
                    </p>
                </div>
            </div>

            {/* Coming Soon Modal */}
            {isModalOpen && selectedSetting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

                        {/* Header with gradient */}
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white/20 rounded-xl">
                                        <selectedSetting.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">{selectedSetting.title}</h2>
                                        <p className="text-indigo-200 text-xs">{selectedSetting.category}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 text-center">
                            {/* Coming Soon Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-4">
                                <Clock className="w-4 h-4 text-indigo-600" />
                                <span className="text-sm font-bold text-indigo-700 uppercase tracking-wide">Coming Soon</span>
                            </div>

                            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                We're working hard to bring you this feature. Stay tuned for updates!
                            </p>

                            {/* Progress Bar */}
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-6">
                                <div className="h-full w-3/4 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/30" style={{
                                        animation: 'shimmer 2s infinite linear',
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                        transform: 'translateX(-100%)'
                                    }}></div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 mb-6">Estimated: Q2 2026</p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                                >
                                    <Bell className="w-4 h-4" />
                                    Notify Me
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
