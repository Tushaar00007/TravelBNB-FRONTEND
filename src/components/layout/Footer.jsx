import React from "react";
import { Link } from "react-router-dom";
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube, 
  Globe, 
  CreditCard,
  Heart,
  ShieldCheck,
  Zap
} from "lucide-react";

/**
 * Premium Footer component with Orange + Black theme.
 * High-end Airbnb-style multi-column layout.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Support",
      links: [
        { label: "Help Centre", href: "#" },
        { label: "AirCover", href: "#" },
        { label: "Anti-discrimination", href: "#" },
        { label: "Disability support", href: "#" },
        { label: "Cancellation options", href: "#" },
        { label: "Report neighbourhood concern", href: "#" },
      ],
    },
    {
      title: "Hosting",
      links: [
        { label: "TravelBNB your home", href: "/become-host" },
        { label: "AirCover for Hosts", href: "#" },
        { label: "Hosting resources", href: "#" },
        { label: "Community forum", href: "#" },
        { label: "Hosting responsibly", href: "#" },
        { label: "Join a free hosting class", href: "#" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "TravelBuddy Hub", href: "/travel-buddy" },
        { label: "Couch Surfing Support", href: "/crashpads" },
        { label: "Emergency stays", href: "#" },
        { label: "Gift cards", href: "#" },
      ],
    },
    {
      title: "TravelBNB",
      links: [
        { label: "Newsroom", href: "#" },
        { label: "New features", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Investors", href: "#" },
        { label: "TravelBNB.org emergency stays", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-[#0f0f0f] text-white pt-16 pb-12 border-t border-gray-800 selection:bg-orange-500 selection:text-white">
      <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
        {/* Brand Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-800 pb-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:rotate-12 transition-transform duration-300">
                <Zap size={22} className="text-white fill-current" />
              </div>
              <span className="text-2xl font-black italic tracking-tighter text-white">
                Travel<span className="text-orange-500">BNB</span>
              </span>
            </Link>
            <p className="max-w-xs text-gray-400 text-sm font-medium leading-relaxed italic">
              Empowering global travelers through community-driven stays and seamless travel planning.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800 flex items-center gap-3">
              <ShieldCheck className="text-orange-500" size={24} />
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none mb-1">Secure Stays</p>
                <p className="text-xs font-bold text-white">100% Verified Hosts</p>
              </div>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800 flex items-center gap-3">
              <Zap className="text-orange-500" size={24} />
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none mb-1">Instant Booking</p>
                <p className="text-xs font-bold text-white">Real-time Confirmation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-6">
              <h3 className="text-orange-500 text-xs font-black uppercase tracking-widest italic leading-none">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-orange-500 transition-colors text-[13px] font-bold italic"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-[13px] font-bold text-gray-500 italic">
            <span>© {currentYear} TravelBNB, Inc.</span>
            <div className="hidden md:flex items-center gap-2 text-gray-800">•</div>
            <Link to="#" className="hover:text-orange-500 transition-colors">Privacy</Link>
            <div className="hidden md:flex items-center gap-2 text-gray-800">•</div>
            <Link to="#" className="hover:text-orange-500 transition-colors">Terms</Link>
            <div className="hidden md:flex items-center gap-2 text-gray-800">•</div>
            <Link to="#" className="hover:text-orange-500 transition-colors">Sitemap</Link>
            <div className="hidden md:flex items-center gap-2 text-gray-800">•</div>
            <Link to="#" className="hover:text-orange-500 transition-colors">Company details</Link>
          </div>

          <div className="flex items-center gap-10">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                <Globe size={18} className="group-hover:text-orange-500" />
                <span className="text-[13px] font-black uppercase tracking-widest">English (IN)</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                <CreditCard size={18} className="group-hover:text-orange-500" />
                <span className="text-[13px] font-black uppercase tracking-widest">₹ INR</span>
              </button>
            </div>

            <div className="flex items-center gap-5">
              <Link to="#" className="text-gray-400 hover:text-orange-500 transition-all hover:scale-110">
                <Facebook size={20} />
              </Link>
              <Link to="#" className="text-gray-400 hover:text-orange-500 transition-all hover:scale-110">
                <Twitter size={20} />
              </Link>
              <Link to="#" className="text-gray-400 hover:text-orange-500 transition-all hover:scale-110">
                <Instagram size={20} />
              </Link>
              <Link to="#" className="text-gray-400 hover:text-orange-500 transition-all hover:scale-110">
                <Youtube size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Love Note */}
        <div className="mt-12 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-800/50 flex items-center justify-center gap-2">
          MADE WITH <Heart size={10} className="text-orange-500/30 fill-current" /> BY TRAVELBNB TEAM
        </div>
      </div>
    </footer>
  );
};

export default Footer;
