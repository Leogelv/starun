'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { hapticFeedback } from "@telegram-apps/sdk-react";
import { motion, AnimatePresence } from 'framer-motion';

export const BottomMenu = () => {
    const pathname = usePathname();
    
    const menu = [
        {
            link: '/',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17.0002L2 22L7 20.662C8.46997 21.513 10.1786 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="8" cy="12" r="1" fill="currentColor"/>
                    <circle cx="12" cy="12" r="1" fill="currentColor"/>
                    <circle cx="16" cy="12" r="1" fill="currentColor"/>
                </svg>
            ),
            text: 'Чат'
        },
        {
            link: '/catalog',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                </svg>
            ),
            text: 'Материалы'
        },
        {
            link: '/profile',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 14H8C5.79086 14 4 15.7909 4 18V20H20V18C20 15.7909 18.2091 14 16 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ),
            text: 'Профиль'
        }
    ]

    return (
        <div className={'fixed bottom-0 left-0 right-0 z-50'}>
            {/* Glass morphism background */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            
            <div className='relative glass-dark'>
                {/* Animated glow line */}
                <motion.div 
                    className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent"
                    animate={{
                        x: ['-100%', '100%'],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                
                <div className='grid grid-cols-3 relative items-center'>
                    {menu.map((item, index) => {
                        const isActive = pathname === item.link;
                        
                        return (
                            <Link 
                                onClick={() => hapticFeedback.impactOccurred('light')} 
                                key={item.link} 
                                href={item.link}
                                className={`relative flex flex-col items-center justify-center group ${
                                    index === 0 ? 'py-2' : 'py-3'
                                }`}
                            >
                                {/* Active background */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 flex items-center justify-center"
                                            initial={false}
                                            transition={{
                                                type: "spring",
                                                stiffness: 350,
                                                damping: 30,
                                            }}
                                        >
                                            <div className={`${index === 0 ? 'w-16 h-16' : 'w-14 h-14'} bg-purple-500/20 rounded-2xl blur-xl`} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                
                                {/* Icon wrapper */}
                                <motion.div
                                    className="relative mb-1"
                                    animate={{
                                        scale: isActive ? (index === 0 ? 1.2 : 1.1) : (index === 0 ? 1.15 : 1),
                                        y: isActive ? -2 : 0,
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 17
                                    }}
                                >
                                    {/* Icon container */}
                                    <div className={`relative transition-colors duration-300 ${
                                        isActive ? 'text-purple-300' : 'text-purple-200/40 group-hover:text-purple-200/60'
                                    } ${index === 0 ? 'transform scale-125' : ''}`}>
                                        {item.icon}
                                        
                                        {/* Active glow */}
                                        {isActive && (
                                            <motion.div
                                                className="absolute inset-0 -z-10"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1.2 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                            >
                                                <div className="w-full h-full bg-purple-400/40 blur-md rounded-full" />
                                            </motion.div>
                                        )}
                                    </div>
                                    
                                    {/* Active dot indicator */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 500,
                                                    damping: 25
                                                }}
                                            >
                                                <div className="w-1 h-1 bg-purple-400 rounded-full" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                                
                                {/* Text label */}
                                <motion.p 
                                    className={`text-[10px] font-medium tracking-wider uppercase transition-all duration-300 ${
                                        isActive ? 'text-purple-200' : 'text-purple-200/30 group-hover:text-purple-200/50'
                                    }`}
                                    animate={{
                                        opacity: isActive ? 1 : 0.5,
                                    }}
                                >
                                    {item.text}
                                </motion.p>
                                
                                {/* Ripple effect on tap */}
                                <motion.div
                                    className="absolute inset-0 rounded-2xl"
                                    initial={{ opacity: 0 }}
                                    whileTap={{ 
                                        opacity: [0, 0.1, 0],
                                        scale: [0.8, 1.2, 1.2],
                                    }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <div className="w-full h-full bg-white rounded-2xl" />
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
                
                {/* Safe area padding */}
                <div className="safe-area-bottom" />
            </div>
        </div>
    )
}