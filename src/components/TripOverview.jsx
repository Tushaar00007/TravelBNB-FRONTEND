import { MapPin, Calendar, Home, Star, DollarSign } from "lucide-react";

function StatCard({ icon, label, value }) {
    return (
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-orange-500 shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold tracking-wide">{label}</p>
                <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{value}</p>
            </div>
        </div>
    );
}

export default function TripOverview({ trip }) {
    const start = trip.start_date ? new Date(trip.start_date) : null;
    const end = trip.end_date ? new Date(trip.end_date) : null;
    const nights = start && end ? Math.round((end - start) / 86400000) : null;
    const today = new Date();
    const daysUntil = start ? Math.max(0, Math.ceil((start - today) / 86400000)) : null;

    const fmt = (d) =>
        d?.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) || "TBD";

    return (
        <div className="space-y-6">
            {/* Hero image */}
            <div className="h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-amber-500 relative">
                {trip.property?.image ? (
                    <img src={trip.property.image} alt={trip.property.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-20 h-20 text-white/40" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
                    <div>
                        <p className="text-white/80 text-sm font-medium mb-1 flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> {typeof trip.property?.location === "object" ? `${trip.property.location.city}, ${trip.property.location.state}` : (trip.property?.location || "Location")}
                        </p>
                        <p className="text-white text-2xl font-extrabold">{trip.property?.title || "Property"}</p>
                    </div>
                </div>
                {daysUntil !== null && daysUntil > 0 && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        {daysUntil}d to go 🗓
                    </div>
                )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard icon={<Calendar className="w-5 h-5" />} label="Check-in" value={fmt(start)} />
                <StatCard icon={<Calendar className="w-5 h-5" />} label="Check-out" value={fmt(end)} />
                {nights && <StatCard icon={<Home className="w-5 h-5" />} label="Duration" value={`${nights} night${nights > 1 ? "s" : ""}`} />}
                {trip.property?.price_per_night && (
                    <StatCard
                        icon={<DollarSign className="w-5 h-5" />}
                        label="Price / night"
                        value={`₹${trip.property.price_per_night.toLocaleString()}`}
                    />
                )}
                <StatCard icon={<Star className="w-5 h-5" />} label="Travellers" value={trip.members?.length || 1} />
                {trip.expenses_summary?.total > 0 && (
                    <StatCard icon={<DollarSign className="w-5 h-5" />} label="Total expenses" value={`₹${trip.expenses_summary.total.toLocaleString()}`} />
                )}
            </div>
        </div>
    );
}
