import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { 
  X, Star, Shield, User, Phone, Mail, 
  Calendar, MapPin, AlertTriangle, CheckCircle,
  ThumbsUp, ThumbsDown, Clock, Award
} from 'lucide-react';
import API from '../../../services/api';

function GuestProfileModal({ userId, onClose }) {
  const [guest, setGuest] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    document.body.style.overflow = 'hidden';
    fetchGuestProfile();
    return () => { document.body.style.overflow = ''; };
  }, [userId]);

  const fetchGuestProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, reviewsRes] = await Promise.all([
        API.get(`/auth/user/${userId}`),
        API.get(`/users/${userId}/host-reviews`),
      ]);
      setGuest(profileRes.data);
      setReviews(reviewsRes.data?.reviews || []);
    } catch (err) {
      console.error('Failed to fetch guest profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 99999,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white', borderRadius: '24px',
          width: '100%', maxWidth: '520px',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center',
            color: '#9CA3AF' }}>
            <div className="animate-spin inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-4"></div>
            <p>Loading guest profile...</p>
          </div>
        ) : (
          <>
            {/* HEADER - gradient bg */}
            <div style={{
              background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
              padding: '28px 24px 40px',
              borderRadius: '24px 24px 0 0',
              position: 'relative',
            }}>
              {/* Close button */}
              <button onClick={onClose} style={{
                position: 'absolute', top: '16px', right: '16px',
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: 'none', color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
              }}>
                <X size={16} />
              </button>

              {/* Avatar */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                {guest?.avatar || guest?.profile_image ? (
                  <img
                    src={guest.avatar || guest.profile_image}
                    style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      objectFit: 'cover', border: '3px solid white',
                      margin: '0 auto', display: 'block',
                    }}
                    onError={e => e.target.style.display = 'none'}
                  />
                ) : (
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #EA580C, #F97316)',
                    color: 'white', fontWeight: '800', fontSize: '32px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto',
                    border: '3px solid rgba(255,255,255,0.3)',
                  }}>
                    {guest?.name?.[0]?.toUpperCase() || 'G'}
                  </div>
                )}
                <h2 style={{ color: 'white', fontWeight: '800',
                  fontSize: '20px', margin: '12px 0 4px' }}>
                  {guest?.name || 'Guest'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)',
                  fontSize: '13px', margin: 0 }}>
                  Member since {guest?.created_at 
                    ? new Date(guest.created_at).getFullYear() 
                    : '2024'}
                </p>
              </div>

              {/* Global Member Badge */}
              <div className="flex-1 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                  <Globe size={24} className="text-blue-500 mb-2" />
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Status</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">Verified Member</p>
              </div>
            </div>

            {/* BODY */}
            <div style={{ padding: '24px' }}>

              {/* Basic Info */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '800',
                  color: '#9CA3AF', textTransform: 'uppercase',
                  letterSpacing: '0.08em', margin: '0 0 12px' }}>
                  Basic Information
                </h3>
                <div style={{ display: 'flex',
                  flexDirection: 'column', gap: '10px' }}>
                  {[
                    { icon: Mail, label: 'Email', value: guest?.email },
                    { icon: Phone, label: 'Phone',
                      value: guest?.phone || 'Not provided' },
                    { icon: CheckCircle, label: 'Verified',
                      value: guest?.is_verified ? 'Verified' : 'Not verified',
                      color: guest?.is_verified ? '#16A34A' : '#DC2626' },
                    { icon: Calendar, label: 'Member Since',
                      value: guest?.created_at 
                        ? new Date(guest.created_at)
                            .toLocaleDateString('en-IN', 
                              { year: 'numeric', month: 'long' })
                        : 'Unknown' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 14px', backgroundColor: '#F9FAFB',
                      borderRadius: '10px', border: '1px solid #F3F4F6',
                    }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        backgroundColor: '#FFF7ED',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Icon size={15} color="#EA580C" />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: '11px', color: '#9CA3AF',
                          fontWeight: '600', margin: '0 0 1px',
                          textTransform: 'uppercase' }}>
                          {label}
                        </p>
                        <p style={{ fontSize: '13px', fontWeight: '600',
                          color: color || '#374151', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {value || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Host Reviews */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '800',
                    color: '#9CA3AF', textTransform: 'uppercase',
                    letterSpacing: '0.08em', margin: 0 }}>
                    Reviews from Past Hosts
                  </h3>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>
                    {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {reviews.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '24px',
                    backgroundColor: '#F9FAFB', borderRadius: '14px',
                    border: '1px solid #F3F4F6',
                  }}>
                    <Clock size={28} color="#D1D5DB"
                      style={{ marginBottom: '8px' }} />
                    <p style={{ fontWeight: '600', color: '#9CA3AF',
                      fontSize: '14px', margin: '0 0 4px' }}>
                      No reviews yet
                    </p>
                    <p style={{ fontSize: '12px', color: '#D1D5DB',
                      margin: 0 }}>
                      This guest hasn't stayed with other hosts
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex',
                    flexDirection: 'column', gap: '12px' }}>
                    {reviews.map((review, i) => (
                      <div key={i} style={{
                        backgroundColor: '#F9FAFB', borderRadius: '14px',
                        padding: '14px', border: '1px solid #F3F4F6',
                      }}>
                        <div style={{ display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <p style={{ fontWeight: '700', fontSize: '13px',
                              color: '#111827', margin: '0 0 2px' }}>
                              {review.host_name || 'Host'}
                            </p>
                            <p style={{ fontSize: '11px', color: '#9CA3AF',
                              margin: 0 }}>
                              {review.property_name || 'Property'}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center',
                            gap: '4px', flexShrink: 0 }}>
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={12}
                                fill={s <= review.rating ? '#F59E0B' : '#E5E7EB'}
                                color={s <= review.rating ? '#F59E0B' : '#E5E7EB'}
                              />
                            ))}
                          </div>
                        </div>
                        <p style={{ fontSize: '13px', color: '#6B7280',
                          margin: '0 0 8px', lineHeight: '1.5' }}>
                          {review.comment || review.text}
                        </p>
                        {/* Tags */}
                        <div style={{ display: 'flex', gap: '6px',
                          flexWrap: 'wrap' }}>
                          {review.rating >= 4 && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center',
                              gap: '4px', padding: '3px 8px',
                              backgroundColor: '#F0FDF4', color: '#16A34A',
                              borderRadius: '999px', fontSize: '11px',
                              fontWeight: '600', border: '1px solid #BBF7D0',
                            }}>
                              <ThumbsUp size={10} /> Recommended
                            </span>
                          )}
                          {review.rating < 3 && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center',
                              gap: '4px', padding: '3px 8px',
                              backgroundColor: '#FEF2F2', color: '#DC2626',
                              borderRadius: '999px', fontSize: '11px',
                              fontWeight: '600', border: '1px solid #FEE2E2',
                            }}>
                              <ThumbsDown size={10} /> Concerns
                            </span>
                          )}
                          <span style={{
                            padding: '3px 8px',
                            backgroundColor: '#F3F4F6', color: '#6B7280',
                            borderRadius: '999px', fontSize: '11px',
                            fontWeight: '500',
                          }}>
                            {review.created_at 
                              ? new Date(review.created_at)
                                  .toLocaleDateString('en-IN', 
                                    { month: 'short', year: 'numeric' })
                              : 'Recent'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export default GuestProfileModal;
