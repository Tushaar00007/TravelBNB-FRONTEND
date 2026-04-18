import React from 'react';
import { motion } from 'framer-motion';
import { Users, Wifi, CreditCard, Calendar } from 'lucide-react';

const BENEFITS = [
    {
        title: "Live with Tribe",
        desc: "Live with like-minded creators and digital nomads from across the globe.",
        icon: <Users size={28} />,
        color: "bg-orange-500"
    },
    {
        title: "Work + Travel",
        desc: "Perfectly balanced spaces with fast WiFi and dedicated co-working zones.",
        icon: <Wifi size={28} />,
        color: "bg-blue-500"
    },
    {
        title: "Affordable Stays",
        desc: "High-quality living at prices that won't break the bank. Save for the journey.",
        icon: <CreditCard size={28} />,
        color: "bg-green-500"
    },
    {
        title: "Events & Networking",
        desc: "Weekly community dinners, networking events, and local workshops.",
        icon: <Calendar size={28} />,
        color: "bg-purple-500"
    }
];

function ExperienceBenefits() {
    return (
        <section className="py-32 bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                        The <span className="text-orange-500 italic">Crashpad</span> Advantage
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {BENEFITS.map((benefit, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-orange-500/20 transition-all duration-500 group"
                        >
                            <div className={`${benefit.color} text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                                {benefit.icon}
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">{benefit.title}</h3>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-wider opacity-80">
                                {benefit.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default ExperienceBenefits;
