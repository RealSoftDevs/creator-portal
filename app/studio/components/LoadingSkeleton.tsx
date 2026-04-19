'use client';

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="flex gap-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Profile Card Skeleton */}
        <div className="h-40 bg-gray-200 rounded-2xl mb-6 animate-pulse"></div>
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
        
        {/* Links Section Skeleton */}
        <div className="mb-8">
          <div className="flex justify-between mb-3">
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
        
        {/* Gallery Section Skeleton */}
        <div>
          <div className="flex justify-between mb-3">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-28 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}