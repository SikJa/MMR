// CardCarousel.tsx
'use client';

import { motion } from 'framer-motion';

const cards = [
  'https://images.unsplash.com/photo-1603415526960-f9e418e384a3',
  'https://images.unsplash.com/photo-1610878180933-3e3c6604f4db',
  'https://images.unsplash.com/photo-1581093588401-9438c77e7e9b',
  'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d',
];

export default function CardCarousel() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#121212] py-16 px-6 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-4xl font-bold mb-12">Card Carousel</h2>
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex space-x-6">
            {cards.map((src, i) => (
              <motion.div
                key={i}
                className="min-w-[240px] h-[360px] rounded-[2rem] bg-white shadow-2xl overflow-hidden flex-shrink-0"
                whileHover={{ scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <img
                  src={src}
                  alt={`card-${i}`}
                  width={240}
                  height={360}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
