// app/components/dashboard/StatsCards.tsx - Updated to accept flexible type
'use client';

import { Link2, Package, MousePointer, Eye } from 'lucide-react';

interface StatsCardsProps {
  linksCount: number;
  productsCount: number;
  totalClicks: number;
  averageClicksPerLink?: number;
  mostClickedLink?: { title: string; clicks: number } | null | any;
  onAddLink?: () => void;
  onAddProduct?: () => void;
}

export default function StatsCards({
  linksCount,
  productsCount,
  totalClicks,
  averageClicksPerLink = 0,
  mostClickedLink,
  onAddLink,
  onAddProduct
}: StatsCardsProps) {
  // Safely extract data even if clicks is undefined
  const safeMostClicked = mostClickedLink ? {
    title: mostClickedLink.title,
    clicks: mostClickedLink.clicks || 0
  } : null;

  return (
    <>
      <div className="flex justify-between gap-2 sm:gap-4 mb-6 sm:mb-8">
        {/* Total Links Card - Clickable */}
        <button
          onClick={onAddLink}
          className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-5 border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-left group"
        >
          <div className="flex items-center justify-between mb-1 sm:mb-3">
            <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg bg-purple-500/30 flex items-center justify-center group-hover:bg-purple-500/50 transition">
              <Link2 className="w-3 h-3 sm:w-5 sm:h-5 text-purple-300" />
            </div>
            <span className="text-base sm:text-2xl font-bold text-white">{linksCount}</span>
          </div>
          <p className="text-[10px] sm:text-sm text-white/70">Total Links</p>
          <p className="text-[10px] text-purple-300 mt-1 opacity-0 group-hover:opacity-100 transition">+ Add link →</p>
        </button>

        {/* Total Products Card - Clickable */}
        <button
          onClick={onAddProduct}
          className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-5 border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-left group"
        >
          <div className="flex items-center justify-between mb-1 sm:mb-3">
            <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg bg-blue-500/30 flex items-center justify-center group-hover:bg-blue-500/50 transition">
              <Package className="w-3 h-3 sm:w-5 sm:h-5 text-blue-300" />
            </div>
            <span className="text-base sm:text-2xl font-bold text-white">{productsCount}</span>
          </div>
          <p className="text-[10px] sm:text-sm text-white/70">Total Products</p>
          <p className="text-[10px] text-blue-300 mt-1 opacity-0 group-hover:opacity-100 transition">+ Add product →</p>
        </button>

        {/* Total Clicks Card */}
        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-5 border border-white/20">
          <div className="flex items-center justify-between mb-1 sm:mb-3">
            <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg bg-green-500/30 flex items-center justify-center">
              <MousePointer className="w-3 h-3 sm:w-5 sm:h-5 text-green-300" />
            </div>
            <span className="text-base sm:text-2xl font-bold text-white">{totalClicks}</span>
          </div>
          <p className="text-[10px] sm:text-sm text-white/70">Total Clicks</p>
          {linksCount > 0 && (
            <p className="text-[9px] text-green-400 mt-1">
              Avg {averageClicksPerLink} per link
            </p>
          )}
        </div>
      </div>

      {/* Most Clicked Link Insight - Only show if there's a most clicked link */}
      {safeMostClicked && safeMostClicked.clicks > 0 && (
        <div className="bg-yellow-500/20 backdrop-blur-md rounded-xl p-3 sm:p-4 mb-6 border border-yellow-500/30">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-yellow-400" />
            <p className="text-xs sm:text-sm text-white/90">
              🔥 Most popular: <span className="font-semibold text-yellow-300">{safeMostClicked.title}</span> with {safeMostClicked.clicks} clicks
            </p>
          </div>
        </div>
      )}
    </>
  );
}