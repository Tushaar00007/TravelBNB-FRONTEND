import { images } from "../../../assets/images";

const destinations = [
    { name: "Goa", stays: "1,240 stays", image: images.destinations.goa },
    { name: "Manali", stays: "850 stays", image: images.destinations.manali },
    { name: "Jaipur", stays: "620 stays", image: images.destinations.jaipur },
    { name: "Kerala", stays: "1,100 stays", image: images.destinations.kerala },
    { name: "Mumbai", stays: "2,400 stays", image: images.destinations.mumbai },
    { name: "Delhi", stays: "3,200 stays", image: images.destinations.delhi },
    { name: "Udaipur", stays: "450 stays", image: images.destinations.udaipur },
    { name: "Shimla", stays: "580 stays", image: images.destinations.shimla }
];

export default function TrendingDestinations() {
    return (
        <section className="py-20 px-6 md:px-12 bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">
                            Trending Destinations
                        </h2>
                        <p className="text-gray-500 font-medium">Most loved by our community recently.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {destinations.map((dest, idx) => (
                        <div key={idx} className="group cursor-pointer">
                            <div className="relative aspect-square rounded-3xl overflow-hidden mb-3">
                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{dest.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{dest.stays}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
