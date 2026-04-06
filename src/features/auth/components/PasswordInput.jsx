import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function PasswordInput({ value, onChange, placeholder = "Password", name = "password", onKeyUp }) {
    const [show, setShow] = useState(false);
    const [capsLock, setCapsLock] = useState(false);

    const handleKey = (e) => {
        if (e.getModifierState) {
            setCapsLock(e.getModifierState("CapsLock"));
        }
        onKeyUp?.(e);
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                <Lock 
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                    className="text-gray-400 pointer-events-none" 
                    size={18} 
                />
                <input
                    name={name}
                    type={show ? "text" : "password"}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onKeyUp={handleKey}
                    onFocus={handleKey}
                    style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
                    className="w-full h-12 bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 rounded-xl text-[0.95rem] text-gray-900 placeholder-gray-400 outline-none transition-all duration-200"
                />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                    className="text-gray-400 hover:text-orange-500 transition-colors p-1"
                    tabIndex={-1}
                    aria-label={show ? "Hide password" : "Show password"}
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            {capsLock && (
                <p className="absolute -bottom-6 left-1 text-[11px] text-amber-600 flex items-center gap-1 font-semibold uppercase tracking-wider">
                    ⚠ Caps Lock is ON
                </p>
            )}
        </div>
    );
}
