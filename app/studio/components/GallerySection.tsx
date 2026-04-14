interface GallerySectionProps {
  products: Product[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  textColorStyle: React.CSSProperties;
  canAdd: boolean;
  addButtonTitle?: string;
}

export default function GallerySection({ products, onAdd, onDelete, textColorStyle, canAdd, addButtonTitle }: GallerySectionProps) {
  const realProductsCount = products.filter(p => !p.isDummy).length;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2" style={textColorStyle}>
          🖼️ Gallery
        </h2>
        <button
          onClick={onAdd}
          disabled={!canAdd}
          className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 ${
            !canAdd
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-black text-white'
          }`}
          title={addButtonTitle || (canAdd ? 'Add product' : 'Limit reached')}
        >
          <Plus className="w-4 h-4" /> Add Product ({realProductsCount}/4)
        </button>
      </div>
      {/* rest of the component */}
    </div>
  );
}