import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

function PlaceDetailModal({ place, onClose }) {
  console.log("PlaceDetailModal rendering, place:", place);
  const imageCandidates = useMemo(() => {
    if (!place) return [];

    const fallbackSeed = encodeURIComponent(
      [place.place_name, place.city, place.state]
        .filter(Boolean).join('-') || 'india-travel'
    );

    return [
      place.photo_url,
      place.place_image_url,
      place.google_photo_url,
      place.image_url,
      place.google_image_url,
      // Picsum with place name as seed for consistent image
      `https://picsum.photos/seed/${fallbackSeed}/1200/800`,
      // Ultimate fallback
      `https://picsum.photos/seed/india-travel/1200/800`,
    ].filter((url) => (
      typeof url === 'string' &&
      url.trim() !== '' &&
      !url.includes('tourist-attraction') &&
      url !== 'undefined' &&
      url !== 'null'
    ));
  }, [place]);

  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [place]);

  // Lock body scroll when open
  useEffect(() => {
    if (place) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [place]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!place) return null;
  const imageUrl = imageCandidates[imageIndex] || imageCandidates[0];

  const isUnavailable = (val) =>
    !val || val === 'Not Available' || val === 'NA' || val === 'N/A';

  const isNA = (val) => 
    !val || val === 'N/A' || val === 'NA' || val === 'Not Available' || (typeof val === 'string' && val.includes('N/A'));

  const noOlaUber =
    isUnavailable(place?.transport_fares?.ola_car) ||
    isUnavailable(place?.transport_fares?.uber_car);

  return createPortal(
    <AnimatePresence>
      {place && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '90vw',
              maxWidth: '1000px',
              height: '85vh',
              backgroundColor: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'row',
              zIndex: 99999,
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            }}
          >
            {/* ══════════════════════════════════════
                LEFT PANEL — Info (45%)
               ══════════════════════════════════════ */}
            <div style={{
              width: '45%',
              height: '100%',
              overflowY: 'auto',
              padding: '32px',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Place Name */}
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111', margin: 0 }}>
                  {place.place_name?.toUpperCase()}
                </h2>

                {/* Type Badge */}
                {place.type && (
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: '#EA580C',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '700',
                    width: 'fit-content',
                  }}>
                    {place.type?.toUpperCase()}
                  </span>
                )}

                {/* Info Pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {place.rating != null && <span style={pillStyle}>⭐ {place.rating}</span>}
                  {place.visit_time != null && <span style={pillStyle}>🕐 {place.visit_time} hrs</span>}
                  {place.crowd_level != null && <span style={pillStyle}>👥 Crowd: {place.crowd_level}/10</span>}
                  {place.best_visit_time && place.best_visit_time !== 'Anytime' && (
                    <span style={pillStyle}>☀️ {place.best_visit_time}</span>
                  )}
                </div>

                {/* Short Description */}
                {(place.short_description || place.place_description_ai) && (
                  <p style={{
                    margin: 0, color: '#6B7280',
                    fontSize: '14px', lineHeight: '1.6'
                  }}>
                    {place.short_description || place.place_description_ai}
                  </p>
                )}

                {/* Significance */}
                {place.significance && (
                  <div style={infoBoxStyle}>
                    ℹ️ {place.significance}
                  </div>
                )}

                {/* Travel Tip */}
                {place.travel_tip && (
                  <div style={tipBoxStyle}>
                    💡 {place.travel_tip}
                  </div>
                )}

                {/* Food Specialty */}
                {place.food_specialty &&
                  place.food_specialty !== 'Unknown' && (
                    <div>
                      <p style={labelStyle}>🍜 FOOD SPECIALTY</p>
                      <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>
                        {place.food_specialty}
                      </p>
                    </div>
                  )}

                {/* Famous Restaurants */}
                {place.famous_restaurant &&
                  place.famous_restaurant !== 'Unknown' && (
                    <div>
                      <p style={labelStyle}>🍽️ FAMOUS RESTAURANTS</p>
                      <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>
                        {place.famous_restaurant}
                      </p>
                    </div>
                  )}

                {/* ML Score breakdown */}
                {place.ml_scores && (
                  <div style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    border: '1px solid #E5E7EB'
                  }}>
                    <p style={labelStyle}>🤖 AI RECOMMENDATION SCORES</p>
                    <div style={{
                      display: 'flex', gap: '8px', flexWrap: 'wrap',
                      marginTop: '6px'
                    }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '999px',
                        fontSize: '11px', fontWeight: '700',
                        backgroundColor: '#EFF6FF', color: '#1D4ED8',
                        border: '1px solid #BFDBFE'
                      }}>
                        ⚡ Quality {(place.ml_scores.xgb * 10).toFixed(1)}/10
                      </span>
                      <span style={{
                        padding: '4px 10px', borderRadius: '999px',
                        fontSize: '11px', fontWeight: '700',
                        backgroundColor: '#F5F3FF', color: '#7C3AED',
                        border: '1px solid #DDD6FE'
                      }}>
                        🎯 Preference Match {Math.round(place.ml_scores.cosine * 100)}%
                      </span>
                      <span style={{
                        padding: '4px 10px', borderRadius: '999px',
                        fontSize: '11px', fontWeight: '700',
                        backgroundColor: '#ECFDF5', color: '#065F46',
                        border: '1px solid #A7F3D0'
                      }}>
                        ★ Final Score {(place.ml_scores.final * 10).toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                )}

                {/* Airport & Railway */}
                {(place.airport || place.railway) && (
                  <div>
                    <p style={labelStyle}>✈️ GETTING THERE</p>
                    {place.airport && place.airport !== 'Not Available' && (
                      <p style={{ margin: '0 0 4px 0', color: '#374151', fontSize: '13px' }}>
                        ✈️ {place.airport}
                      </p>
                    )}
                    {place.railway && place.railway !== 'Not Available' && (
                      <p style={{ margin: 0, color: '#374151', fontSize: '13px' }}>
                        🚂 {place.railway}
                      </p>
                    )}
                  </div>
                )}

                {/* Must Try Food */}
                {place.must_try_food && (
                  <div>
                    <p style={labelStyle}>🍽️ MUST TRY FOOD</p>
                    <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>
                      {place.must_try_food}
                    </p>
                  </div>
                )}

                {/* Packing Suggestions */}
                {place.packing_suggestions && (
                  <div>
                    <p style={labelStyle}>🎒 PACKING SUGGESTIONS</p>
                    <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>
                      {place.packing_suggestions}
                    </p>
                  </div>
                )}

                {/* Transport Fares */}
                <div>
                  <p style={labelStyle}>🚗 LOCAL TRANSPORT FARES</p>
                  {noOlaUber && (
                    <span style={amberBadgeStyle}>
                      🚕 No Ola/Uber · Use Auto or Local Taxi
                    </span>
                  )}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    marginTop: '8px',
                  }}>
                    {[
                      { label: '🛺 AUTO', value: place.transport_fares?.auto },
                      { label: '🏍️ RAPIDO', value: place.transport_fares?.rapido_bike },
                      { label: '🚗 OLA', value: place.transport_fares?.ola_car },
                      { label: '🚙 UBER', value: place.transport_fares?.uber_car },
                      { label: '🚖 CITY TAXI', value: place.transport_fares?.city_taxi },
                    ].map(({ label, value }) => (
                      <div key={label} style={fareCardStyle}>
                        <p style={{ margin: 0, fontSize: '10px', color: '#9CA3AF', fontWeight: '700' }}>
                          {label}
                        </p>
                        {label === '🏍️ RAPIDO' ? (
                          isNA(value) ? (
                            <p style={{ color: '#9CA3AF', margin: 0, fontSize: '13px' }}>N/A</p>
                          ) : (
                            <p style={{ margin: 0, fontWeight: '600', color: '#111', fontSize: '13px' }}>
                                {value}
                            </p>
                          )
                        ) : (
                          isUnavailable(value) ? (
                            <span style={notAvailableBadge}>❌ Not Available</span>
                          ) : (
                            <p style={{ margin: 0, fontWeight: '600', color: '#111', fontSize: '13px' }}>
                              {value}
                            </p>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                  {noOlaUber && (
                    <p style={{ fontSize: '11px', color: '#EA580C', fontStyle: 'italic', marginTop: '8px' }}>
                      * Ola/Uber may not operate in smaller or remote cities.
                    </p>
                  )}
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  {place.map_link && (
                    <a
                      href={place.map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={mapBtnStyle}
                    >
                      🗺️ View on Map
                    </a>
                  )}
                  <button onClick={onClose} style={closeBtnStyle}>
                    ✕ Close
                  </button>
                </div>

              </div>
            </div>

            {/* ══════════════════════════════════════
                RIGHT PANEL — Image (55%)
               ══════════════════════════════════════ */}
            <div style={{
              width: '55%',
              height: '100%',
              position: 'relative',
              backgroundColor: '#F3F4F6',
              flexShrink: 0,
              overflow: 'hidden',
            }}>
              <img
                src={imageUrl}
                alt={place?.place_name}
                referrerPolicy="no-referrer"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  if (imageIndex < imageCandidates.length - 1) {
                    setImageIndex((current) => current + 1);
                  }
                }}
              />

              {/* Gradient overlay at bottom */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '24px',
              }}>
                <p style={{ color: 'white', fontWeight: '800', fontSize: '22px', margin: 0, textTransform: 'uppercase' }}>
                  {place.place_name}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '4px 0 0 0' }}>
                  {place.city}{place.state ? `, ${place.state}` : ''}
                </p>
              </div>

              {/* Close button on image panel */}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                  zIndex: 10,
                }}
              >
                ✕
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ── Style Constants ──────────────────────────────────────────

