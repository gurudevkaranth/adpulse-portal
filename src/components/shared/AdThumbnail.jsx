import { Play, Image as ImageIcon } from 'lucide-react';

export default function AdThumbnail({ ad, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-16 h-16 rounded-lg',
    md: 'w-full aspect-[4/5] rounded-xl',
    lg: 'w-full aspect-[9/16] rounded-xl',
  };

  return (
    <div
      className={`${sizeClasses[size]} relative overflow-hidden group cursor-pointer`}
      style={{ background: ad.thumbnail }}
    >
      {/* Format badge */}
      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-md text-[10px] font-medium text-white">
        {ad.format}
      </div>

      {/* Platform badge */}
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-md text-[10px] font-medium text-white">
        {ad.platform}
      </div>

      {/* Play button for video */}
      {ad.isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 text-gray-800 ml-0.5" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
    </div>
  );
}
