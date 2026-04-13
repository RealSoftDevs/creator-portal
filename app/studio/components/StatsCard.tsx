'use client';

interface StatsCardProps {
  linksCount: number;
  productsCount: number;
  totalClicks: number;
  textColorStyle: React.CSSProperties;
  isPremium: boolean;
}

export default function StatsCard({ linksCount, productsCount, totalClicks, textColorStyle, isPremium }: StatsCardProps) {
  const linkLimit = isPremium ? 10 : 1;
  const productLimit = isPremium ? 50 : 3;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center shadow-sm">
        <div className="text-2xl font-bold" style={textColorStyle}>{linksCount}</div>
        <div className="text-xs opacity-70" style={textColorStyle}>
          Links ({linksCount}/{linkLimit})
        </div>
        {!isPremium && linksCount >= linkLimit && (
          <div className="text-[10px] text-yellow-500 mt-1">✨ Upgrade for more</div>
        )}
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center shadow-sm">
        <div className="text-2xl font-bold" style={textColorStyle}>{productsCount}</div>
        <div className="text-xs opacity-70" style={textColorStyle}>
          Products ({productsCount}/{productLimit})
        </div>
        {!isPremium && productsCount >= productLimit && (
          <div className="text-[10px] text-yellow-500 mt-1">✨ Upgrade for more</div>
        )}
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center shadow-sm">
        <div className="text-2xl font-bold" style={textColorStyle}>{totalClicks}</div>
        <div className="text-xs opacity-70" style={textColorStyle}>Clicks</div>
      </div>
    </div>
  );
}