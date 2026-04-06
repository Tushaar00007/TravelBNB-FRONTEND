import React from "react";
import SearchBar from "./SearchBar";

export default function HeroSection({ onSearch }) {
    return (
        <section className="relative h-[600px] w-full flex items-center justify-center">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop" 
                    alt="Travel Background" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-lg tracking-tighter">
                    Find your next <span className="text-primary italic">adventure</span> with TravelBNB
                </h1>
                <p className="text-xl text-gray-100 mb-12 max-w-2xl font-medium drop-shadow-md">
                    Discover handpicked stays, from luxury villas to serene treehouses, all across India.
                </p>

                {/* Floating Search Bar */}
                <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-full p-2 shadow-2xl animate-fade-in border border-white/20">
                    <SearchBar onSearch={onSearch} />
                </div>
            </div>
        </section>
    );
}
