import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Your Creator Portal
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Linktree alternative with powerful features for creators
          </p>
          <div className="space-x-4">
            <Link 
              href="/register"
              className="inline-block bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100"
            >
              Get Started Free
            </Link>
            <Link 
              href="/login"
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}