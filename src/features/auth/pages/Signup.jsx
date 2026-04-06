import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../../services/api";
import PasswordInput from "../components/PasswordInput";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Loader2, User, Mail, Phone, Camera, ChevronRight, ChevronLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import OTPVerification from "../components/OTPVerification";
import toast from "react-hot-toast";

const SLIDES = [
  {
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?q=80&w=1065&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    tagline: "City of Dreams",
  },
  {
    city: "Udaipur",
    image: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=1600&q=90",
    tagline: "City of Lakes & Palaces",
  },
  {
    city: "Ayodhya",
    image: "https://images.unsplash.com/photo-1652059468417-3b44ff25afdf?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGl3YWxpJTIwaW4lMjBheW9kaHlhfGVufDB8fDB8fHww",
    tagline: "A Journey into Faith and Heritage",
  },
  {
    city: "Varanasi",
    image: "https://images.unsplash.com/photo-1627894483216-2138af692e32?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    tagline: "Eternal City on the Ganges",
  },
  {
    city: "Darjeeling",
    image: "https://plus.unsplash.com/premium_photo-1697730484307-a05ad3449015?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    tagline: "Tea, Mist & Mountains",
  },
  {
    city: "Leh",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=90",
    tagline: "Land of High Passes",
  },
];

function validateStep1(form) {
  const errs = {};
  if (form.name.trim().length < 2) errs.name = "Name must be at least 2 characters";
  const digits = form.phone.replace(/\D/g, "");
  if (digits.length !== 10) errs.phone = "Enter valid 10-digit phone number";
  return errs;
}

