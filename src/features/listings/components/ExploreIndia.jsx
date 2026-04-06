import { images } from "../../../assets/images";

const categories = [
    { title: "Beaches", description: "Bask in the sun and surf at India's pristine coastlines.", image: images.explore.beaches },
    { title: "Mountains", description: "Escape to the peak and breathe in the crisp mountain air.", image: images.explore.mountains },
    { title: "Heritage", description: "Explore iconic landmarks and ancient historical sites.", image: images.explore.heritage },
    { title: "Cities", description: "Experience the vibrant energy and culture of urban life.", image: images.explore.cities }
];

export default function ExploreIndia() {
    return (
        <section className="py-20 px-6 md:px-12 bg-[#F8FAFC] dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">
                        Explore India
                    </h2>
                    <p className="text-gray-500 font-medium">Immerse yourself in diversity across the subcontinent.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {categories.map((cat, idx) => (
                        <div 
                            key={idx} 
                            className="relative h-96 rounded-[2.5rem] overflow-hidden group cursor-pointer border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-2xl transition-all duration-500"
                        >
                            <img 
                                src={cat.image} 
                                alt={cat.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-10 left-10 text-white max-w-sm">
                                <h3 className="text-3xl font-black mb-3 tracking-tighter uppercase">{cat.title}</h3>
                                <p className="text-gray-200 font-medium text-sm leading-relaxed">{cat.description}</p>
                                <button className="mt-6 px-6 py-2 bg-white text-black font-black rounded-xl text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-colors duration-300">
                                    Explore More
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
