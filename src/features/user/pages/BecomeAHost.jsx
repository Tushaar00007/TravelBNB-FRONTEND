import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Home, Tent, Compass, ArrowRight,
    DollarSign, Shield, LayoutDashboard,
    CheckCircle2, Star
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const HOSTING_OPTIONS = [
    {
        id: "home",
        icon: Home,
        emoji: "🏠",
        title: "Host Home",
        tagline: "Your property, your rules",
        description:
            "List your home, apartment, villa or any property for travellers to stay. Perfect for anyone with a spare room or an entire place to rent out.",
        highlights: [
            "Earn from your spare room or property",
            "Set your own price and availability",
            "Full control over who stays",
        ],
        cta: "Get Started",
        route: "/host/address",
        gradient: "from-orange-50 to-amber-50",
        activeBorder: "border-orange-500",
        iconColor: "text-orange-600",
        iconBg: "bg-orange-50",
        badge: "Most Popular",
        badgeColor: "bg-orange-500 text-white",
    },
    {
        id: "crashpad",
        icon: Tent,
        emoji: "⛺",
        title: "Host Crashpad",
        tagline: "Budget-friendly, community-first",
        description:
            "Offer a unique, budget-friendly crash space for backpackers and solo travellers. Hostel-style hosting made simple.",
        highlights: [
            "Perfect for hostel-style hosting",
            "Attract budget travellers globally",
            "Flexible short-term stays",
        ],
        cta: "Get Started",
        route: "/create-crashpad",
        gradient: "from-teal-50 to-cyan-50",
        activeBorder: "border-teal-500",
        iconColor: "text-teal-600",
        iconBg: "bg-teal-50",
        badge: null,
    },
    {
        id: "buddy",
        icon: Compass,
        emoji: "🧭",
        title: "Host Travel Buddy",
        tagline: "Be a local guide",
        description:
            "Become a local guide and travel companion for tourists exploring your city. No property needed — just your knowledge and time.",
        highlights: [
            "Share your local knowledge",
            "Set your own daily rate",
            "No property needed",
        ],
        cta: "Get Started",
        route: "/create-travel-buddy",
        gradient: "from-violet-50 to-purple-50",
        activeBorder: "border-violet-500",
        iconColor: "text-violet-600",
        iconBg: "bg-violet-50",
        badge: null,
    },
];

const BENEFITS = [
    {
        icon: DollarSign,
        title: "Earn on your schedule",
        desc: "Set your own availability and pricing. You're always in control.",
        color: "text-green-600",
        bg: "bg-green-50",
    },
    {
        icon: Shield,
        title: "Verified traveller protection",
        desc: "Every guest is identity-verified before they can book or connect.",
        color: "text-blue-600",
        bg: "bg-blue-50",
    },
    {
        icon: LayoutDashboard,
        title: "Easy management dashboard",
        desc: "Manage listings, bookings and messages in one beautiful dashboard.",
        color: "text-orange-600",
        bg: "bg-orange-50",
    },
];

// ─── Option Card ──────────────────────────────────────────────────────────────

function OptionCard({ option, isSelected, onSelect, onNavigate }) {
    const Icon = option.icon;

    return (
        <div
            onClick={() => onSelect(option.id)}
            className={`
                relative flex flex-col gap-6 p-8 rounded-3xl border-2 cursor-pointer
                bg-white transition-all duration-300 group
                hover:scale-[1.02] hover:shadow-2xl
                ${isSelected
                    ? `${option.activeBorder} shadow-xl scale-[1.02]`
                    : "border-gray-100 hover:border-gray-200 shadow-sm"
                }
            `}
        >
            {/* Badge */}
            {option.badge && (
                <div className={`absolute -top-3 left-8 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${option.badgeColor}`}>
                    {option.badge}
                </div>
            )}

            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl ${option.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                <Icon size={28} className={option.iconColor} strokeWidth={2} />
            </div>

            {/* Header */}
            <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{option.title}</h3>
                <p className={`text-xs font-black uppercase tracking-widest mt-1 ${option.iconColor}`}>
                    {option.tagline}
                </p>
            </div>

            {/* Description */}
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {option.description}
            </p>

            {/* Highlights */}
            <ul className="space-y-2.5 flex-1">
                {option.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                        <CheckCircle2 size={16} className={`${option.iconColor} mt-0.5 shrink-0`} strokeWidth={2.5} />
                        {h}
                    </li>
                ))}
            </ul>

            {/* CTA Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(option.route);
                }}
                className={`
                    w-full flex items-center justify-center gap-3 py-4 rounded-2xl
                    font-black text-sm uppercase tracking-widest transition-all duration-300
                    active:scale-95 mt-auto
                    ${isSelected
                        ? "bg-[#EA580C] text-white shadow-xl shadow-orange-500/20 hover:bg-orange-700"
                        : "bg-gray-900 text-white hover:bg-[#EA580C] hover:shadow-xl hover:shadow-orange-500/20"
                    }
                `}
            >
                {option.cta}
                <ArrowRight size={16} strokeWidth={3} />
            </button>
        </div>
    );
}

// ─── Benefit Tile ─────────────────────────────────────────────────────────────

function BenefitTile({ benefit }) {
    const Icon = benefit.icon;
    return (
        <div className="flex items-start gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className={`w-12 h-12 ${benefit.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={22} className={benefit.color} strokeWidth={2} />
            </div>
            <div>
                <h4 className="font-black text-gray-900 text-sm mb-1">{benefit.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed font-medium">{benefit.desc}</p>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BecomeAHost() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);

    const handleNavigate = (route) => navigate(route);

    return (
        <div className="min-h-screen bg-[#FAFDF9] dark:bg-gray-950">
            {/* Hero header */}
            <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-8">
                    <Star size={12} strokeWidth={3} />
                    Start Hosting Today
                </div>

                <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-5 leading-[1.05]">
                    What would you
                    <br />
                    like to{" "}
                    <span className="text-[#EA580C]">host?</span>
                </h1>

                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium max-w-xl mx-auto leading-relaxed">
                    Choose the type of hosting that suits you best. You can always add more listing types later.
                </p>
            </div>

            {/* Option cards */}
            <div className="max-w-6xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {HOSTING_OPTIONS.map((option) => (
                        <OptionCard
                            key={option.id}
                            option={option}
                            isSelected={selected === option.id}
                            onSelect={setSelected}
                            onNavigate={handleNavigate}
                        />
                    ))}
                </div>

                {/* Why host section */}
                <div className="mt-20">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                            Why host with <span className="text-[#EA580C]">TravelBNB?</span>
                        </h2>
                        <p className="text-gray-500 font-medium">
                            Join thousands of hosts already earning on the platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {BENEFITS.map((benefit) => (
                            <BenefitTile key={benefit.title} benefit={benefit} />
                        ))}
                    </div>
                </div>

                {/* Back link */}
                <div className="flex justify-center mt-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm font-bold text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                        ← Go back
                    </button>
                </div>
            </div>
        </div>
    );
}
