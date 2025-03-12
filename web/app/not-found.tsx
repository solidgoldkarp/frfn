import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-6">
        404
      </h1>
      <h2 className="text-3xl text-white font-bold mb-4">
        Page Not Found
      </h2>
      <p className="text-gray-300 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/" 
        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-purple-700/20 hover:shadow-purple-600/30"
      >
        Return Home
      </Link>
    </div>
  );
}