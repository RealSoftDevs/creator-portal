// app/studio/components/LinksSection.tsx
'use client';

import { Plus, Trash2, Link2, ExternalLink } from 'lucide-react';
import { Link } from '@/lib/types';

interface LinksSectionProps {
  links: Link[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  textColorStyle: React.CSSProperties;
  isAddDisabled?: boolean;
  limit?: number;
}

export default function LinksSection({
  links,
  onAdd,
  onDelete,
  textColorStyle,
  isAddDisabled = false,
  limit = 10
}: LinksSectionProps) {
  const remainingSlots = limit - links.length;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2" style={textColorStyle}>
          🔗 Links
          <span className="text-xs opacity-60">({links.length}/{limit})</span>
        </h2>
        <button
          onClick={onAdd}
          disabled={isAddDisabled || remainingSlots === 0}
          className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 transition ${
            isAddDisabled || remainingSlots === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
          title={remainingSlots === 0 ? `Maximum ${limit} links reached` : 'Add new link'}
        >
          <Plus className="w-4 h-4" /> Add link
        </button>
      </div>

      {links.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
          <Link2 className="w-12 h-12 mx-auto mb-2 opacity-50" style={textColorStyle} />
          <p className="opacity-70" style={textColorStyle}>No links yet</p>
          <button
            onClick={onAdd}
            className="mt-3 text-black underline text-sm hover:no-underline"
          >
            Add your first link
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link, index) => (
            <div
              key={link.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-sm flex items-center gap-3 hover:bg-white/20 transition group"
            >
              {link.imageUrl && (
                <img
                  src={link.imageUrl}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate" style={textColorStyle}>
                    {link.title}
                  </h3>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-50 hover:opacity-100 transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs opacity-60 truncate" style={textColorStyle}>
                  {link.url}
                </p>
                {link.clicks > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    📊 {link.clicks} click{link.clicks !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <button
                onClick={() => onDelete(link.id)}
                className="p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}