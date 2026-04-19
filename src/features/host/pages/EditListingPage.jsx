import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, Save, Loader2, Home, MapPin,
  DollarSign, Users, Wifi, Wind, Utensils, Tv,
  Car, Dumbbell, Flame, Monitor, PawPrint,
  Shield, Upload, X, Check, Image as ImageIcon,
  Sparkles, Trash2, ToggleLeft, ToggleRight,
  Waves, Plus, Minus, IndianRupee
} from 'lucide-react';
import API from '../../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AMENITIES = [
  { key: 'wifi', label: 'WiFi', icon: Wifi },
  { key: 'ac', label: 'Air Conditioning', icon: Wind },
  { key: 'kitchen', label: 'Kitchen', icon: Utensils },
  { key: 'tv', label: 'TV', icon: Tv },
  { key: 'parking', label: 'Free Parking', icon: Car },
  { key: 'pool', label: 'Swimming Pool', icon: Waves },
  { key: 'gym', label: 'Gym', icon: Dumbbell },
  { key: 'washer', label: 'Washer', icon: Wind },
  { key: 'dryer', label: 'Dryer', icon: Wind },
  { key: 'heating', label: 'Heating', icon: Flame },
  { key: 'workspace', label: 'Workspace', icon: Monitor },
  { key: 'pet_friendly', label: 'Pet Friendly', icon: PawPrint },
];

const PROPERTY_TYPES = ['Apartment', 'House', 'Villa', 'Studio', 'Room', 'Cottage', 'Cabin'];

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-[2rem] border border-gray-100 p-8 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-50">
      <div className="bg-orange-50 p-3 rounded-2xl">
        <Icon size={20} className="text-orange-600" />
      </div>
      <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

const NumberInput = ({ label, value, onChange, min = 1 }) => (
  <div className="flex flex-col gap-3">
    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">{label}</label>
    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-900 hover:bg-orange-600 hover:text-white transition-all shadow-sm active:scale-95"
      >
        <Minus size={16} strokeWidth={3} />
      </button>
      <span className="font-black text-lg min-w-[32px] text-center text-gray-900">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-900 hover:bg-orange-600 hover:text-white transition-all shadow-sm active:scale-95"
      >
        <Plus size={16} strokeWidth={3} />
      </button>
    </div>
  </div>
);

