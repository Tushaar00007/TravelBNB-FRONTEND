import React from "react";
import HeroSlider from "./HeroSlider";
import HeroContent from "./HeroContent";
import HeroSearchBar from "./HeroSearchBar";

export default function HeroSection({ onSearch }) {
    return (
        <section className="relative min-h-[85vh] md:h-[95vh] w-full flex flex-col items-center justify-center z-20">
            {/* Cinematic Slider Background */}
            <HeroSlider />

            {/* Overlay Content */}
            <div className="relative z-30 w-full max-w-7xl mx-auto px-6 flex flex-col items-center gap-4">
                <HeroContent />
                
                {/* Premium Glassmorphism Search Bar */}
                <div className="w-full mt-4">
                    <HeroSearchBar onSearch={onSearch} />
                </div>
            </div>
            
            {/* Bottom Gradient for smoother section transitions */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#F8FAFC] dark:from-gray-950 to-transparent z-10" />
        </section>
    );
}
