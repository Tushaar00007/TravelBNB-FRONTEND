import { images } from "../../../assets/images";

const propertyTypes = [
    { title: "Apartments", image: images.apartments.main },
    { title: "Villas", image: images.villas.main },
    { title: "Treehouses", image: images.treehouses.main },
    { title: "Cabins", image: images.cabins.main },
    { title: "Beach Houses", image: images.beachhouses.main }
];

export default function PropertyTypes() {
    return (
        <section className="py-20 px-6 md:px-12 bg-[#F8FAFC] dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">
                        Browse by Property Type
                    </h2>
                    <p className="text-gray-500 font-medium">Find the perfect space that fits your vibe.</p>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar">
                    {propertyTypes.map((type, idx) => (
                        <div 
                            key={idx} 
                            className="flex-shrink-0 w-64 group cursor-pointer"
                        >
                            <div className="relative h-80 rounded-[2rem] overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-500">
                                <img 
                                    src={type.image} 
                                    alt={type.title} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <div className="absolute bottom-6 left-6 text-white font-black text-xl tracking-wide uppercase">
                                    {type.title}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