function validateStep3(form) {
  if (!form || !form.email) {
    console.error("Step 3 form data is undefined or missing email", form);
    return { email: "Please fill in your email address" };
  }
  const errs = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter valid email address";
  if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
  if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
  return errs;
}

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [countryCode, setCountryCode] = useState("+91");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [initialOtp, setInitialOtp] = useState(null);
  const googleMounted = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrev(current);
      setTransitioning(true);
      setTimeout(() => {
        setCurrent((i) => (i + 1) % SLIDES.length);
        setTransitioning(false);
        setPrev(null);
      }, 900);
    }, 4000);
    return () => clearInterval(timer);
  }, [current]);

  const slide = SLIDES[current];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
    setApiError("");
  };

  const handleNextToOTP = async () => {
    const errs = validateStep1(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setLoading(true);
    setApiError("");
    try {
      const fullPhone = `${countryCode}${form.phone.replace(/\D/g, "")}`;
      // Check if phone exists (optional but good practice here)
      // Actually, just send OTP
      const res = await API.post("/otp/send-otp", { identifier: fullPhone });
      setInitialOtp(res.data.otp || null);
      setStep(2);
      if (res.data.otp) {
        toast.success("Verification code sent (Dev Mode)!");
      } else {
        toast.success("Verification code sent to your phone.");
      }
    } catch (err) {
      setApiError(err.response?.data?.detail || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = () => {
    setStep(3);
    toast.success("Phone verified! Almost done.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard: if step 1 data is missing, redirect back to step 1
    if (!form.name || !form.phone) {
      toast.error("Missing account details. Please start from step 1.");
      setStep(1);
      return;
    }

    console.log("[Signup] handleSubmit — current form state:", form);

    const errs = validateStep3(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setLoading(true);
    setApiError("");
    try {
      const fullPhone = `${countryCode}${form.phone.replace(/\D/g, "")}`;
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("phone", fullPhone);
      fd.append("password", form.password);

      await API.post("/auth/register", fd);
      toast.success("Registration complete! Please verify your email.");
      navigate("/login", { state: { message: "Account created! You can now sign in." } });
    } catch (err) {
      setApiError(err.response?.data?.detail || "Final registration failed.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .signup-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          font-family: 'DM Sans', sans-serif;
          background: #fff;
        }
        @media (max-width: 1024px) {
          .signup-root { grid-template-columns: 1fr; }
          .signup-visual { display: none !important; }
        }

        /* ── Visual ── */
        .signup-visual {
          position: relative;
          overflow: hidden;
          background: #000;
        }
        .slide-img {
          position: absolute;
          inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          transition: opacity 1.2s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: opacity, transform;
        }
        .slide-img.active { opacity: 1; transform: scale(1.1); }
        .slide-img.exiting { opacity: 0; transform: scale(1.2); }
        .slide-img.hidden { opacity: 0; transform: scale(1.05); }

        .panel-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0),
            rgba(0,0,0,0.2) 30%,
            rgba(0,0,0,0.85) 100%
          );
          backdrop-filter: blur(1.5px);
          z-index: 2;
        }

        .panel-content {
          position: absolute;
          inset: 0;
          z-index: 3;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 4rem;
        }

        .brand-top {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.01em;
        }

        .city-block { margin-bottom: 0.5rem; }
        .city-label {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          margin-bottom: 0.75rem;
        }
        .city-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 5vw, 5.5rem);
          font-weight: 900;
          color: #fff;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .city-name.fade-out { opacity: 0; transform: translateY(15px); }
        .city-name.fade-in  { opacity: 1; transform: translateY(0); }

        .city-tagline {
          font-size: 1.15rem;
          font-weight: 400;
          color: rgba(255,255,255,0.8);
          margin-top: 1rem;
          line-height: 1.5;
        }

        .dots { display: flex; gap: 10px; margin-top: 2.5rem; }
        .dot {
          height: 4px; border-radius: 4px; background: rgba(255,255,255,0.3);
          transition: all 0.4s ease; cursor: pointer;
        }
        .dot.active { width: 40px; background: #fff; }
        .dot:not(.active) { width: 12px; }

        .form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fdfdfd;
          padding: 3rem;
          position: relative;
        }

        .signup-card {
          width: 100%;
          max-width: 448px;
          background: #ffffff;
          padding: 2.5rem;
          border-radius: 1.5rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid #e5e7eb;
          animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .form-header { text-align: center; margin-bottom: 2rem; }

        /* Step indicator */
        .step-track {
          display: flex; align-items: center; justify-content: center;
          gap: 0.75rem; margin-bottom: 2rem;
        }
        .step-circle {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem; font-weight: 700;
          transition: all 0.3s;
        }
        .step-circle.done { background: #f97316; color: #fff; box-shadow: 0 4px 10px rgba(249,115,22,0.3); }
        .step-circle.active { background: #fff; color: #f97316; border: 2px solid #f97316; }
        .step-circle.pending { background: #f9fafb; color: #9ca3af; border: 1px solid #e5e7eb; }
        .step-line {
          width: 30px; height: 2px; border-radius: 2px;
          transition: background 0.4s;
        }
        .step-line.done { background: #f97316; }
        .step-line.pending { background: #e5e7eb; }

        .form-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
          letter-spacing: -0.025em;
        }
        .form-sub { font-size: 0.875rem; color: #6b7280; font-weight: 400; }

        .divider {
          display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0;
        }
        .divider-line { flex: 1; height: 1px; background: #e5e7eb; }
        .divider-text { font-size: 0.75rem; color: #4b5563; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

        .field-group { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 1.5rem; }
        .label-text {
          display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;
        }
        .field-wrap { position: relative; }
        .input-icon {
          position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
          color: #6b7280; z-index: 10;
        }

        /* Country Code Selector */
        .phone-group { display: flex; gap: 0.5rem; }
        .country-select {
          width: 100px; height: 3rem; background: #fff;
          border: 1px solid #d1d5db; border-radius: 0.75rem;
          padding: 0 0.5rem; font-size: 0.95rem; color: #111827;
          outline: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .country-select:focus { border-color: #f97316; box-shadow: 0 0 0 4px rgba(249,115,22,0.1); }

        .input-field {
          width: 100%; height: 3rem; background: #ffffff;
          border: 1px solid #d1d5db; border-radius: 0.75rem;
          padding: 0 1rem 0 2.75rem; font-size: 0.95rem; color: #111827;
          transition: all 0.2s; outline: none;
        }
        .input-field.no-icon { padding-left: 1rem; }
        .input-field:focus {
          border-color: #f97316; box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(249,115,22,0.2);
        }
        .field-error { font-size: 0.75rem; color: #dc2626; margin-top: 0.375rem; font-weight: 500; }

        .btn-primary {
          width: 100%; height: 3rem;
          background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
          color: #fff; border: none; border-radius: 0.75rem;
          font-weight: 700; font-size: 0.95rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(249,115,22,0.2);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(249,115,22,0.3); }
        .btn-primary:active { transform: scale(1); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

        .btn-ghost {
          height: 3.5rem; background: #fff;
          border: 1.5px solid #f3f4f6; color: #4b5563;
          border-radius: 1rem; padding: 0 1.5rem;
          font-weight: 600; font-size: 1rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: all 0.2s;
        }
        .btn-ghost:hover { background: #f9fafb; border-color: #f97316; color: #f97316; }

        .btn-row { display: flex; gap: 1rem; }
        .btn-grow { flex: 1; }

        .login-text { text-align: center; margin-top: 2rem; font-size: 1rem; color: #6b7280; }
        .login-link { color: #f97316; font-weight: 700; text-decoration: none; margin-left: 4px; }
        .login-link:hover { text-decoration: underline; }

        .api-error-box {
          background: #fff1f2; border: 1px solid #fecaca; color: #b91c1c;
          padding: 1rem; border-radius: 1rem; font-size: 0.9rem;
          margin-bottom: 1.5rem; text-align: center; font-weight: 500;
        }

        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .step-enter { animation: slideUp 0.35s cubic-bezier(0.4,0,0.2,1) both; }
      `}</style>

      <div className="signup-root">
        {/* ── Form Panel Refactor ── */}
        <div className="form-panel">
          <div className="signup-card">
            <div className="form-header">
              <Link to="/" style={{ textDecoration: 'none' }}>
                <div className="brand-top" style={{ color: '#f97316', marginBottom: '1.5rem', textAlign: 'center' }}>TravelBNB</div>
              </Link>
              
              <div className="step-track">
                <div className={`step-circle ${step > 1 ? "done" : "active"}`}>1</div>
                <div className={`step-line ${step > 1 ? "done" : "pending"}`} />
                <div className={`step-circle ${step === 2 ? "active" : step > 2 ? "done" : "pending"}`}>2</div>
                <div className={`step-line ${step > 2 ? "done" : "pending"}`} />
                <div className={`step-circle ${step === 3 ? "active" : "pending"}`}>3</div>
              </div>

              <h1 className="form-title">
                {step === 1 ? "Sign up" : step === 2 ? "Verify Phone" : "Final details"}
              </h1>
              <p className="form-sub">
                {step === 1 ? "Start with your name and phone" : step === 2 ? "Enter the code sent to your phone" : "Set your account credentials"}
              </p>
            </div>

            {apiError && <div className="api-error-box">❌ {apiError}</div>}

            {step === 1 && (
              <div className="step-enter">
                <div className="google-btn-wrap" style={{ border: '1px solid #e5e7eb', borderRadius: '40px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  {/* googleMounted ref prevents double-init warning from React StrictMode */}
                  <GoogleLogin
                    onSuccess={(res) => toast.success("Google login selected")}
                    onError={() => setApiError("Google sign-in is unavailable. Please use phone signup.")}
                    width="100%"
                  />
                </div>

                <div className="divider">
                  <div className="divider-line" /><span className="divider-text">or with phone</span><div className="divider-line" />
                </div>

                <div className="field-group">
                  <div>
                    <label className="label-text">Full Name</label>
                    <div className="field-wrap">
                      <User className="input-icon" size={18} />
                      <input
                        name="name" type="text" placeholder="e.g. John Doe"
                        value={form.name} onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                    {errors.name && <p className="field-error">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="label-text">Phone Number</label>
                    <div className="phone-group">
                      <select 
                        className="country-select" 
                        value={countryCode} 
                        onChange={(e) => setCountryCode(e.target.value)}
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+971">🇦🇪 +971</option>
                      </select>
                      <input
                        name="phone" type="tel" placeholder="10-digit number"
                        value={form.phone} onChange={handleChange}
                        className="input-field no-icon"
                      />
                    </div>
                    {errors.phone && <p className="field-error">{errors.phone}</p>}
                  </div>
                </div>

                <button type="button" onClick={handleNextToOTP} disabled={loading} className="btn-primary">
                  {loading ? <Loader2 size={18} className="spin" /> : <>Next <ChevronRight size={18} /></>}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="step-enter">
                <OTPVerification 
                  identifier={`${countryCode}${form.phone.replace(/\D/g, "")}`} 
                  initialOtp={initialOtp}
                  onVerify={handleOTPVerified} 
                  onBack={() => setStep(1)} 
                  type="signup"
                />
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit} noValidate className="step-enter">
                <div className="field-group">
                  <div>
                    <label className="label-text">Email Address</label>
                    <div className="field-wrap">
                      <Mail className="input-icon" size={18} />
                      <input
                        name="email" type="email" placeholder="name@example.com"
                        value={form.email} onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                    {errors.email && <p className="field-error">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="label-text">Password</label>
                    <PasswordInput name="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" />
                    {errors.password && <p className="field-error">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="label-text">Confirm Password</label>
                    <PasswordInput name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" />
                    {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <Loader2 size={18} className="spin" /> : <>Create Account <ArrowRight size={18} /></>}
                </button>
              </form>
            )}

            <p className="login-text">
              Already have an account? <Link to="/login" className="login-link">Sign In</Link>
            </p>
          </div>
        </div>

        {/* ── Visual Panel ── */}
        <div className="signup-visual">
          {SLIDES.map((s, i) => (
            <img
              key={s.city}
              src={s.image}
              alt={s.city}
              className={`slide-img ${i === current ? "active" : i === prev ? "exiting" : "hidden"}`}
              loading="lazy"
            />
          ))}

          <div className="panel-overlay" />

          <div className="panel-content">
            <div className="brand-top">TravelBNB</div>

            <div className="city-block">
              <span className="city-label">Discover next</span>
              <div className={`city-name ${transitioning ? "fade-out" : "fade-in"}`}>{slide.city}</div>
              <div className={`city-tagline ${transitioning ? "fade-out" : "fade-in"}`}>{slide.tagline}</div>
              <div className="dots">
                {SLIDES.map((_, i) => (
                  <div
                    key={i}
                    className={`dot ${i === current ? "active" : ""}`}
                    onClick={() => {
                      setPrev(current); setTransitioning(true);
                      setTimeout(() => { setCurrent(i); setTransitioning(false); setPrev(null); }, 900);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}