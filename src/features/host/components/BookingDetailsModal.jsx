import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import {
  X, User, Mail, Phone, Calendar, MapPin,
  Clock, CheckCircle, XCircle,
  AlertCircle, Shield, MessageCircle,
  CreditCard, FileText, Loader2,
  Users, Check
} from 'lucide-react';
import API from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const configs = {
    pending: { bg: '#FEF9C3', text: '#854D0E', icon: Clock, label: 'Pending' },
    approved: { bg: '#DBEAFE', text: '#1D4ED8', icon: CheckCircle, label: 'Approved' },
    confirmed: { bg: '#DCFCE7', text: '#15803D', icon: CheckCircle, label: 'Confirmed' },
    rejected: { bg: '#FEE2E2', text: '#DC2626', icon: XCircle, label: 'Declined' },
    declined: { bg: '#FEE2E2', text: '#DC2626', icon: XCircle, label: 'Declined' },
    cancelled: { bg: '#F3F4F6', text: '#6B7280', icon: XCircle, label: 'Cancelled' },
  };
  const c = configs[status] || configs.pending;
  const Icon = c.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '5px 12px', borderRadius: '999px',
      backgroundColor: c.bg, color: c.text,
      fontSize: '12px', fontWeight: '800',
    }}>
      <Icon size={13} /> {c.label}
    </span>
  );
};

