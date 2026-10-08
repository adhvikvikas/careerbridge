import React from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

export default function HeroIllustration() {
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  
  // Subtle parallax based on scroll (disabled if reduced motion)
  const yBg = useTransform(scrollY, [0, 800], [0, shouldReduceMotion ? 0 : 30]);
  const yMid = useTransform(scrollY, [0, 800], [0, shouldReduceMotion ? 0 : 60]);
  const yMain = useTransform(scrollY, [0, 800], [0, shouldReduceMotion ? 0 : 90]);
  const yFg = useTransform(scrollY, [0, 800], [0, shouldReduceMotion ? 0 : -20]);

  // Ambient animations
  const pulseAnim = shouldReduceMotion ? {} : {
    scale: [1, 1.03, 1],
    opacity: [0.3, 0.4, 0.3],
    transition: { duration: 12, repeat: Infinity, ease: "easeInOut" }
  };

  const bird1Anim = shouldReduceMotion ? {} : {
    y: [0, -8, 0],
    x: [0, -15, 0],
    transition: { duration: 14, repeat: Infinity, ease: "easeInOut" }
  };

  const bird2Anim = shouldReduceMotion ? {} : {
    y: [0, -12, 0],
    x: [0, -25, 0],
    transition: { duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }
  };

  const mistAnim = shouldReduceMotion ? {} : {
    opacity: [0.1, 0.2, 0.1],
    transition: { duration: 15, repeat: Infinity, ease: "easeInOut" }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#F7F5F0]">
      {/* BACKGROUND: Soft Ivory Atmospheric Sky & Subtle Glow */}
      <motion.div style={{ y: yBg }} className="absolute inset-0">
        {/* Base gradient ensuring left side remains very clean for text */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7F5F0] via-[#F7F5F0] to-[#E5E1DA] opacity-90" />
        
        {/* Warm glow behind the right scene */}
        <motion.div 
          animate={pulseAnim}
          className="absolute top-[10%] right-[5%] lg:right-[15%] w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-[#B76E4C] rounded-full blur-[120px] opacity-[0.15]"
        />
        <motion.div 
          animate={pulseAnim}
          className="absolute top-[40%] right-[30%] w-[400px] h-[400px] bg-[#263B4A] rounded-full blur-[150px] opacity-[0.05]"
        />
      </motion.div>

      {/* MIDDLE BACKGROUND: Subtle Environment Architecture (University -> Professional) */}
      <motion.div style={{ y: yMid }} className="absolute inset-0">
        <svg width="100%" height="100%" preserveAspectRatio="xMidYMax slice" viewBox="0 0 1440 800" className="absolute bottom-0">
          
          {/* Layer 1: Very distant background landscape & soft trees */}
          <g opacity="0.05">
            <path d="M 300 800 C 500 650, 800 700, 1100 650 C 1300 600, 1440 700, 1440 800 Z" fill="#263B4A" />
            <circle cx="350" cy="650" r="50" fill="#263B4A" />
            <circle cx="750" cy="620" r="40" fill="#263B4A" />
            <circle cx="950" cy="600" r="60" fill="#263B4A" />
          </g>

          {/* Layer 2: University / Academic Architecture (Left side - The Origin) */}
          <g opacity="0.08">
            <path d="M 350 800 L 350 580 L 450 580 L 450 800 Z" fill="#263B4A" />
            <path d="M 380 580 L 400 520 L 420 580 Z" fill="#263B4A" /> {/* Academic spire */}
            <path d="M 480 800 L 480 640 L 580 640 L 580 800 Z" fill="#263B4A" />
            <path d="M 520 640 C 520 620, 540 620, 540 640 Z" fill="#F7F5F0" opacity="0.2" /> {/* subtle dome detail */}
          </g>

          {/* Layer 3: Modern Professional Buildings (Right side - The Destination) */}
          <g opacity="0.12">
            <path d="M 1150 800 L 1150 380 L 1230 380 L 1230 800 Z" fill="#263B4A" />
            <path d="M 1250 800 L 1250 280 L 1320 280 L 1320 800 Z" fill="#263B4A" />
            <path d="M 1340 800 L 1340 420 L 1400 420 L 1400 800 Z" fill="#263B4A" />
            {/* Subtle vertical cuts for modern office aesthetic */}
            <path d="M 1180 380 L 1180 800" stroke="#F7F5F0" strokeWidth="2" opacity="0.1" />
            <path d="M 1285 280 L 1285 800" stroke="#F7F5F0" strokeWidth="2" opacity="0.1" />
          </g>

        </svg>
      </motion.div>

      {/* ATMOSPHERIC MIST / HAZE */}
      <motion.div style={{ y: yMid }} animate={mistAnim} className="absolute inset-0 top-[50%] bg-gradient-to-t from-[#F7F5F0] to-transparent opacity-20 blur-[20px]" />

      {/* MAIN VISUAL: The Elegant Bridge / Pathway */}
      <motion.div style={{ y: yMain }} className="absolute inset-0">
        <svg width="100%" height="100%" preserveAspectRatio="xMidYMax slice" viewBox="0 0 1440 800" className="absolute bottom-0">
          {/* 
            The bridge arcs from the middle-left (where education starts conceptually) 
            towards the right distance (career). 
          */}
          {/* Main Navy Bridge - Reduced thickness for elegance */}
          <path d="M 400 900 C 600 750, 900 450, 1400 450" fill="none" stroke="#263B4A" strokeWidth="13" strokeLinecap="round" opacity="0.9" />
          
          {/* Terracotta accent line - Slightly more visible */}
          <path d="M 400 915 C 600 765, 900 465, 1400 465" fill="none" stroke="#B76E4C" strokeWidth="5" strokeLinecap="round" opacity="0.95" />
          
          {/* Elegant architectural supports */}
          <path d="M 650 690 L 650 900" stroke="#263B4A" strokeWidth="3.5" opacity="0.3" />
          <path d="M 850 560 L 850 900" stroke="#263B4A" strokeWidth="2.5" opacity="0.25" />
          <path d="M 1050 480 L 1050 900" stroke="#263B4A" strokeWidth="2" opacity="0.2" />
          <path d="M 1250 455 L 1250 900" stroke="#263B4A" strokeWidth="1.5" opacity="0.15" />

          {/* Tiny human silhouettes moving along the pathway */}
          {/* Person 1 (Navy) */}
          <circle cx="820" cy="580" r="4.5" fill="#263B4A" opacity="0.85" />
          <path d="M 820 585 L 820 600 L 815 615 M 820 600 L 825 615" stroke="#263B4A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85" />
          
          {/* Person 2 (Terracotta) slightly behind */}
          <circle cx="790" cy="610" r="4" fill="#B76E4C" opacity="0.9" />
          <path d="M 790 614 L 790 627 L 786 640 M 790 627 L 794 640" stroke="#B76E4C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9" />
        </svg>
      </motion.div>

      {/* FOREGROUND: Soft Layered Landscape Shapes */}
      <motion.div style={{ y: yFg }} className="absolute inset-0">
        <svg width="100%" height="100%" preserveAspectRatio="xMidYMax slice" viewBox="0 0 1440 800" className="absolute bottom-0">
          <path d="M -100 850 L -100 750 C 200 680, 500 800, 900 850 Z" fill="#E5E1DA" opacity="0.8" />
          <path d="M 800 850 C 1000 780, 1200 720, 1500 750 L 1500 850 Z" fill="#F7F5F0" opacity="0.9" />
          <path d="M 1100 850 C 1200 800, 1350 780, 1500 800 L 1500 850 Z" fill="#B76E4C" opacity="0.05" />
        </svg>
      </motion.div>

      {/* DECORATIVE DETAILS: Distant Birds */}
      <motion.div className="absolute top-[25%] right-[20%] lg:right-[30%]" animate={bird1Anim}>
        <svg width="30" height="15" viewBox="0 0 40 20" fill="none" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
          <path d="M 0 10 Q 10 0, 20 10 Q 30 0, 40 10" />
        </svg>
      </motion.div>
      <motion.div className="absolute top-[32%] right-[15%] lg:right-[22%]" animate={bird2Anim}>
        <svg width="24" height="12" viewBox="0 0 40 20" fill="none" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
          <path d="M 0 10 Q 10 0, 20 10 Q 30 0, 40 10" />
        </svg>
      </motion.div>
    </div>
  );
}
