'use client';

import React from 'react';
import { Eye } from 'lucide-react';

interface SampleMosaicProps {
  samples: string[];
  title: string;
  onSelectImage: (index: number) => void;
}

export const SampleMosaic: React.FC<SampleMosaicProps> = ({ samples, title, onSelectImage }) => {
  // Ensure we display 6 sample tiles (2 columns x 3 rows)
  const displaySamples = samples.length >= 6 
    ? samples.slice(0, 6) 
    : [...samples, ...samples, ...samples].slice(0, 6);

  return (
    <div className="group/mosaic relative grid grid-cols-2 gap-1.5 rounded-2xl p-1 bg-neutral-100 dark:bg-neutral-800/60 overflow-hidden cursor-pointer"
         onClick={() => onSelectImage(0)}>
      {displaySamples.map((imgUrl, idx) => (
        <div
          key={idx}
          onClick={(e) => {
            e.stopPropagation();
            onSelectImage(idx);
          }}
          className="relative h-20 sm:h-24 w-full overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-700 transition-all hover:opacity-90 group/tile"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgUrl}
            alt={`${title} sample ${idx + 1}`}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover/tile:scale-110"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover/tile:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/tile:opacity-100">
            <Eye className="h-4 w-4 text-white drop-shadow-md" />
          </div>
        </div>
      ))}

      {/* Floating badge for opening full gallery */}
      <div className="absolute bottom-2 right-2 rounded-full bg-neutral-900/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 group-hover/mosaic:opacity-100 transition-opacity">
        Ver 6 muestras
      </div>
    </div>
  );
};
