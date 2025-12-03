import Link from 'next/link';
import { mockCafes } from '@/lib/mock-data';
import type { Cafe } from '@/lib/types';

// Get cafes - use mock data directly (works on both local and Vercel)
function getCafes(): Cafe[] {
  return mockCafes;
}

export default function HomePage() {
  const cafes = getCafes();

  return (
    <div>
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Bangalore Gaming Cafés
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Find and book your perfect gaming session at top cafés across Bangalore
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-1 w-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
          <div className="h-1 w-1 bg-purple-400 rounded-full"></div>
          <div className="h-1 w-1 bg-pink-400 rounded-full"></div>
        </div>
      </div>

      {cafes.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-300">
            No cafés available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cafes.map((cafe) => (
            <Link
              key={cafe.id}
              href={`/cafe/${cafe.id}`}
              className="card hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 group"
            >
              {cafe.photo_url && (
                <div className="aspect-video bg-gray-800 overflow-hidden relative">
                  <img
                    src={cafe.photo_url}
                    alt={cafe.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                </div>
              )}
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">
                  {cafe.name}
                </h2>
                
                <p className="text-gray-400 mb-4 flex items-start">
                  <svg
                    className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {cafe.address}
                </p>

                {cafe.description && (
                  <p className="text-gray-400 mb-4 line-clamp-2">
                    {cafe.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center text-sm text-gray-300">
                    <svg
                      className="w-5 h-5 mr-1 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8M12 17v4" />
                    </svg>
                    {cafe.num_pcs} PCs
                  </div>
                  
                  <div className="text-sm font-medium text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text group-hover:from-purple-300 group-hover:to-pink-300">
                    View Details →
                  </div>
                </div>

                <div className="mt-3 flex items-center">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="ml-2 text-sm text-gray-400">{cafe.gpu_specs}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
