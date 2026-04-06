import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

/**
 * CreationLayout component provides a consistent, minimal, and centered 
 * Airbnb-style onboarding layout for all creation flows.
 */
const CreationLayout = ({ 
    children, 
    currentStep, 
    totalSteps, 
    onBack, 
    onNext, 
    nextLabel = "Next",
    loading = false,
    disableNext = false,
    saveAndExitPath = "/"
}) => {
    const navigate = useNavigate();
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-gray-900 transition-colors">
            {/* Minimal Global Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-20 py-4 h-[72px]">
                <div onClick={() => navigate("/")} className="cursor-pointer group flex items-center gap-2">
                    <h1 className="text-xl font-black tracking-tighter text-gray-900">
                        Travel<span className="text-orange-500">BNB</span>
                    </h1>
                </div>
                
                <button 
                    onClick={() => navigate(saveAndExitPath)}
                    className="px-5 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all active:scale-95"
                >
                    Save & Exit
                </button>
            </header>

            {/* Centered Main Content Area */}
            <main className="flex-1 flex flex-col pt-16 pb-32 px-6 overflow-y-auto">
                <div className="w-full max-w-[600px] mx-auto shrink-0 flex flex-col justify-center min-h-[50vh]">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full"
                    >
                        {children}
                    </motion.div>
                </div>
            </main>

            {/* Global Progress Bar & Bottom Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md">
                {/* Thin Animated Progress Bar */}
                <div className="w-full h-1 bg-gray-100 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.7, ease: "easeInOut" }}
                        className="h-full bg-orange-500 rounded-r-full"
                    />
                </div>
                
                <div className="max-w-[600px] mx-auto px-6 md:px-0 py-4 flex items-center justify-between h-[80px]">
                    <button 
                        onClick={onBack}
                        className={`flex items-center gap-2 text-sm font-bold text-gray-900 border-b-2 border-transparent hover:border-gray-900 pb-0.5 transition-all
                            ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <ArrowLeft size={16} strokeWidth={2.5} />
                        Back
                    </button>

                    <button 
                        onClick={onNext}
                        disabled={loading || disableNext}
                        className={`
                            px-8 py-3.5 rounded-full font-black text-sm transition-all flex items-center justify-center min-w-[120px]
                            ${loading || disableNext
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed uppercase tracking-widest' 
                                : 'bg-orange-600 text-white hover:bg-orange-700 shadow-xl shadow-orange-500/20 active:scale-95 uppercase tracking-widest'}
                        `}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : nextLabel}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default CreationLayout;

