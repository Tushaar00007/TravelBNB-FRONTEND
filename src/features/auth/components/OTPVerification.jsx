import { useState, useEffect, useRef } from "react";
import { Loader2, ShieldCheck, Timer, RefreshCw, Smartphone, Copy, Check, Info } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../../services/api";

export default function OTPVerification({ identifier, onVerify, onBack, type="signup", initialOtp = null }) {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [devOtp, setDevOtp] = useState(initialOtp);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef([]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp.map((d, idx) => (idx === index ? element.value : d))];
    setOtp(newOtp);

    // Focus next input
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setLoading(true);
    try {
      const endpoint = type === "login" ? "/otp/login-otp" : "/otp/send-otp";
      const res = await API.post(endpoint, { identifier });
      
      if (res.data.otp) {
        setDevOtp(res.data.otp);
        toast.success("New OTP generated!");
      } else {
        toast.success("OTP resent! Check your device.");
      }
      
      setTimer(30);
      setCanResend(false);
      setOtp(new Array(6).fill(""));
      inputRefs.current[0].focus();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      toast.error("Please enter the full 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/otp/verify-otp", { 
        identifier: identifier, 
        otp: otpCode 
      });
      
      if (res.data.is_verified) {
        toast.success("Verification successful!");
        onVerify(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (devOtp) {
      navigator.clipboard.writeText(devOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("OTP copied to clipboard!");
    }
  };

  const formatIdentifier = (val) => {
    if (!val) return "";
    if (val.includes("@")) {
      const [user, domain] = val.split("@");
      return `${user.slice(0, 3)}***@${domain}`;
    }
    const cleanNum = val.replace(/\D/g, "");
    if (cleanNum.length < 10) return val;
    return `+91 ******${cleanNum.slice(-4)}`;
  };

  return (
    <div className="otp-container animate-in fade-in slide-in-from-bottom-4 duration-500">
      <style>{`
        .otp-container {
          width: 100%;
          text-align: center;
        }
        .otp-icon-wrap {
          width: 64px;
          height: 64px;
          background: rgba(249, 115, 22, 0.1);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: #f97316;
          box-shadow: 0 8px 16px rgba(249, 115, 22, 0.1);
        }
        .otp-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }
        .otp-desc {
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 2rem;
          line-height: 1.5;
        }
        .phone-highlight {
          color: #1a1a1a;
          font-weight: 600;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .otp-input-group {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 2rem;
        }
        .otp-input {
          width: 45px;
          height: 54px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          background: #fff;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }
        .otp-input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
          transform: translateY(-2px);
        }
        .otp-input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
          transform: translateY(-2px);
        }
        .timer-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #9ca3af;
          margin-bottom: 2rem;
        }
        .resend-btn {
          color: #f97316;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .resend-btn:hover:not(:disabled) {
          background: rgba(249, 115, 22, 0.05);
        }
        .resend-btn:disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }
        .btn-verify {
          width: 100%;
          background: linear-gradient(135deg, #f97316, #fb923c);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 20px rgba(249, 115, 22, 0.3);
        }
        .btn-verify:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(249, 115, 22, 0.4);
        }
        .btn-verify:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .back-link {
          display: inline-block;
          margin-top: 1.5rem;
          font-size: 0.85rem;
          color: #9ca3af;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: #6b7280;
        }
        
        /* Dev Mode Styles */
        .dev-otp-box {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 1px solid #bae6fd;
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          animation: slideInDown 0.4s ease-out;
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dev-badge {
          background: #0ea5e9;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 99px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .dev-otp-display {
          font-family: 'DM Sans', monospace;
          font-size: 1.5rem;
          font-weight: 700;
          color: #0369a1;
          letter-spacing: 0.2em;
        }
        .copy-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          border: 1px solid #bae6fd;
          color: #0369a1;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .copy-btn:hover {
          background: #f8fafc;
          border-color: #0ea5e9;
          color: #0ea5e9;
        }
        .copy-btn.copied {
          background: #22c55e;
          border-color: #22c55e;
          color: #fff;
        }
      `}</style>

      {devOtp && (
        <div className="dev-otp-box">
          <div className="flex items-center gap-2">
            <span className="dev-badge">Development Only</span>
            <Info size={14} className="text-sky-500" />
          </div>
          <div className="dev-otp-display">{devOtp}</div>
          <button 
            className={`copy-btn ${copied ? "copied" : ""}`}
            onClick={handleCopy}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy OTP"}
          </button>
        </div>
      )}

      <div className="otp-icon-wrap">
        <ShieldCheck size={32} />
      </div>

      <h2 className="otp-title">Verify {identifier.includes("@") ? "Email" : "Phone"}</h2>
      <p className="otp-desc">
        We've sent a 6-digit code to <br />
        <span className="phone-highlight">{formatIdentifier(identifier)}</span>
      </p>

      <div className="otp-input-group">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            ref={(el) => (inputRefs.current[index] = el)}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="otp-input"
          />
        ))}
      </div>

      <div className="timer-row">
        {timer > 0 ? (
          <>
            <Timer size={14} />
            <span>Resend code in <strong className="text-gray-700">{timer}s</strong></span>
          </>
        ) : (
          <button 
            type="button" 
            onClick={handleResend} 
            disabled={loading}
            className="resend-btn"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Resend OTP
          </button>
        )}
      </div>

      <button
        onClick={handleVerify}
        disabled={loading || otp.join("").length < 6}
        className="btn-verify"
      >
        {loading ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
        {loading ? "Verifying..." : "Verify & Continue"}
      </button>

      <div onClick={onBack} className="back-link">
        ← Back to {type === "login" ? "details" : "details"}
      </div>
    </div>
  );
}
