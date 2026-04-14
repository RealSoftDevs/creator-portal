'use client';

import { Plus, Trash2, Link2 } from 'lucide-react';
import { Link } from '@/lib/types';

interface LinksSectionProps {
  links: Link[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  textColorStyle: React.CSSProperties;
  isAddDisabled?: boolean;
}

export default function LinksSection({ links, onAdd, onDelete, textColorStyle, isAddDisabled = false }: LinksSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2" style={textColorStyle}>
          🔗 Links
        </h2>
        <button
          onClick={onAdd}
          disabled={isAddDisabled}
          className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 ${
            isAddDisabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-black text-white'
          }`}
          title={isAddDisabled ? 'Upgrade to add more links' : ''}
        >
          <Plus className="w-4 h-4" /> Add link
        </button>
      </div>

      {links.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
          <Link2 className="w-12 h-12 mx-auto mb-2 opacity-50" style={textColorStyle} />
          <p className="opacity-70" style={textColorStyle}>No links yet</p>
          <button onClick={onAdd} className="mt-3 text-black underline text-sm">
            Add your first link
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div key={link.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-sm flex items-center gap-3">
              {link.imageUrl && (
                <img src={link.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate" style={textColorStyle}>{link.title}</h3>
                <p className="text-xs opacity-60 truncate" style={textColorStyle}>{link.url}</p>
                {link.clicks > 0 && (
                  <p className="text-xs text-green-600 mt-1">{link.clicks} clicks</p>
                )}
              </div>
              <button
                onClick={() => onDelete(link.id)}
                className="p-2 rounded-full hover:bg-red-500/20 transition"
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