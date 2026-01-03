import { useState, useEffect } from "react";
import {
    ShieldCheck,
    Building2,
    Phone,
    Mail,
    ArrowRight,
    Activity,
    Users,
    FileCheck,
    Zap,
    Target,
    Award,
    MapPin,
    Clock,
    CheckCircle2,
    Star,
    Sparkles,
    Leaf,
    HeartHandshake,
    X,
    MessageCircle,
    User,
    Home,
    Send
} from "lucide-react";

export default function AboutPage() {
    const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
    const [counters, setCounters] = useState({ properties: 0, compliance: 0, technicians: 0, years: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        propertyType: '',
        message: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitToWhatsApp = () => {
        const whatsappNumber = "918589874565";
        const message = `🏢 *New Consultation Request*

👤 *Name:* ${formData.name || 'Not provided'}
📧 *Email:* ${formData.email || 'Not provided'}
📱 *Phone:* ${formData.phone || 'Not provided'}
🏠 *Property Type:* ${formData.propertyType || 'Not specified'}

💬 *Message:*
${formData.message || 'No additional message'}

---
_Sent from Tripower Website_`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
        setIsModalOpen(false);
        setFormData({ name: '', email: '', phone: '', propertyType: '', message: '' });
    };

    // Intersection Observer for fade-in animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleSections((prev) => new Set(prev).add(entry.target.id));
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('[data-animate]').forEach((el) => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    // Counter animation for metrics
    useEffect(() => {
        if (visibleSections.has('metrics')) {
            const targets = { properties: 250, compliance: 100, technicians: 50, years: 15 };
            const duration = 2000;
            const steps = 60;
            const interval = duration / steps;

            let step = 0;
            const timer = setInterval(() => {
                step++;
                const progress = step / steps;
                setCounters({
                    properties: Math.round(targets.properties * progress),
                    compliance: Math.round(targets.compliance * progress),
                    technicians: Math.round(targets.technicians * progress),
                    years: Math.round(targets.years * progress),
                });
                if (step >= steps) clearInterval(timer);
            }, interval);

            return () => clearInterval(timer);
        }
    }, [visibleSections]);

    const services = [
        {
            icon: ShieldCheck,
            title: "Pest Management",
            description: "Integrated pest control with eco-compliant, non-toxic solutions for residential and commercial towers.",
            color: "indigo",
            features: ["Termite Control", "Rodent Management", "Insect Elimination"]
        },
        {
            icon: Award,
            title: "Building Hygiene",
            description: "Comprehensive deep cleaning and sanitation for common areas, facades, and industrial assets.",
            color: "emerald",
            features: ["Facade Cleaning", "Tank Sanitization", "Common Area Maintenance"]
        },
        {
            icon: FileCheck,
            title: "Service Contracts",
            description: "Structured AMCs designed for property management firms with predictable scheduling.",
            color: "amber",
            features: ["Annual Contracts", "Flexible Terms", "Priority Support"]
        },
        {
            icon: Leaf,
            title: "Eco Solutions",
            description: "Environmentally responsible methods that protect both your property and the planet.",
            color: "teal",
            features: ["Green Products", "Sustainable Practices", "Low Environmental Impact"]
        }
    ];

    const values = [
        { icon: Target, title: "Precision", description: "Targeted solutions for maximum effectiveness" },
        { icon: Clock, title: "Reliability", description: "On-time service delivery, every time" },
        { icon: HeartHandshake, title: "Trust", description: "Building long-term client partnerships" },
        { icon: Star, title: "Excellence", description: "Exceeding industry standards consistently" }
    ];

    const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
        indigo: { bg: "bg-indigo-600", text: "text-indigo-600", border: "border-indigo-200", light: "bg-indigo-50" },
        emerald: { bg: "bg-emerald-600", text: "text-emerald-600", border: "border-emerald-200", light: "bg-emerald-50" },
        amber: { bg: "bg-amber-600", text: "text-amber-600", border: "border-amber-200", light: "bg-amber-50" },
        teal: { bg: "bg-teal-600", text: "text-teal-600", border: "border-teal-200", light: "bg-teal-50" }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">

            {/* --- HERO SECTION --- */}
            <section
                id="hero"
                data-animate
                className={`relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden transition-all duration-700 ${visibleSections.has('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
            >
                {/* Subtle Background Elements */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-40 -z-10"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-30 -z-10"></div>

                <div className="max-w-5xl mx-auto">
                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold tracking-wider uppercase text-slate-600">
                            Operational Since 2009
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-slate-900 mb-4">
                        The Gold Standard{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-500">
                            For Hygiene
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg text-slate-500 max-w-2xl leading-relaxed mb-8">
                        Tripower engineers safe environments for Dubai's premier real estate. We combine industrial compliance with corporate professionalism, serving 250+ properties across the UAE.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <div className="group px-4 py-3 bg-slate-900 text-white rounded-xl font-semibold flex items-center gap-3 shadow-lg hover:bg-slate-800 transition-all cursor-pointer">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">HQ</span>
                                <span className="text-sm">Al Murar, Dubai</span>
                            </div>
                        </div>

                        <div className="px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-3 shadow-sm">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <Target className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Focus</span>
                                <span className="text-sm">B2B Property Management</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SERVICES GRID --- */}
            <section
                id="services"
                data-animate
                className={`py-12 px-4 sm:px-6 lg:px-8 transition-all duration-700 delay-100 ${visibleSections.has('services') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
            >
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold tracking-wider uppercase text-indigo-600">Our Expertise</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">Core Services</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {services.map((service, idx) => {
                            const colors = colorMap[service.color];
                            return (
                                <div
                                    key={idx}
                                    className={`group bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer`}
                                    style={{ transitionDelay: `${idx * 50}ms` }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 ${colors.light} rounded-xl ${colors.text} group-hover:scale-110 transition-transform`}>
                                            <service.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{service.title}</h3>
                                            <p className="text-sm text-slate-500 mb-3 leading-relaxed">{service.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {service.features.map((feature, fIdx) => (
                                                    <span key={fIdx} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* --- METRICS SECTION --- */}
            <section
                id="metrics"
                data-animate
                className={`py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white transition-all duration-700 delay-200 ${visibleSections.has('metrics') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
            >
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <span className="text-xs font-bold tracking-wider uppercase text-indigo-400">By The Numbers</span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">Operational Metrics</h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-700 text-center hover:bg-slate-800 transition-colors group">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div className="text-3xl sm:text-4xl font-black text-white mb-1">{counters.properties}<span className="text-indigo-400">+</span></div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Properties</div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-700 text-center hover:bg-slate-800 transition-colors group">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="text-3xl sm:text-4xl font-black text-white mb-1">{counters.compliance}<span className="text-emerald-400">%</span></div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Compliance</div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-700 text-center hover:bg-slate-800 transition-colors group">
                            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="text-3xl sm:text-4xl font-black text-white mb-1">{counters.technicians}<span className="text-amber-400">+</span></div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Technicians</div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 rounded-2xl text-center shadow-lg shadow-indigo-500/20 group">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div className="text-3xl sm:text-4xl font-black text-white mb-1">{counters.years}<span className="text-indigo-200">+</span></div>
                            <div className="text-xs font-bold text-indigo-200 uppercase tracking-wide">Years</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- VALUES SECTION --- */}
            <section
                id="values"
                data-animate
                className={`py-12 px-4 sm:px-6 lg:px-8 transition-all duration-700 delay-300 ${visibleSections.has('values') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
            >
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold tracking-wider uppercase text-emerald-600">What Drives Us</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">Our Core Values</h2>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {values.map((value, idx) => (
                            <div
                                key={idx}
                                className="group bg-white rounded-2xl p-5 border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all text-center"
                                style={{ transitionDelay: `${idx * 50}ms` }}
                            >
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 mx-auto mb-4 group-hover:bg-indigo-100 group-hover:text-indigo-600 group-hover:scale-110 transition-all">
                                    <value.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1">{value.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- WHY CHOOSE US --- */}
            <section
                id="why"
                data-animate
                className={`py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-slate-50 transition-all duration-700 delay-400 ${visibleSections.has('why') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
            >
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <span className="text-xs font-bold tracking-wider uppercase text-indigo-600">Why Tripower</span>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 mb-4">The Tripower Difference</h2>
                            <p className="text-slate-500 mb-6 leading-relaxed">
                                With over 15 years in the UAE facility management industry, we've built a reputation for reliability,
                                quality, and customer-centric service that sets us apart.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { icon: CheckCircle2, text: "Dubai Municipality Approved" },
                                    { icon: CheckCircle2, text: "24/7 Emergency Response Team" },
                                    { icon: CheckCircle2, text: "Eco-Friendly Certified Products" },
                                    { icon: CheckCircle2, text: "Dedicated Account Managers" }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-slate-700">
                                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                            <item.icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-medium text-sm">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <Activity className="w-5 h-5 text-emerald-500" />
                                <span className="font-bold text-lg text-slate-900">Quick Contact</span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">24/7 Support</p>
                                        <p className="font-semibold text-slate-800">+971 4 XXX XXXX</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</p>
                                        <p className="font-semibold text-slate-800">info@tripower.ae</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</p>
                                        <p className="font-semibold text-slate-800">Al Murar, Deira, Dubai</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER CTA --- */}
            <section
                id="cta"
                data-animate
                className={`py-10 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white transition-all duration-700 delay-500 ${visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
            >
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-4">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Ready to get started?</h3>
                            <p className="text-slate-400 text-sm">Contact us for a free property assessment.</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 group shadow-lg"
                        >
                            Request Consultation
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 font-medium">
                        <p>© {new Date().getFullYear()} Tripower Services. Dubai, UAE.</p>
                        <div className="flex gap-4 mt-3 sm:mt-0">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CONSULTATION MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <MessageCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Request Consultation</h2>
                                        <p className="text-indigo-200 text-xs">We'll respond via WhatsApp</p>
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

                        {/* Form Body */}
                        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">

                            {/* Name */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Full Name *</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email & Phone Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="you@email.com"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Phone *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+971 50 XXX XXXX"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Property Type */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Property Type</label>
                                <div className="relative">
                                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        name="propertyType"
                                        value={formData.propertyType}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Select property type...</option>
                                        <option value="Residential Tower">Residential Tower</option>
                                        <option value="Commercial Building">Commercial Building</option>
                                        <option value="Villa/Compound">Villa / Compound</option>
                                        <option value="Warehouse">Warehouse / Industrial</option>
                                        <option value="Restaurant/F&B">Restaurant / F&B</option>
                                        <option value="Hotel">Hotel / Hospitality</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Tell us about your requirements, property size, or any specific concerns..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                />
                            </div>

                            {/* WhatsApp Info */}
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4 text-white" />
                                </div>
                                <div className="text-xs text-emerald-700">
                                    <span className="font-bold">WhatsApp Consultation</span>
                                    <p className="text-emerald-600">Your details will be sent to our team via WhatsApp for faster response.</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitToWhatsApp}
                                disabled={!formData.name || !formData.phone}
                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-emerald-200"
                            >
                                <Send className="w-4 h-4" />
                                Send via WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}