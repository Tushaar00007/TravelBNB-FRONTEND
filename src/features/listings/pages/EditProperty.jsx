import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import API from "../../../services/api";
import { Home, MapPin, Sparkles, Camera, FileText, IndianRupee, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useTranslation } from "react-i18next";

const propertyTypes = ["House", "Apartment", "Cabin", "Villa", "Farmhouse", "Hotel", "Boutique Hotel"];
const availableAmenities = ["Wifi", "Kitchen", "Free parking", "Pool", "Hot tub", "Air conditioning", "Heating", "TV", "Washer", "Dryer", "Gym", "Breakfast"];

const indianStatesAndCities = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Lonavala", "Mahabaleshwar"],
    "Delhi": ["New Delhi"],
    "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Coorg"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Ooty", "Kodaikanal"],
    "West Bengal": ["Kolkata", "Darjeeling", "Siliguri"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Pushkar", "Jaisalmer"],
    "Uttar Pradesh": ["Lucknow", "Agra", "Varanasi", "Noida", "Ghaziabad"],
    "Kerala": ["Kochi", "Thiruvananthapuram", "Munnar", "Alleppey", "Wayanad"],
    "Goa": ["North Goa", "South Goa", "Panaji"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Dalhousie"],
    "Uttarakhand": ["Dehradun", "Mussoorie", "Nainital", "Rishikesh", "Haridwar"]
};

function EditProperty() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const userId = Cookies.get("userId");

    // Redirect if not logged in
    if (!userId) {
        navigate("/login");
    }

    // Replace step state, we don't need wizard steps constraint anymore
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [uploadingCount, setUploadingCount] = useState(0);

    const [formData, setFormData] = useState({
        property_type: "House",
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        max_guests: 1,
        city: "",
        state: "",
        amenities: [],
        images: [""],
        title: "",
        description: "",
        caretaker_info: "",
        price_per_night: "",
        location: { lat: 20.5937, lng: 78.9629 } // Default to center of India
    });

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const res = await API.get(`/homes/${id}`);
                const data = res.data;

                // Ensure the user actually owns this property
                if (data.host_id !== userId) {
                    navigate("/host-dashboard");
                    return;
                }

                setFormData({
                    ...formData,
                    ...data,
                    images: data.images?.length > 0 ? data.images : [""], // keep the '' structure
                    location: data.location || { lat: 20.5937, lng: 78.9629 }
                });
            } catch (err) {
                console.error("Failed to fetch property details", err);
                setError("Failed to load property details. It may not exist.");
            } finally {
                setFetching(false);
            }
        };

        if (id && userId) {
            fetchProperty();
        }
    }, [id, userId, navigate]);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    // No more next/prev step handlers

    const handleMultipleImagesUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const invalidFile = files.find(f => f.size > 5 * 1024 * 1024);
        if (invalidFile) {
            setError("One or more images exceed the 5MB limit.");
            return;
        }

        setUploadingCount(files.length);
        setError("");

        try {
            const token = Cookies.get("token");

            const uploadPromises = files.map(file => {
                const uploadData = new FormData();
                uploadData.append("file", file);

                return API.post("/upload/property", uploadData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => res.data.url);
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            const validExisting = formData.images.filter(img => img.trim() !== "");

            setFormData({
                ...formData,
                images: [...validExisting, ...uploadedUrls]
            });
        } catch (err) {
            console.error("Image upload failed", err);
            setError(err.response?.data?.detail || "Failed to upload images. Please try again.");
        } finally {
            setUploadingCount(0);
        }
    };

    const handleAmenityToggle = (amenity) => {
        setFormData((prev) => {
            const current = prev.amenities;
            if (current.includes(amenity)) {
                return { ...prev, amenities: current.filter((a) => a !== amenity) };
            } else {
                return { ...prev, amenities: [...current, amenity] };
            }
        });
    };

    const submitProperty = async () => {
        setLoading(true);
        setError("");
        try {
            // Filter out empty image URLs
            const finalData = {
                ...formData,
                images: formData.images.filter(img => img.trim() !== ""),
                price_per_night: Number(formData.price_per_night) || 0
            };

            const token = Cookies.get("token");

            const res = await API.put(`/homes/${id}`, finalData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("Property updated:", res.data);
            navigate("/host-dashboard"); // Redirect to dashboard upon success
        } catch (err) {
            console.error(err);
            setError("Failed to create listing. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 flex flex-col items-center justify-center">

                <div className="flex-1 flex flex-col items-center justify-center text-orange-600">
                    <Loader2 className="animate-spin mb-4" size={40} />
                    <p>Loading property details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 flex flex-col">


            <div className="flex-1 max-w-3xl w-full mx-auto p-8 flex flex-col">
                <div className="flex justify-between items-center mb-10 border-b border-gray-200 dark:border-gray-800 pb-6">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Edit Listing</h1>
                    <button
                        onClick={submitProperty}
                        disabled={loading || !formData.price_per_night || formData.price_per_night <= 0 || !formData.title}
                        className="bg-orange-600 text-white font-semibold flex items-center gap-2 px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Changes"} <Sparkles size={18} />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                        {error}
                    </div>
                )}

                <div className="space-y-16">
                    {/* Property Type */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Property Type</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {propertyTypes.map(type => (
                                <div
                                    key={type}
                                    onClick={() => setFormData({ ...formData, property_type: type })}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.property_type === type ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'}`}
                                >
                                    <Home className={`mb-3 ${formData.property_type === type ? 'text-orange-600' : 'text-gray-500'}`} size={32} />
                                    <p className="font-semibold text-gray-900 dark:text-gray-200">{type}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Details */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Listing Details</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Property Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-lg"
                                    placeholder="E.g., Sunny Beachfront Villa"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none min-h-[150px]"
                                    placeholder="Tell guests what makes your place special..."
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Caretaker Info (Optional)</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-4 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={formData.caretaker_info}
                                        onChange={(e) => setFormData({ ...formData, caretaker_info: e.target.value })}
                                        className="w-full pl-12 p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="E.g., John Doe - +91 9876543210"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Basics */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Rooms & Guests</h2>
                        <div className="space-y-6 max-w-md">
                            {[
                                { id: "max_guests", label: "Guests" },
                                { id: "bedrooms", label: "Bedrooms" },
                                { id: "beds", label: "Beds" },
                                { id: "bathrooms", label: "Bathrooms" }
                            ].map((item) => (
                                <div key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-lg text-gray-800 dark:text-gray-200">{item.label}</span>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setFormData({ ...formData, [item.id]: Math.max(1, formData[item.id] - 1) })}
                                            className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:border-gray-900 dark:hover:text-white"
                                        >
                                            -
                                        </button>
                                        <span className="w-4 text-center text-gray-900 dark:text-white">{formData[item.id]}</span>
                                        <button
                                            onClick={() => setFormData({ ...formData, [item.id]: formData[item.id] + 1 })}
                                            className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:border-gray-900 dark:hover:text-white"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Amenities */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Amenities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {availableAmenities.map(amenity => (
                                <div
                                    key={amenity}
                                    onClick={() => handleAmenityToggle(amenity)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${formData.amenities.includes(amenity) ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'}`}
                                >
                                    {formData.amenities.includes(amenity) ? <CheckCircle2 size={20} className="text-orange-600" /> : <Sparkles size={20} className="text-gray-400" />}
                                    <span className="font-medium">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Pricing */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Pricing</h2>
                        <div className="flex items-center p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
                            <IndianRupee className="text-gray-900 dark:text-white mr-2" size={32} />
                            <input
                                type="number"
                                value={formData.price_per_night}
                                onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value ? Number(e.target.value) : "" })}
                                className="bg-transparent text-4xl font-bold text-gray-900 dark:text-white outline-none w-full"
                                placeholder="0"
                            />
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">per night (INR)</p>
                    </section>

                    {/* Photos */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Photos</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your property images.</p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 max-w-xl">
                                <label className="flex-1 flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors relative overflow-hidden group">
                                    <Camera size={32} className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-gray-600 dark:text-gray-300 font-medium z-10">Click to upload photos</span>
                                    <span className="text-xs text-gray-500 mb-4 z-10">Supported: JPG, PNG (Max 5MB each)</span>
                                    <span className="px-4 py-2 rounded-full bg-orange-50 text-orange-700 font-semibold text-sm border border-orange-100 shadow-sm z-10 group-hover:bg-orange-600 group-hover:text-white transition-colors">Browse Files</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleMultipleImagesUpload}
                                        disabled={uploadingCount > 0}
                                    />
                                </label>
                            </div>

                            {uploadingCount > 0 && (
                                <div className="p-4 rounded-xl bg-orange-50 text-orange-700 text-sm font-semibold flex items-center justify-center gap-3 border border-orange-100 max-w-xl">
                                    <Loader2 className="animate-spin" size={20} />
                                    Uploading {uploadingCount} image(s)...
                                </div>
                            )}

                            {formData.images.filter(img => img.trim() !== "").length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                    {formData.images.filter(img => img.trim() !== "").map((img, index) => (
                                        <div key={index} className="relative group rounded-xl overflow-hidden aspect-square flex-shrink-0 bg-gray-100 border border-gray-200 shadow-sm">
                                            <img src={img} alt="Property preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => e.target.style.display = 'none'} />
                                            <button
                                                onClick={() => {
                                                    const validImages = formData.images.filter(i => i.trim() !== "");
                                                    validImages.splice(index, 1);
                                                    setFormData({ ...formData, images: validImages.length ? validImages : [""] });
                                                }}
                                                className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
                                                title="Remove Image"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Location */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Location</h2>
                        <div className="space-y-6 max-w-xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State / Region</label>
                                    <select
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value, city: "" })}
                                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
                                    >
                                        <option value="" disabled>Select State</option>
                                        {Object.keys(indianStatesAndCities).map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                        <select
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            disabled={!formData.state}
                                            className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none appearance-none disabled:opacity-50"
                                        >
                                            <option value="" disabled>Select City</option>
                                            {formData.state && indianStatesAndCities[formData.state]?.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Google Map Implementation */}
                            <div className="mt-8">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pinpoint on map</label>
                                <p className="text-sm text-gray-500 mb-4">Drag the pin to set the exact coordinates for your property.</p>

                                <div className="h-[300px] w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                    {isLoaded ? (
                                        <GoogleMap
                                            mapContainerStyle={{ width: '100%', height: '100%' }}
                                            center={formData.location}
                                            zoom={formData.state && formData.city ? 10 : 4}
                                            options={{
                                                disableDefaultUI: true,
                                                zoomControl: true,
                                            }}
                                        >
                                            <Marker
                                                position={formData.location}
                                                draggable={true}
                                                onDragEnd={(e) => {
                                                    setFormData({
                                                        ...formData,
                                                        location: {
                                                            lat: e.latLng.lat(),
                                                            lng: e.latLng.lng()
                                                        }
                                                    });
                                                }}
                                            />
                                        </GoogleMap>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                            Loading map...
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 text-xs text-gray-400 flex justify-between">
                                    <span>Lat: {formData.location.lat.toFixed(4)}</span>
                                    <span>Lng: {formData.location.lng.toFixed(4)}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Save button at bottom too for convenience */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                    <button
                        onClick={submitProperty}
                        disabled={loading || !formData.price_per_night || formData.price_per_night <= 0 || !formData.title}
                        className="bg-orange-600 text-white font-semibold flex items-center gap-2 px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Changes"} <Sparkles size={18} />
                    </button>
                </div>

            </div>

            <div className="h-24"></div>
        </div>
    );
}

export default EditProperty;
