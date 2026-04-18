import React from 'react';
import HomeCard from './ListingCard';
import { SlidersHorizontal } from 'lucide-react';

function SkeletonCard() {
    return (
        <div className="flex flex-col gap-3 animate-pulse bg-white dark:bg-gray-800 p-4 rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
            <div className="rounded-[2rem] bg-gray-200 dark:bg-gray-700 aspect-[4/5] w-full" />
            <div className="space-y-3 mt-4 px-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
                <div className="h-4 bg-gray-100 dark:border-gray-800 rounded-full w-1/2" />
                <div className="flex justify-between items-center mt-6">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3" />
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
            </div>
        </div>
    );
}

function ResultsGrid({ loading, homes, viewMode, onClearFilters }) {
    if (loading) {
        return (
            <div className={`grid gap-8 ${viewMode === "list" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"}`}>
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        );
    }

    if (homes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-8 border border-gray-100 dark:border-gray-800">
                    <SlidersHorizontal size={40} className="text-gray-200 dark:text-gray-700" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase transition-colors">No stays found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-sm font-medium">
                    Try expanding your search or adjusting your filters to find more properties.
                </p>
                <button
                    onClick={onClearFilters}
                    className="px-10 py-4 bg-primary text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
                >
                    Clear All Filters
                </button>
            </div>
        );
    }

    return (
        <div className={`grid gap-8 ${viewMode === "list" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"}`}>
            {homes.map((home, index) => (
                <HomeCard key={`${home._type}_${home._id || home.id || index}`} home={home} />
            ))}
        </div>
    );
}

export default ResultsGrid;
