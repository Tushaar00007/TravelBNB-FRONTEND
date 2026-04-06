import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CreditCard, Landmark, ArrowRight, ShieldCheck, CheckCircle2, Lock, Tag, Clock, Calendar, Users, MapPin, ChevronRight } from 'lucide-react';
import API from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';

const PaymentPage = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const passedState = location.state || {};
    
    const bookingRequestId = searchParams.get('request') || passedState.bookingRequestId;
    const hostId = searchParams.get('host');
    const propertyId = searchParams.get('property');

    const [isPaying, setIsPaying] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [payProgress, setPayProgress] = useState(0);

    // Form states
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        cardName: '',
        upiId: '',
        selectedBank: ''
    });

    const [property, setProperty] = useState(null);
    const [host, setHost] = useState(null);
    const [booking, setBooking] = useState(null);

    // Coupon states
    const [couponCode, setCouponCode] = useState('');
    const [isCouponApplied, setIsCouponApplied] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);

    // Format date for display
    const formatDate = (dateStr) => {
        // Handle null/undefined/empty
        if (!dateStr || dateStr === 'undefined' || dateStr === 'null' || dateStr === '') {
            return 'Not specified';
        }
        
        // If it's already like "Apr 9", add the year
        if (typeof dateStr === 'string' && dateStr.match(/^[A-Za-z]{3,9}\s+\d{1,2}$/)) {
            return `${dateStr}, ${new Date().getFullYear()}`;
        }
        
        // If it already has a year like "Apr 9, 2025"
        if (typeof dateStr === 'string' && dateStr.match(/^[A-Za-z]{3,9}\s+\d{1,2},?\s*\d{4}$/)) {
            return dateStr;
        }
        
        // Try to parse as a date
        try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                });
            }
        } catch (e) {
            // ignore
        }
        
        return String(dateStr);
    };

    useEffect(() => {
        // If we have state passed from navigation, we can use it immediately or skip some fetches
        if (passedState.bookingRequestId && !propertyId) {
            // If propertyId/hostId are missing in URL but in state, we use state
            setBooking({
                _id: passedState.bookingRequestId,
                totalPrice: passedState.amount,
                checkIn: passedState.checkIn,
                checkOut: passedState.checkOut,
                guests: passedState.guests
            });
            setProperty({ 
                title: passedState.propertyName,
                images: [passedState.propertyImage]
            });
            setHost({ name: passedState.hostName });
            
            console.log('PaymentPage received data (state):', passedState);
            console.log('CheckIn received:', passedState.checkIn);
            console.log('CheckOut received:', passedState.checkOut);
            console.log('Guests received:', passedState.guests);
            return;
        }

        const fetchData = async () => {
            if (!bookingRequestId) return;
            try {
                const [propRes, bookRes] = await Promise.all([
                    propertyId ? API.get(`/homes/${propertyId}`) : Promise.resolve({ data: null }),
                    API.get(`/bookings/user/`)
                ]);
                
                if (propRes.data) setProperty(propRes.data);
                
                const currentBooking = bookRes.data.find(b => b._id === bookingRequestId);
                if (currentBooking) {
                    setBooking(currentBooking);
                    // Fetch host info if we didn't have it
                    if (!hostId && currentBooking.hostId) {
                        const hRes = await API.get(`/auth/user/${currentBooking.hostId}`);
                        setHost(hRes.data);
                    } else if (hostId) {
                        const hRes = await API.get(`/auth/user/${hostId}`);
                        setHost(hRes.data);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch checkout data", err);
            }
        };
        fetchData();
    }, [bookingRequestId, hostId, propertyId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'cardNumber') {
            const formatted = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
            setFormData(prev => ({ ...prev, [name]: formatted }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const applyCoupon = () => {
        if (couponCode.toUpperCase() === 'TRAVEL10') {
            const discount = (booking?.totalPrice || 0) * 0.1;
            setDiscountAmount(discount);
            setIsCouponApplied(true);
            toast.success("Coupon TRAVEL10 applied!");
        } else {
            toast.error("Invalid coupon code");
        }
    };

    const handlePayment = async () => {
        console.log('=== PAYMENT STARTED ===');
        console.log('bookingRequestId:', bookingRequestId);
        console.log('selectedMethod:', selectedMethod);
        console.log('finalAmount:', finalAmount);
        console.log('booking:', booking);
        console.log('hostId:', hostId || booking?.hostId);
        console.log('propertyId:', propertyId || property?._id);
        
        setIsPaying(true);
        setPayProgress(0);
        
        const interval = setInterval(() => {
            setPayProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 5;
            });
        }, 100);

        const txnId = `TXN${Date.now()}`;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Sending payment request...');
            
            const paymentResponse = await API.post(`/bookings/confirm-payment`, {
                booking_request_id: bookingRequestId,
                payment_method: selectedMethod,
                amount: finalAmount,
                transaction_id: txnId
            });
            
            console.log('Payment response:', paymentResponse.data);

            // Get correct IDs for sending message
            const recipientId = hostId || booking?.hostId || passedState.hostId;
            const propId = propertyId || property?._id || passedState.propertyId;
            
            console.log('Sending confirmation message to host:', recipientId);

            if (recipientId) {
                await API.post('/messages/send', {
                    sender_id: Cookies.get('userId'),
                    recipient_id: recipientId,
                    property_id: propId,
                    message: `✅ Payment confirmed! Guest has paid ₹${finalAmount.toLocaleString('en-IN')}. Booking #${bookingRequestId?.slice(-8).toUpperCase()} is now confirmed.`,
                    booking_request_id: bookingRequestId,
                    booking_status: 'confirmed',
                });
            }

            setTransactionId(txnId);
            setIsPaying(false);
            setPaymentSuccess(true);
            toast.success("Payment Successful! Redirecting...");
            
            setTimeout(() => {
                navigate('/trips');
            }, 3000);
            
        } catch (err) {
            clearInterval(interval);
            setIsPaying(false);
            console.error('=== PAYMENT ERROR ===');
            console.error('Error:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            toast.error(err.response?.data?.detail || "Payment failed. Please try again.");
        }
    };

    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl p-12 max-w-2xl w-full text-center border border-gray-100"
                >
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                        className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-50"
                    >
                        <CheckCircle2 size={48} className="text-green-600" />
                    </motion.div>
                    
                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Booking Confirmed! 🎉</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-8">
                        Transaction ID: <span className="text-orange-500">{transactionId}</span>
                    </p>
                    
                    <div className="bg-gray-50 rounded-3xl p-8 mb-10 text-left border border-gray-100">
                        <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-6 border-b border-gray-200 pb-4">Trip Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold text-sm">Property</span>
                                <span className="text-gray-900 font-black text-sm">{property?.title}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold text-sm">Check-in</span>
                                <span className="text-gray-900 font-black text-sm">{booking && formatDate(booking.checkIn)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold text-sm">Check-out</span>
                                <span className="text-gray-900 font-black text-sm">{booking && formatDate(booking.checkOut)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <span className="text-gray-900 font-black">Amount Paid</span>
                                <span className="text-2xl font-black text-orange-600">₹{((booking?.totalPrice || 0) - discountAmount).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={() => navigate('/trips')}
                            className="flex-1 bg-gray-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg"
                        >
                            View My Trips
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            className="flex-1 bg-orange-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                        >
                            Back to Home
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const subtotal = booking?.totalPrice || 0;
    const finalAmount = subtotal - discountAmount;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase mb-2">Complete Your <span className="text-orange-500">Booking</span></h1>
                    <p className="text-gray-500 font-bold flex items-center gap-2 uppercase tracking-widest text-xs">
                        <Lock size={14} className="text-orange-500" /> Secure 256-bit SSL Payment · Instant confirmation
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12">
                    {/* LEFT PANEL: PAYMENT FORM */}
                    <div className="space-y-10">
                        {/* Personal Info */}
                        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-6 h-6 bg-orange-500 rounded-full text-white text-[10px] flex items-center justify-center font-black">1</span>
                                Personal Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                                    <input 
                                        type="text" 
                                        name="fullName"
                                        placeholder="John Doe"
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        placeholder="john@example.com"
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-6 h-6 bg-orange-500 rounded-full text-white text-[10px] flex items-center justify-center font-black">2</span>
                                Payment Method
                            </h3>

                            <div className="flex gap-2 mb-8 bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700">
                                {[
                                    { id: 'card', label: 'Card', icon: CreditCard },
                                    { id: 'upi', label: 'UPI', icon: CheckCircle2 },
                                    { id: 'banking', label: 'Net Banking', icon: Landmark }
                                ].map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedMethod(method.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            selectedMethod === method.id 
                                            ? 'bg-orange-500 text-white shadow-lg' 
                                            : 'text-gray-400 hover:text-orange-500'
                                        }`}
                                    >
                                        <method.icon size={16} /> {method.label}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {selectedMethod === 'card' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Card Number</label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    name="cardNumber"
                                                    placeholder="XXXX XXXX XXXX XXXX"
                                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none tabular-nums"
                                                    value={formData.cardNumber}
                                                    onChange={handleInputChange}
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    {formData.cardNumber.startsWith('4') && <span className="text-blue-600 font-black italic">VISA</span>}
                                                    {formData.cardNumber.startsWith('5') && <span className="text-red-500 font-black italic">MASTERCARD</span>}
                                                    {formData.cardNumber.startsWith('6') && <span className="text-orange-600 font-black italic">RUPAY</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expiry (MM/YY)</label>
                                                <input 
                                                    type="text" 
                                                    name="expiry"
                                                    placeholder="12/28"
                                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                                                    value={formData.expiry}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CVV</label>
                                                <input 
                                                    type="password" 
                                                    name="cvv"
                                                    placeholder="***"
                                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                                                    value={formData.cvv}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {selectedMethod === 'upi' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">UPI ID</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    name="upiId"
                                                    placeholder="username@upi"
                                                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                                                    value={formData.upiId}
                                                    onChange={handleInputChange}
                                                />
                                                <button className="px-6 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Verify</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {selectedMethod === 'banking' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Bank</label>
                                            <select 
                                                name="selectedBank"
                                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
                                                value={formData.selectedBank}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Choose your bank</option>
                                                <option value="sbi">State Bank of India</option>
                                                <option value="hdfc">HDFC Bank</option>
                                                <option value="icici">ICICI Bank</option>
                                                <option value="axis">Axis Bank</option>
                                            </select>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </section>

                        {/* Pay Now & Progress */}
                        <div className="space-y-4">
                            <button 
                                onClick={handlePayment}
                                disabled={isPaying}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-sm shadow-2xl shadow-orange-500/30 transition-all active:scale-95 disabled:grayscale flex items-center justify-center gap-3 relative overflow-hidden"
                            >
                                {isPaying ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} /> Pay ₹{finalAmount.toLocaleString()} Securely
                                    </>
                                )}
                            </button>
                            
                            {isPaying && (
                                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${payProgress}%` }}
                                        className="h-full bg-green-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: BOOKING SUMMARY */}
                    <div className="relative">
                        <div className="sticky top-8 bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-8">Booking Summary</h3>
                            
                            <div className="flex gap-4 mb-8">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-white dark:border-gray-800 shadow-md">
                                    <img src={property?.images?.[0]} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-black text-gray-900 dark:text-white text-base truncate mb-1 uppercase tracking-tight">{property?.title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-2 flex items-center gap-1 uppercase tracking-widest"><MapPin size={12} className="text-orange-500" /> {property?.city}</p>
                                    <div className="flex items-center gap-1 bg-white dark:bg-gray-800 py-1 px-2.5 rounded-full border border-gray-200 dark:border-gray-700 w-fit">
                                        <Star size={10} className="text-orange-500 fill-orange-500" />
                                        <span className="text-[10px] font-black text-gray-900 dark:text-white">SUPERHOST</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 border-y border-gray-200 dark:border-gray-800 py-8 mb-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Check-in</span>
                                        <p className="font-black text-gray-900 dark:text-white text-sm uppercase">{booking && formatDate(booking.checkIn)}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Check-out</span>
                                        <p className="font-black text-gray-900 dark:text-white text-sm uppercase">{booking && formatDate(booking.checkOut)}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-lg"><Users size={16} className="text-orange-500" /></div>
                                        <div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Guests</span>
                                            <span className="text-xs font-black text-gray-900 dark:text-white uppercase">{booking?.guests || 1} Guest{booking?.guests > 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300" />
                                </div>
                            </div>

                            {/* Coupon Code Block */}
                            <div className="mb-8">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Have a coupon?</span>
                                {isCouponApplied ? (
                                    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest">
                                            <Tag size={14} /> TRAVEL10 Applied!
                                        </div>
                                        <button onClick={() => { setIsCouponApplied(false); setDiscountAmount(0); }} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Enter Code" 
                                            className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest outline-none focus:border-orange-500 transition-colors"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                        />
                                        <button onClick={applyCoupon} className="bg-gray-900 text-white font-black px-6 rounded-xl text-[10px] uppercase tracking-widest hover:bg-black transition-all">Apply</button>
                                    </div>
                                )}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                    <span className="uppercase tracking-widest">Base Amount</span>
                                    <span className="font-black text-gray-900 dark:text-white">₹{subtotal.toLocaleString()}</span>
                                </div>
                                {isCouponApplied && (
                                    <div className="flex justify-between items-center text-xs font-bold text-green-600">
                                        <span className="uppercase tracking-widest">Discount (10%)</span>
                                        <span className="font-black">−₹{discountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                    <span className="uppercase tracking-widest">GST (Included)</span>
                                    <span className="font-black text-gray-900 dark:text-white">₹0</span>
                                </div>
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">Total</span>
                                    <span className="text-3xl font-black text-orange-600 tracking-tighter">₹{finalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Trust Badge */}
                            <div className="mt-10 flex items-center justify-center gap-6 opacity-30 invert dark:invert-0 grayscale">
                                <ShieldCheck size={24} />
                                <Lock size={20} />
                                <Landmark size={22} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Star = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const X = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export default PaymentPage;