const BookingDetailsModal = ({ bookingId, onClose, onApprove, onDecline }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!bookingId) return;
    fetchBookingDetails();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/host/bookings/${bookingId}`);
      setBooking(res.data);
      console.log('Booking details:', res.data);
    } catch (err) {
      console.error('Booking fetch error:', err);
      toast.error('Failed to load booking details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await API.patch(`/host/bookings/${bookingId}/approve`);
      setBooking(prev => ({ ...prev, status: 'confirmed' }));
      toast.success('Booking confirmed! Guest notified.');
      onApprove && onApprove(bookingId);
    } catch (err) {
      toast.error('Failed to approve booking');
    }
  };

  const handleDecline = async () => {
    if (!window.confirm('Decline this booking request?')) return;
    try {
      await API.patch(`/host/bookings/${bookingId}/decline`);
      setBooking(prev => ({ ...prev, status: 'rejected' }));
      toast.success('Booking declined.');
      onDecline && onDecline(bookingId);
    } catch (err) {
      toast.error('Failed to decline booking');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    } catch(e) { return dateStr; }
  };

  const formatMonthYear = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            month: 'long', year: 'numeric'
        });
    } catch(e) { return dateStr; }
  };

  if (!bookingId) return null;

  const content = (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(10px)',
      zIndex: 99999,
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '20px',
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '32px',
        width: '100%', maxWidth: '700px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#EA580C' }}>
            <Loader2 size={48} className="animate-spin mx-auto mb-4" />
            <p style={{ fontWeight: '700' }}>Fetching booking details...</p>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #F3F4F6',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', position: 'sticky',
              top: 0, backgroundColor: 'white', zIndex: 10,
              borderRadius: '32px 32px 0 0',
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800',
                  margin: '0 0 2px', color: '#111827' }}>
                  Booking Details
                </h2>
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0, fontWeight: '600' }}>
                  #{booking?.id?.slice(-8).toUpperCase()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <StatusBadge status={booking?.status} />
                <button onClick={onClose} style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                   onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Property Strip */}
            <div style={{
              margin: '0',
              height: '160px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <img
                src={booking?.property?.images?.[0] || 
                  `https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&h=160&q=80`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => e.target.src = 
                  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&h=160&q=80'}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, rgba(0,0,0,0.7), transparent)',
              }} />
              <div style={{
                position: 'absolute', bottom: '20px', left: '24px',
              }}>
                <p style={{ color: 'white', fontWeight: '800', fontSize: '20px',
                  margin: '0 0 4px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                  {booking?.property?.title}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px',
                  color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '600' }}>
                  <MapPin size={14} />
                  {booking?.property?.city}, {booking?.property?.state}
                </div>
              </div>
            </div>

            {/* Summary Cards Grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1px', backgroundColor: '#F3F4F6',
              borderBottom: '1px solid #F3F4F6'
            }}>
              {[
                { icon: Calendar, label: 'Check-in',
                  value: formatDate(booking?.check_in) },
                { icon: Calendar, label: 'Check-out',
                  value: formatDate(booking?.check_out) },
                { icon: Clock, label: 'Duration',
                  value: `${booking?.nights || 1} night${booking?.nights !== 1 ? 's' : ''}` },
                { icon: Users, label: 'Guests',
                  value: `${booking?.guests || 1} guest${booking?.guests !== 1 ? 's' : ''}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{
                  backgroundColor: 'white', padding: '20px 16px',
                  textAlign: 'center',
                }}>
                  <Icon size={20} color="#EA580C" style={{ marginBottom: '8px', marginInline: 'auto' }} />
                  <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    margin: '0 0 6px' }}>
                    {label}
                  </p>
                  <p style={{ fontWeight: '800', fontSize: '14px',
                    color: '#111827', margin: 0 }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Content Body */}
            <div style={{ padding: '32px' }}>
              
              {/* Guest Profile Section */}
              <div style={{
                backgroundColor: '#F9FAFB', borderRadius: '24px',
                padding: '24px', marginBottom: '24px',
                border: '1px solid #F3F4F6'
              }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800',
                  color: '#374151', margin: '0 0 20px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <User size={16} color="#EA580C" /> Guest Profile
                </h3>
                
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #EA580C, #F97316)',
                    color: 'white', fontWeight: '800', fontSize: '32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(234,88,12,0.2)',
                    border: '4px solid white'
                  }}>
                    {booking?.guest?.profile_image ? (
                      <img src={booking.guest.profile_image}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => e.target.style.display = 'none'}
                      />
                    ) : booking?.guest?.name?.[0]?.toUpperCase()}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center',
                      gap: '10px', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '20px', fontWeight: '800',
                        color: '#111827', margin: 0 }}>
                        {booking?.guest?.name}
                      </h4>
                      {booking?.guest?.is_verified && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          backgroundColor: '#DCFCE7', color: '#16A34A',
                          padding: '3px 10px', borderRadius: '999px',
                          fontSize: '11px', fontWeight: '800',
                        }}>
                          <Shield size={12} /> Verified
                        </span>
                      )}
                    </div>
                    
                    <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 16px', fontWeight: '600' }}>
                      Member since {formatMonthYear(booking?.guest?.member_since)}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '32px' }}>
                      {[
                        { value: booking?.guest?.total_trips || 0, label: 'Trips' },
                        { value: booking?.guest?.total_reviews || 0, label: 'Reviews' },
                        { value: booking?.guest?.trust_score || 0, label: 'Trust' },
                      ].map(({ value, label }) => (
                        <div key={label}>
                          <p style={{ fontWeight: '800', fontSize: '22px',
                            color: '#EA580C', margin: '0 0 2px', lineHeight: 1 }}>
                            {value}
                          </p>
                          <p style={{ fontSize: '11px', color: '#9CA3AF',
                            margin: 0, fontWeight: '700', textTransform: 'uppercase' }}>
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                <div style={{
                  marginTop: '24px', paddingTop: '24px',
                  borderTop: '1px solid #E5E7EB',
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
                }}>
                  {[
                    { icon: Mail, label: 'Email Address', value: booking?.guest?.email },
                    { icon: Phone, label: 'Phone Number', value: booking?.guest?.phone },
                    { icon: MapPin, label: 'Billing Address', value: booking?.guest?.address, full: true },
                  ].filter(item => item.value).map(({ icon: Icon, label, value, full }) => (
                    <div key={label} style={{ 
                      display: 'flex', gap: '12px', alignItems: 'center',
                      gridColumn: full ? 'span 2' : 'auto'
                    }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        backgroundColor: 'white', border: '1px solid #E5E7EB',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={16} color="#EA580C" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '11px', color: '#9CA3AF',
                          fontWeight: '700', margin: '0 0 1px',
                          textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {label}
                        </p>
                        <p style={{ fontSize: '14px', color: '#111827',
                          fontWeight: '700', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Section */}
              <div style={{
                backgroundColor: '#F9FAFB', borderRadius: '24px',
                padding: '24px', border: '1px solid #F3F4F6'
              }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800',
                  color: '#374151', margin: '0 0 20px',
                  display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CreditCard size={16} color="#EA580C" /> Payment Breakdown
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: `₹${booking?.property?.price_per_night?.toLocaleString()} × ${booking?.nights} nights`,
                      value: `₹${(booking?.property?.price_per_night * booking?.nights)?.toLocaleString()}` },
                    { label: 'Platform fee (10%)',
                      value: `-₹${Math.round(booking?.total_price * 0.1)?.toLocaleString()}`,
                      color: '#DC2626' },
                    { label: 'GST (12%)',
                      value: `₹${Math.round(booking?.total_price * 0.12)?.toLocaleString()}` },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>{label}</span>
                      <span style={{ fontSize: '14px', fontWeight: '700',
                        color: color || '#111827' }}>{value}</span>
                    </div>
                  ))}
                  
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '16px 0 0', marginTop: '8px',
                    borderTop: '2px dashed #E5E7EB'
                  }}>
                    <span style={{ fontWeight: '800', fontSize: '16px',
                      color: '#111827' }}>Total Expected Earnings</span>
                    <span style={{ fontWeight: '900', fontSize: '22px',
                      color: '#EA580C' }}>
                      ₹{booking?.total_price?.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Payment status toast-like badge */}
                <div style={{
                  marginTop: '16px', padding: '12px 16px',
                  borderRadius: '16px',
                  backgroundColor: booking?.payment_status === 'paid' 
                    ? '#F0FDF4' : '#FFFBEB',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  border: `1px solid ${booking?.payment_status === 'paid' ? '#BBF7D0' : '#FEF3C7'}`
                }}>
                  {booking?.payment_status === 'paid'
                    ? <CheckCircle size={18} color="#16A34A" />
                    : <Clock size={18} color="#D97706" />
                  }
                  <span style={{
                    fontSize: '14px', fontWeight: '800',
                    color: booking?.payment_status === 'paid' ? '#16A34A' : '#D97706',
                  }}>
                    {booking?.payment_status === 'paid' 
                      ? 'Payment has been processed and confirmed' : 'Payment is still being processed'}
                  </span>
                </div>
              </div>

              {/* Special Requests */}
              {booking?.special_requests && (
                <div style={{
                  marginTop: '24px',
                  backgroundColor: '#FFFBEB', borderRadius: '24px',
                  padding: '20px', 
                  border: '1px solid #FDE68A',
                }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800',
                    color: '#92400E', margin: '0 0 10px',
                    display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={15} /> Note from Guest
                  </h3>
                  <p style={{ fontSize: '14px', color: '#92400E', margin: 0,
                    lineHeight: '1.6', fontWeight: '600' }}>
                    "{booking.special_requests}"
                  </p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div style={{
              padding: '24px 32px',
              borderTop: '1px solid #F3F4F6',
              display: 'flex', gap: '12px',
              position: 'sticky', bottom: 0,
              backgroundColor: 'white',
              borderRadius: '0 0 32px 32px',
            }}>
              <button
                onClick={() => {
                  navigate(`/messages?host=${booking?.guest?.id}`);
                  onClose();
                }}
                style={{
                  flex: 1, padding: '14px', borderRadius: '16px',
                  border: '2px solid #E5E7EB', backgroundColor: 'white',
                  color: '#374151', fontWeight: '800', fontSize: '14px',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: 'all 0.2s',
                }} onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#EA580C';
                  e.currentTarget.style.color = '#EA580C';
                }} onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.color = '#374151';
                }}>
                <MessageCircle size={18} /> Message Guest
              </button>
              
              {booking?.status === 'pending' && (
                <>
                  <button onClick={handleApprove}
                    style={{
                      flex: 1.2, padding: '14px', borderRadius: '16px',
                      border: 'none', backgroundColor: '#22C55E',
                      color: 'white', fontWeight: '800', fontSize: '14px',
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: '10px',
                      boxShadow: '0 8px 16px rgba(34,197,94,0.25)',
                      transition: 'all 0.2s',
                    }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                       onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    <Check size={18} /> Approve Booking
                  </button>
                  <button onClick={handleDecline}
                    style={{
                      flex: 1, padding: '14px', borderRadius: '16px',
                      border: 'none', backgroundColor: '#FEF2F2',
                      color: '#DC2626', fontWeight: '800', fontSize: '14px',
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: '10px',
                      transition: 'all 0.2s',
                    }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                       onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FEF2F2'}>
                    <XCircle size={18} /> Decline
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default BookingDetailsModal;
