import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import API from "../../../services/api";
import PasswordInput from "../components/PasswordInput";
import { Loader2, Mail, ArrowRight, Smartphone, ShieldCheck } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import OTPVerification from "../components/OTPVerification";
import toast from "react-hot-toast";

const SLIDES = [
  {
    city: "Goa",
    image: "https://plus.unsplash.com/premium_photo-1664304458186-9a67c1330d02?q=80&w=3090&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    tagline: "Sun, Sand & Stories",
    accent: "#f97316",
  },
  {
    city: "Manali",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1600&q=90",
    tagline: "Where Mountains Meet Magic",
    accent: "#38bdf8",
  },
  {
    city: "Jaipur",
    image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    tagline: "The Pink City Awaits",
    accent: "#fb923c",
  },
  {
    city: "Kerala",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&q=90",
    tagline: "God's Own Country",
    accent: "#4ade80",
  },
  {
    city: "Rishikesh",
    image: "https://images.unsplash.com/photo-1607406374368-809f8ec7f118?q=80&w=2946&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    tagline: "Find Your Inner Peace",
    accent: "#a78bfa",
  },
  {
    city: "Coorg",
    image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1600&q=90",
    tagline: "Scotland of India",
    accent: "#34d399",
  },
];

function validate(email, password) {
  const errs = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address";
  if (password.length < 8) errs.password = "Password must be at least 8 characters";
  return errs;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const regMessage = location.state?.message;
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [loginMode, setLoginMode] = useState("email"); // "email" | "phone" | "otp"
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [initialOtp, setInitialOtp] = useState(null);
  const [normalizedIdentifier, setNormalizedIdentifier] = useState("");

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
  const prevSlide = prev !== null ? SLIDES[prev] : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form.email, form.password);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError("");
    try {
      const res = await API.post("/auth/login", { email: form.email, password: form.password });
      const token = res.data.access_token;
      const decoded = jwtDecode(token);
      const userId = decoded.user_id || decoded.sub || decoded.id;
      const opts = rememberMe ? { expires: 30 } : {};
      Cookies.set("token", token, opts);
      Cookies.set("userId", userId, opts);
      if (rememberMe) localStorage.setItem("token", token);
      navigate(location.state?.redirect || "/");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setErrors({ phone: "Enter a valid phone number" });
      return;
    }
    setLoading(true);
    try {
      // Normalize phone: remove non-digits
      let cleanPhone = phone.replace(/\D/g, "");
      
      // If user typed the country code again (e.g. 91xxxxxxxxxx when +91 is selected)
      const codeWithoutPlus = countryCode.replace("+", "");
      if (cleanPhone.startsWith(codeWithoutPlus) && cleanPhone.length > 10) {
        cleanPhone = cleanPhone.slice(codeWithoutPlus.length);
      }
      
      const fullPhone = `${countryCode}${cleanPhone}`;
      const res = await API.post("/otp/login-otp", { identifier: fullPhone });
      setNormalizedIdentifier(fullPhone);
      setInitialOtp(res.data.otp || null);
      setLoginMode("otp");
      if (res.data.otp) {
        toast.success("Login OTP sent (Dev Mode)!");
      } else {
        toast.success("Login OTP sent! Please check your phone.");
      }
    } catch (err) {
      setApiError(err.response?.data?.detail || "No account found with this phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = (data) => {
    const token = data.access_token;
    const decoded = jwtDecode(token);
    const userId = decoded.user_id || decoded.sub || decoded.id;
    const opts = rememberMe ? { expires: 30 } : {};
    
    Cookies.set("token", token, opts);
    Cookies.set("userId", userId, opts);
    
    toast.success("Welcome back!");
    navigate(location.state?.redirect || "/");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          font-family: 'DM Sans', sans-serif;
          background: #fff;
        }
        @media (max-width: 1024px) {
          .login-root { grid-template-columns: 1fr; }
          .visual-panel { display: none !important; }
        }

        /* ── Visual Panel ── */
        .visual-panel {
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
        .city-name.fade-in { opacity: 1; transform: translateY(0); }

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

        /* ── Form Panel Refactor ── */
        .form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fdfdfd;
          padding: 3rem;
          position: relative;
        }

        .login-card {
          width: 100%;
          max-width: 448px; /* max-w-md */
          background: #ffffff;
          padding: 2.5rem; /* p-10 */
          border-radius: 1.5rem; /* rounded-2xl approx */
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); /* shadow-xl */
          border: 1px solid #e5e7eb; /* border-gray-200 */
          animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .form-header { text-align: center; margin-bottom: 2rem; }
        .form-title {
          font-size: 1.875rem; /* text-3xl */
          font-weight: 700; /* font-bold */
          color: #111827;
          margin-bottom: 0.5rem;
          letter-spacing: -0.025em;
        }
        .form-sub { font-size: 0.875rem; /* text-sm */ color: #6b7280; font-weight: 400; }
        .brand-span { color: #f97316; font-weight: 600; }

        /* Google Button Polish */
        .google-btn-wrap {
          margin-bottom: 1.5rem;
          border: 1px solid #e5e7eb; /* border-gray-300 */
          border-radius: 9999px; /* shape-pill in GoogleLogin already, but for container */
          overflow: hidden;
          transition: all 0.2s;
        }
        .google-btn-wrap:hover { background: #f9fafb; border-color: #d1d5db; }

        .divider {
          display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0;
        }
        .divider-line { flex: 1; height: 1px; background: #e5e7eb; }
        .divider-text { font-size: 0.75rem; color: #4b5563; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

        .field-group { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 1.5rem; }
        
        .label-text {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .field-wrap { position: relative; }
        .input-icon {
          position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
          color: #6b7280; transition: color 0.2s; z-index: 10;
        }
        .input-field {
          width: 100%; height: 3rem; background: #ffffff;
          border: 1px solid #d1d5db; border-radius: 0.75rem;
          padding: 0 1rem 0 2.75rem; font-size: 0.95rem; color: #111827;
          transition: all 0.2s; outline: none;
        }
        .input-field:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(249,115,22,0.2);
        }
        .field-wrap:focus-within .input-icon { color: #f97316; }

        .remember-row { 
          display: flex; justify-content: space-between; align-items: center; 
          margin-bottom: 1.5rem; font-size: 0.875rem; 
        }
        .checkbox-label { display: flex; align-items: center; gap: 0.5rem; color: #4b5563; cursor: pointer; }
        .checkbox-label input { accent-color: #f97316; width: 16px; height: 16px; margin: 0; }
        .forgot-pass { color: #f97316; font-weight: 600; text-decoration: none; transition: color 0.2s; }
        .forgot-pass:hover { color: #ea580c; text-decoration: underline; }

        .btn-login {
          width: 100%; height: 3rem;
          background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
          color: #fff; border: none; border-radius: 0.75rem;
          font-weight: 700; font-size: 0.95rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(249,115,22,0.2);
        }
        .btn-login:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 10px 15px -3px rgba(249,115,22,0.3); 
          filter: brightness(1.05);
        }
        .btn-login:active { transform: scale(0.98); }
        .btn-login:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .btn-otp {
          width: 100%; height: 3rem; background: #fff;
          border: 1px solid #d1d5db; color: #4b5563;
          border-radius: 0.75rem; margin-top: 1rem;
          font-weight: 600; font-size: 0.9rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: all 0.2s;
        }
        .btn-otp:hover { background: #f9fafb; border-color: #f97316; color: #f97316; }

        .signup-text { text-align: center; margin-top: 2rem; font-size: 0.95rem; color: #6b7280; }
        .signup-link { color: #f97316; font-weight: 700; text-decoration: none; margin-left: 4px; }
        .signup-link:hover { text-decoration: underline; }

        /* Country Code Selector */
        .phone-group { display: flex; gap: 0.5rem; }
        .country-select {
          width: 100px; height: 3rem; background: #fff;
          border: 1px solid #d1d5db; border-radius: 0.75rem;
          padding: 0 0.5rem; font-size: 0.95rem; color: #111827;
          outline: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .country-select:focus { border-color: #f97316; box-shadow: 0 0 0 4px rgba(249,115,22,0.1); }

        .api-error {
          background: #fff1f2; border: 1px solid #fecaca; color: #b91c1c;
          padding: 0.75rem; border-radius: 0.75rem; font-size: 0.8125rem;
          margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;
        }

        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .form-panel { padding: 1.5rem; }
          .login-card { padding: 2rem 1.5rem; border-radius: 1.5rem; border: none; box-shadow: none; }
        }
      `}</style>

      <div className="login-root">
        {/* ── Visual Panel ── */}
        <div className="visual-panel">
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
              <span className="city-label">Explore your next stay</span>
              <div className={`city-name ${transitioning ? "fade-out" : "fade-in"}`}>
                {slide.city}
              </div>
              <div className={`city-tagline ${transitioning ? "fade-out" : "fade-in"}`}>
                {slide.tagline}
              </div>
              <div className="dots">
                {SLIDES.map((_, i) => (
                  <div
                    key={i}
                    className={`dot ${i === current ? "active" : ""}`}
                    onClick={() => { setPrev(current); setTransitioning(true); setTimeout(() => { setCurrent(i); setTransitioning(false); setPrev(null); }, 900); }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Form Panel Refactor ── */}
        <div className="form-panel">
          <div className="login-card">
            <div className="form-header">
              <Link to="/" style={{ textDecoration: 'none' }}>
                <div className="brand-top" style={{ color: '#f97316', marginBottom: '1.5rem', textAlign: 'center' }}>TravelBNB</div>
              </Link>
              <h1 className="form-title">Welcome back!</h1>
              <p className="form-sub">Please sign in to your <span className="brand-span">TravelBNB</span> account</p>
            </div>

            {regMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
                ✅ {regMessage}
              </div>
            )}

            {/* Google Button */}
            <div className="google-btn-wrap">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    setLoading(true);
                    const res = await API.post("/auth/google-login", { token: credentialResponse.credential });
                    if (res.data.needs_phone) {
                      navigate("/complete-google-signup", { state: { token: credentialResponse.credential } });
                      return;
                    }
                    const token = res.data.access_token;
                    const decoded = jwtDecode(token);
                    const userId = decoded.user_id || decoded.sub || decoded.id;
                    Cookies.set("token", token);
                    Cookies.set("userId", userId);
                    navigate(location.state?.redirect || "/");
                  } catch {
                    setApiError("Google login failed. Please try again.");
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => setApiError("Google login failed.")}
                useOneTap
                theme="outline"
                size="large"
                shape="pill"
                width="100%"
              />
            </div>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or with email</span>
              <div className="divider-line" />
            </div>

            {loginMode === "email" && (
              <form onSubmit={handleSubmit} noValidate>
                <div className="field-group">
                  <div>
                    <label className="label-text">Email Address</label>
                    <div className="field-wrap">
                      <Mail className="input-icon" size={18} />
                      <input
                        name="email"
                        type="email"
                        placeholder="e.g. name@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label-text">Password</label>
                    <div className="field-wrap">
                      <PasswordInput
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>
                </div>

                <div className="remember-row">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                    Keep me signed in
                  </label>
                  <Link to="/forgot-password" className="forgot-pass">Forgot password?</Link>
                </div>

                {apiError && (
                  <div className="api-error">
                    <ShieldCheck size={16} /> {apiError}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-login">
                  {loading ? <Loader2 size={18} className="spin" /> : <>Sign In <ArrowRight size={18} /></>}
                </button>

                <button 
                  type="button" 
                  onClick={() => setLoginMode("phone")}
                  className="btn-otp"
                >
                  <Smartphone size={16} /> Login with Phone OTP
                </button>
              </form>
            )}

            {loginMode === "phone" && (
              <form onSubmit={handlePhoneSubmit} noValidate>
                <div className="field-group">
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
                        type="tel"
                        placeholder="10-digit number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: '1rem' }}
                      />
                    </div>
                  </div>
                </div>

                {apiError && (
                  <div className="api-error">
                    <ShieldCheck size={16} /> {apiError}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-login">
                  {loading ? <Loader2 size={18} className="spin" /> : <>Send Login Code <ArrowRight size={18} /></>}
                </button>

                <button 
                  type="button" 
                  onClick={() => setLoginMode("email")}
                  className="btn-otp"
                >
                  <Mail size={16} /> Back to Email Login
                </button>
              </form>
            )}

            {loginMode === "otp" && (
              <div style={{ marginTop: '1.5rem' }}>
                <OTPVerification 
                  identifier={normalizedIdentifier} 
                  initialOtp={initialOtp}
                  onVerify={handleOTPVerified} 
                  onBack={() => setLoginMode("phone")} 
                  type="login"
                />
              </div>
            )}

            <p className="signup-text">
              Don't have an account?
              <Link to="/signup" className="signup-link">Create Account</Link>
            </p>

            <div className="trust-row">
              <span className="trust-item">🔒 Secure login</span>
              <span className="trust-item">⭐ Premium stays</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}