import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
export const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full aspect-video bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <ImageIcon className="w-8 h-8 opacity-50" />
        </div>
      )}
      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};