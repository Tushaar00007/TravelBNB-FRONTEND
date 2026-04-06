import { useState, useEffect, useRef } from "react";
import { X, Copy, Check, Link2 } from "lucide-react";

// ─── Platform config ──────────────────────────────────
const PLATFORMS = [
    {
        id: "whatsapp",
        label: "WhatsApp",
        color: "#25D366",
        bg: "bg-[#25D366]",
        action: (url) =>
            window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank"),
        Icon: () => (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
        ),
    },
    {
        id: "twitter",
        label: "X",
        color: "#000000",
        bg: "bg-black",
        action: (url) =>
            window.open(
                `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=Check out this amazing property on TravelBNB!`,
                "_blank"
            ),
        Icon: () => (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    {
        id: "email",
        label: "Email",
        color: "#EA4335",
        bg: "bg-[#EA4335]",
        action: (url) =>
            (window.location.href = `mailto:?subject=Check out this property on TravelBNB&body=${encodeURIComponent(url)}`),
        Icon: () => (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
        ),
    },
    {
        id: "facebook",
        label: "Facebook",
        color: "#1877F2",
        bg: "bg-[#1877F2]",
        action: (url) =>
            window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                "_blank"
            ),
        Icon: () => (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
    },
    {
        id: "telegram",
        label: "Telegram",
        color: "#26A5E4",
        bg: "bg-[#26A5E4]",
        action: (url) =>
            window.open(
                `https://t.me/share/url?url=${encodeURIComponent(url)}&text=Check out this property on TravelBNB!`,
                "_blank"
            ),
        Icon: () => (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.820 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
        ),
    },
];

// ─── Component ───────────────────────────────────────
function ShareModal({ url, onClose }) {
    const [copied, setCopied] = useState(false);
    const [visible, setVisible] = useState(false);
    const overlayRef = useRef(null);

    // Animate in on mount
    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 250);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Fallback for older browsers
            const el = document.createElement("textarea");
            el.value = url;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    // Close on overlay click
    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) handleClose();
    };

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className={`fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-250 ${visible ? "opacity-100" : "opacity-0"
                }`}
        >
            <div
                className={`relative w-full sm:max-w-md bg-gray-950 text-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transition-transform duration-250 ${visible ? "translate-y-0 scale-100" : "translate-y-8 scale-95"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-extrabold tracking-tight">Share this property</h3>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Platform icons */}
                <div className="flex gap-5 overflow-x-auto pb-2 mb-6 hide-scrollbars">
                    {PLATFORMS.map(({ id, label, bg, action, Icon }) => (
                        <button
                            key={id}
                            onClick={() => action(url)}
                            className="flex flex-col items-center gap-2 shrink-0 group"
                        >
                            <div
                                className={`w-14 h-14 ${bg} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-active:scale-95 transition-transform duration-150`}
                            >
                                <Icon />
                            </div>
                            <span className="text-xs font-semibold text-gray-400 group-hover:text-white transition-colors">
                                {label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10 mb-5" />

                {/* Copy link row */}
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Link2 size={12} /> Link
                </p>
                <div className="flex gap-2">
                    <div className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2">
                        <Link2 size={14} className="text-gray-500 shrink-0" />
                        <span className="text-sm text-gray-300 truncate font-mono">{url}</span>
                    </div>
                    <button
                        onClick={handleCopy}
                        className={`shrink-0 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${copied
                                ? "bg-green-500 text-white"
                                : "bg-white text-gray-900 hover:bg-gray-100 active:scale-95"
                            }`}
                    >
                        {copied ? (
                            <>
                                <Check size={15} /> Copied!
                            </>
                        ) : (
                            <>
                                <Copy size={15} /> Copy
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ShareModal;
