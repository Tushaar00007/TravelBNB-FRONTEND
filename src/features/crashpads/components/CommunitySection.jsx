import React from 'react';
import { motion } from 'framer-motion';
import { Quote, MapPin, Star } from 'lucide-react';
import nomad1 from '../../../assets/images/community/nomad1.jpg';
import nomad2 from '../../../assets/images/community/nomad2.jpg';
import nomad3 from '../../../assets/images/community/nomad3.jpg';

const TESTIMONIALS = [
    {
        name: "Alex Rivers",
        location: "Berlin -> Goa",
        quote: "Found my productivity and my tribe in a Goa beach hut. The community dinners are life-changing.",
        image: nomad1,
        rating: 5
    },
    {
        name: "Sarah Chen",
        location: "Singapore -> Manali",
        quote: "Fastest WiFi I've had in the Himalayas. The co-working space vibe is infectious.",
        image: nomad2,
        rating: 5
    },
    {
        name: "Marcus Thorne",
        location: "London -> Rishikesh",
        quote: "Affordable, clean, and full of like-minded creators. I planned a 1-week stay and stayed for 3 months.",
        image: nomad3,
        rating: 5
    }
];

function CommunitySection() {
    return (
        <section className="py-32 bg-gray-50/50 dark:bg-gray-900/50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest mb-4 inline-block"
                        >
                            Social Proof
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter"
                        >
                            MEET YOUR <span className="text-orange-500">TRIBE</span>
                        </motion.h2>
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-gray-500 dark:text-gray-400 font-bold max-w-sm"
                    >
                        Join thousands of nomads who have already found their creative home in our crashpads.
                    </motion.p>
                </div>

                {/* Horizontal Scroll Testimonials */}
                <div className="flex flex-nowrap overflow-x-auto gap-8 pb-12 snap-x no-scrollbar">
                    {TESTIMONIALS.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex-shrink-0 w-[400px] snap-center bg-white dark:bg-gray-950 p-10 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 relative group hover:shadow-2xl transition-all duration-500"
                        >
                            <Quote size={80} className="absolute top-8 right-8 text-gray-50 dark:text-gray-900 group-hover:text-orange-500/5 transition-colors -z-0" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-orange-500/20">
                                        <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="text-gray-900 dark:text-white font-black text-xl">{t.name}</h4>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                            <MapPin size={12} className="text-orange-500" /> {t.location}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex mb-6">
                                    {[...Array(t.rating)].map((_, idx) => (
                                        <Star key={idx} size={16} className="fill-orange-500 text-orange-500" />
                                    ))}
                                </div>

                                <p className="text-gray-600 dark:text-gray-300 text-lg font-bold italic leading-relaxed">
                                    "{t.quote}"
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CommunitySection;
