import React from 'react';
import { motion } from 'framer-motion';
import nomad1 from '../../../assets/images/community/nomad1.jpg';
import nomad2 from '../../../assets/images/community/nomad2.jpg';
import nomad3 from '../../../assets/images/community/nomad3.jpg';
import nomad4 from '../../../assets/images/community/nomad4.jpg';
import nomad5 from '../../../assets/images/community/nomad5.jpg';
import nomad6 from '../../../assets/images/community/nomad6.jpg';

const AVATARS = [
    { src: nomad1, className: "top-10 left-[10%] w-20 h-20", delay: 0 },
    { src: nomad2, className: "top-40 left-[5%] w-16 h-16", delay: 1.5 },
    { src: nomad3, className: "bottom-20 left-[15%] w-24 h-24", delay: 0.8 },
    { src: nomad4, className: "top-20 right-[15%] w-20 h-20", delay: 1.2 },
    { src: nomad5, className: "bottom-40 right-[10%] w-16 h-16", delay: 0.5 },
    { src: nomad6, className: "top-60 right-[5%] w-24 h-24", delay: 2 },
];

function AvatarCluster() {
    return (
        <div className="absolute inset-0 pointer-events-none hidden lg:block overflow-hidden">
            {AVATARS.map((avatar, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                        opacity: 1, 
                        scale: 1,
                        y: [0, -20, 0] 
                    }}
                    transition={{ 
                        opacity: { duration: 1, delay: i * 0.2 },
                        scale: { duration: 1, delay: i * 0.2 },
                        y: { 
                            duration: 4, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: avatar.delay 
                        }
                    }}
                    className={`absolute rounded-full border-4 border-white/50 dark:border-gray-800/50 shadow-2xl overflow-hidden z-10 backdrop-blur-sm ${avatar.className}`}
                >
                    <img src={avatar.src} alt="Traveler" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                </motion.div>
            ))}
        </div>
    );
}

export default AvatarCluster;