function EditListingPage() {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [listing, setListing] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    property_type: 'Apartment',
    price_per_night: 0,
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    max_guests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: [],
    images: [],
    house_rules: {
      no_smoking: true,
      no_pets: false,
      no_parties: true,
      check_in: '14:00',
      check_out: '11:00'
    }
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        let data = null;
        const endpoints = [
          `/homes/${listingId}`,
          `/properties/${listingId}`,
          `/crashpads/${listingId}`,
          `/travel-buddies/${listingId}`,
        ];
        for (const endpoint of endpoints) {
          try {
            const res = await API.get(endpoint);
            if (res.data) { data = res.data; break; }
          } catch {}
        }
        if (!data) throw new Error("Listing not found");

        setListing(data);
        setForm({
          title: data.title || '',
          description: data.description || '',
          property_type: data.property_type || 'Apartment',
          price_per_night: data.price_per_night || 0,
          address: data.location?.address_line || data.address || '',
          city: data.city || data.location?.city || '',
          state: data.state || data.location?.state || '',
          pincode: data.pincode || data.location?.pincode || '',
          country: data.country || data.location?.country || 'India',
          max_guests: data.max_guests || 1,
          bedrooms: data.bedrooms || 1,
          beds: data.beds || 1,
          bathrooms: data.bathrooms || 1,
          amenities: data.amenities || [],
          images: data.images || [],
          house_rules: data.house_rules || {
            no_smoking: true,
            no_pets: false,
            no_parties: true,
            check_in: '14:00',
            check_out: '11:00'
          }
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to load listing details');
        navigate('/host/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [listingId, navigate]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRuleChange = (rule, value) => {
    setForm(prev => ({
      ...prev,
      house_rules: { ...prev.house_rules, [rule]: value }
    }));
  };

  const toggleAmenity = (key) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(key)
        ? prev.amenities.filter(a => a !== key)
        : [...prev.amenities, key]
    }));
  };
  const getImageUrl = (url) => {
    if (!url) return '';
    if (typeof url !== 'string') return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('data:')) return url;

    // Relative path helper derived from VITE_API_BASE_URL
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
    const baseUrl = apiBase.replace(/\/api$/, '');
    const cleanPath = url.startsWith('/') ? url : `/uploads/${url}`;
    const finalPath = cleanPath.startsWith('/uploads/') ? cleanPath : `/uploads${cleanPath}`;
    return `${baseUrl}${finalPath.replace('//', '/')}`;
  };

  const handleImageUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    setUploadingImages(true);
    const toastId = toast.loading('Uploading photos...');

    try {
      const formData = new FormData();

      // Key MUST be 'files' to match backend List[UploadFile] = File(...)
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      console.log('Uploading', selectedFiles.length, 'files');

      const res = await API.post('/upload/images', formData, {
        headers: {
          'Content-Type': undefined,
        },
        transformRequest: (data) => data,
      });

      console.log('Upload response:', res.data);

      const newUrls = res.data.images.map(img => img.url);
      setForm(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newUrls],
      }));

      toast.success(`${newUrls.length} photo(s) uploaded!`, { id: toastId });
    } catch (err) {
      console.error('Upload failed:', err.response?.data || err.message);
      toast.error(
        err.response?.data?.detail || 'Upload failed',
        { id: toastId }
      );
    } finally {
      setUploadingImages(false);
      // Reset input so same file can be re-selected
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      try {
        await API.patch(`/homes/${listingId}`, form);
      } catch {
        await API.patch(`/properties/${listingId}`, form);
      }
      toast.success('Listing updated successfully!');
      navigate('/host/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      try {
        try {
          await API.delete(`/homes/${listingId}`);
        } catch {
          await API.delete(`/properties/${listingId}`);
        }
        toast.success('Listing deleted');
        navigate('/host/dashboard');
      } catch (err) {
        toast.error('Failed to delete listing');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <header className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-orange-600 hover:border-orange-100 transition-all shadow-sm active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-900 italic tracking-tight">EDIT LISTING</h1>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">
                Management Console &bull; {listing?.property_type || 'Property'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">

          {/* Left Column: Form */}
          <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">

            <SectionCard title="Basic Information" icon={Home}>
              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Listing Title</label>
                  <input
                    value={form.title}
                    onChange={e => handleChange('title', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    placeholder="E.g. Penthouse with Panoramic City Views"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => handleChange('description', e.target.value)}
                    rows={6}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-medium text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                    placeholder="Describe the unique features of your property..."
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Property Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PROPERTY_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => handleChange('property_type', type)}
                        className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${form.property_type === type
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20 scale-95'
                            : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Location" icon={MapPin}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Address</label>
                  <input
                    value={form.address}
                    onChange={e => handleChange('address', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">City</label>
                  <input
                    value={form.city}
                    onChange={e => handleChange('city', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Province / State</label>
                  <input
                    value={form.state}
                    onChange={e => handleChange('state', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Pricing" icon={DollarSign}>
              <div className="flex items-center p-6 bg-orange-50/50 rounded-3xl border border-orange-100/50">
                <div className="bg-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mr-6 shadow-lg shadow-orange-500/20">
                  <IndianRupee size={32} strokeWidth={3} />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 block mb-1">Price Per Night</label>
                  <input
                    type="number"
                    value={form.price_per_night}
                    onChange={e => handleChange('price_per_night', Number(e.target.value))}
                    className="bg-transparent text-4xl font-black italic text-gray-900 outline-none w-full"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Capacity & Rooms" icon={Users}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                <NumberInput label="Guests" value={form.max_guests} onChange={v => handleChange('max_guests', v)} />
                <NumberInput label="Bedrooms" value={form.bedrooms} onChange={v => handleChange('bedrooms', v)} />
                <NumberInput label="Beds" value={form.beds} onChange={v => handleChange('beds', v)} />
                <NumberInput label="Baths" value={form.bathrooms} onChange={v => handleChange('bathrooms', v)} />
              </div>
            </SectionCard>

            <SectionCard title="Amenities" icon={Sparkles}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {AMENITIES.map(({ key, label, icon: Icon }) => {
                  const selected = form.amenities.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleAmenity(key)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${selected
                          ? 'bg-orange-50 border-orange-100 text-orange-600 shadow-sm'
                          : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      <Icon size={16} />
                      <span className="font-bold text-xs uppercase tracking-tight">{label}</span>
                      {selected && <Check size={14} className="ml-auto" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard title="House Rules" icon={Shield}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {[
                    { key: 'no_smoking', label: 'No Smoking' },
                    { key: 'no_pets', label: 'No Pets Allowed' },
                    { key: 'no_parties', label: 'No Parties' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{label}</span>
                      <button
                        onClick={() => handleRuleChange(key, !form.house_rules[key])}
                        className={`text-3xl transition-colors ${form.house_rules[key] ? 'text-orange-600' : 'text-gray-200'}`}
                      >
                        {form.house_rules[key] ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">Check-in After</span>
                    <input
                      type="time"
                      value={form.house_rules.check_in}
                      onChange={e => handleRuleChange('check_in', e.target.value)}
                      className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">Check-out Before</span>
                    <input
                      type="time"
                      value={form.house_rules.check_out}
                      onChange={e => handleRuleChange('check_out', e.target.value)}
                      className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

          </div>

          {/* Right Column: Photos & Status */}
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">

            <div className="sticky top-24">
              <SectionCard title="Photos" icon={ImageIcon}>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-6">
                  First photo is the default cover
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {form.images.map((img, i) => (
                    <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                      <img src={getImageUrl(img)} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => removeImage(i)}
                          className="w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      {i === 0 && (
                        <div className="absolute top-3 left-3 bg-orange-600 text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full shadow-lg">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}
                  <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-orange-200 transition-all group">
                    <div className="bg-white p-3 rounded-xl shadow-sm text-gray-400 group-hover:text-orange-600 group-hover:scale-110 transition-all mb-2">
                      <Upload size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Add Photo</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </SectionCard>

              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h4 className="font-black text-gray-900 uppercase italic tracking-tighter">Listing Visibility</h4>
                    <p className="text-gray-400 text-xs font-bold mt-1">Control your active status</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-500 font-black text-xs uppercase tracking-widest">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Live
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-900/10">
                    Switch to Inactive
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 active:scale-95 transition-all"
                  >
                    <Trash2 size={16} className="inline mr-2" />
                    Delete Listing
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default EditListingPage;
