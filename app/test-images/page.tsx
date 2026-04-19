// app/test-images/page.tsx
'use client';

export default function TestImagesPage() {
  const images = [
    '/images/products/dummy1.jpg',
    '/images/products/dummy2.jpg',
    '/images/products/dummy3.jpg',
    '/images/products/dummy4.jpg'
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Product Images Test</h1>
      <div className="grid grid-cols-2 gap-4">
        {images.map((src, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow">
            <img
              src={src}
              alt={`Product ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg mb-2"
              onError={(e) => {
                console.error(`Failed to load: ${src}`);
                e.currentTarget.src = 'https://placehold.co/400x400?text=Image+Not+Found';
              }}
              onLoad={() => console.log(`Loaded: ${src}`)}
            />
            <p className="text-sm text-gray-600">{src}</p>
          </div>
        ))}
      </div>
    </div>
  );
}