const pillStyle = {
  backgroundColor: '#FFF7ED',
  color: '#EA580C',
  padding: '4px 12px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: '600',
  border: '1px solid #FED7AA',
};

const infoBoxStyle = {
  backgroundColor: '#EFF6FF',
  color: '#1D4ED8',
  padding: '12px 16px',
  borderRadius: '12px',
  fontSize: '13px',
  lineHeight: '1.6',
};

const tipBoxStyle = {
  backgroundColor: '#FFFBEB',
  color: '#92400E',
  padding: '12px 16px',
  borderRadius: '12px',
  fontSize: '13px',
  lineHeight: '1.6',
  border: '1px solid #FDE68A',
};

const labelStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#9CA3AF',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px',
  margin: '0 0 6px 0',
};

const fareCardStyle = {
  backgroundColor: '#F9FAFB',
  borderRadius: '10px',
  padding: '10px 12px',
  border: '1px solid #F3F4F6',
};

const notAvailableBadge = {
  display: 'inline-block',
  backgroundColor: '#FEF2F2',
  color: '#DC2626',
  border: '1px solid #FECACA',
  padding: '2px 8px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: '600',
  marginTop: '4px',
};

const amberBadgeStyle = {
  display: 'inline-block',
  backgroundColor: '#FFFBEB',
  color: '#92400E',
  border: '1px solid #FDE68A',
  padding: '4px 12px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: '600',
  marginBottom: '8px',
};

const mapBtnStyle = {
  backgroundColor: '#EA580C',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '10px',
  fontWeight: '700',
  fontSize: '14px',
  textDecoration: 'none',
  display: 'inline-block',
  cursor: 'pointer',
};

const closeBtnStyle = {
  backgroundColor: '#F3F4F6',
  color: '#374151',
  padding: '10px 20px',
  borderRadius: '10px',
  fontWeight: '700',
  fontSize: '14px',
  border: 'none',
  cursor: 'pointer',
};

export default PlaceDetailModal;
