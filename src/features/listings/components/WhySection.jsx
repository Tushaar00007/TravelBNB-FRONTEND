import React from "react";
import { ShieldCheck, Zap, Globe, Heart } from "lucide-react";

const whyData = [
    {
        icon: <Zap className="text-orange-500" size={32} />,
        title: "Affordable Stays",
        description: "Best prices for high-quality verified listings across the country."
    },
    {
        icon: <ShieldCheck className="text-orange-500" size={32} />,
        title: "Trusted Community",
        description: "Our hosts go through a rigorous verification process for your safety."
    },
    {
        icon: <Globe className="text-orange-500" size={32} />,
        title: "Verified Listings",
        description: "Every property is manually checked to match the photos and description."
    },
    {
        icon: <Heart className="text-orange-500" size={32} />,
        title: "24/7 Support",
        description: "Our dedicated support team is always here to help you with your stay."
    }
];

export default function WhySection() {
    return (
        <section className="py-20 px-6 md:px-12 bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">
                        Why TravelBNB?
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
                        We go the extra mile to ensure your travel experience is seamless, safe, and unforgettable.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {whyData.map((item, idx) => (
                        <div 
                            key={idx} 
                            className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-premium hover:-translate-y-2 transition-all duration-300 group"
                        >
                            <div className="mb-6 p-4 bg-white dark:bg-gray-800 w-fit rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                {item.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
