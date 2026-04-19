import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Heart, Star, MapPin, Users, Shield,
  ArrowRight, BedDouble, Bath
} from 'lucide-react';
import toast from 'react-hot-toast';

function HomeCard({ home: listing }) {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(JSON.parse(localStorage.getItem('wishlist') || '[]'));

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const handleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(prev => prev.filter(item => item !== id));
      toast.success("Removed from wishlist");
    } else {
      setWishlist(prev => [...prev, id]);
      toast.success("Added to wishlist");
    }
  };

  const getImageUrl = (listing) => {
    // Try different possible image fields from various listing types
    const raw = listing.images?.[0] 
      || listing.image 
      || listing.cover_image
      || listing.thumbnail;
    
    if (!raw) {
      // Fallback to Unsplash based on property type or title
      const query = encodeURIComponent(
        listing.property_type || listing.title || 'luxury apartment'
      );
      return `https://source.unsplash.com/featured/600x400/?${query},interior,home`;
    }
    
    if (typeof raw !== 'string') return '';

    // 1. If already a full URL (Cloudinary or otherwise)
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }
    
    // 2. If base64 (legacy/local preview)
    if (raw.startsWith('data:')) {
      return raw;
    }

    const isRelative = !raw.includes(' ') && (raw.includes('.') || raw.startsWith('/'));
    if (isRelative) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
      const baseUrl = apiBase.replace(/\/api$/, '');
      const cleanPath = raw.startsWith('/') ? raw : `/uploads/${raw}`;
      // Prevent double /uploads if it's already there
      const finalPath = cleanPath.startsWith('/uploads/') ? cleanPath : `/uploads${cleanPath}`;
      return `${baseUrl}${finalPath.replace('//', '/')}`;
    }
    
    // 4. Default fallback
    return `https://source.unsplash.com/featured/600x400/?${encodeURIComponent(listing.title || 'home')},interior`;
  };

  const chipStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 8px',
    backgroundColor: '#F9FAFB',
    border: '1px solid #F3F4F6',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#6B7280',
    fontWeight: '500',
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid #F3F4F6',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      }}
      onClick={() => navigate(`/homes/${listing._id || listing.id}`)}
    >
      {/* IMAGE SECTION */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
        <img
          src={getImageUrl(listing)}
          alt={listing.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.3s',
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://source.unsplash.com/featured/600x400/?${
              encodeURIComponent(listing.property_type || 'apartment,luxury,interior')
            }`;
          }}
        />

        {/* Gradient overlay at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '80px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
        }} />

        {/* Wishlist heart button */}
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            handleWishlist(listing._id || listing.id); 
          }}
          style={{
            position: 'absolute', top: '12px', right: '12px',
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(4px)',
            zIndex: 10,
          }}
        >
          <Heart size={16}
            fill={wishlist.includes(listing._id || listing.id) ? '#EF4444' : 'none'}
            color={wishlist.includes(listing._id || listing.id) ? '#EF4444' : '#374151'}
          />
        </button>

        {/* Badges top-left */}
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          display: 'flex', gap: '6px', flexWrap: 'wrap',
          zIndex: 10,
        }}>
          {(listing.is_trending || listing.views > 100) && (
            <span style={{
              backgroundColor: '#EA580C', color: 'white',
              padding: '4px 10px', borderRadius: '999px',
              fontSize: '10px', fontWeight: '800',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              🔥 Trending
            </span>
          )}
          {(listing.is_verified || listing.host_verified) && (
            <span style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              color: '#374151',
              padding: '4px 10px', borderRadius: '999px',
              fontSize: '10px', fontWeight: '700',
              display: 'flex', alignItems: 'center', gap: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}>
              <Shield size={10} color="#22C55E" fill="#22C55E" /> Verified
            </span>
          )}
        </div>

        {/* Price bottom-left over image */}
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px',
          zIndex: 10,
        }}>
          <span style={{
            backgroundColor: 'rgba(0,0,0,0.75)',
            color: 'white', padding: '5px 12px',
            borderRadius: '8px', fontSize: '14px',
            fontWeight: '800', backdropFilter: 'blur(4px)',
          }}>
            {listing.is_free ? 'FREE' : `₹${(listing.price_per_night || listing.price || 0).toLocaleString()}`}
            {!listing.is_free && (
              <span style={{ fontSize: '11px', fontWeight: '500',
                opacity: 0.8 }}> / night</span>
            )}
          </span>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Title + Rating row */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: '6px' }}>
          <h3 style={{
            fontWeight: '700', fontSize: '15px',
            color: '#111827', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', maxWidth: '75%',
          }}>
            {listing.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px',
            flexShrink: 0 }}>
            <Star size={13} fill="#F59E0B" color="#F59E0B" />
            <span style={{ fontWeight: '700', fontSize: '13px',
              color: '#111827' }}>
              {listing.rating || '4.9'}
            </span>
          </div>
        </div>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px',
          marginBottom: '10px' }}>
          <MapPin size={12} color="#9CA3AF" />
          <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '500' }}>
            {listing.city}
            {listing.state ? `, ${listing.state}` : ''}
          </span>
        </div>

        {/* Property details chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap',
          marginBottom: '14px' }}>
          {listing.max_guests && (
            <span style={chipStyle}>
              <Users size={11} /> {listing.max_guests} guests
            </span>
          )}
          {listing.bedrooms && (
            <span style={chipStyle}>
              <BedDouble size={11} /> {listing.bedrooms} bed
            </span>
          )}
          {listing.bathrooms && (
            <span style={chipStyle}>
              <Bath size={11} /> {listing.bathrooms} bath
            </span>
          )}
        </div>

        {/* Bottom row: View button */}
        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/homes/${listing._id || listing.id}`);
            }}
            style={{
              width: '100%', padding: '10px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #EA580C, #F97316)',
              color: 'white', border: 'none',
              fontWeight: '700', fontSize: '13px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '6px',
              boxShadow: '0 2px 8px rgba(234,88,12,0.3)',
              transition: 'opacity 0.2s',
            }}
          >
            View Details <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomeCard;