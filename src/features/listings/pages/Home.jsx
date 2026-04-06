import HeroSection from "../components/HeroSection";
import WhySection from "../components/WhySection";
import PropertyTypes from "../components/PropertyTypes";
import TrendingDestinations from "../components/TrendingDestinations";
import ExploreIndia from "../components/ExploreIndia";

function Home() {
    return (
        <div className="bg-[#F8FAFC] dark:bg-gray-950 min-h-screen font-sans transition-colors duration-300">
            {/* Premium Landing Sections */}
            <HeroSection />
            <WhySection />
            <PropertyTypes />
            <TrendingDestinations />
            <ExploreIndia />
        </div>
    );
}

export default Home;