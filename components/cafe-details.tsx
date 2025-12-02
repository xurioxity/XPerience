import type { CafeWithGames } from '@/lib/types';

interface CafeDetailsProps {
  cafe: CafeWithGames;
}

export function CafeDetails({ cafe }: CafeDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Hero Image */}
      {cafe.photo_url && (
        <div className="card relative overflow-hidden">
          <div className="aspect-video bg-gray-800 overflow-hidden">
            <img
              src={cafe.photo_url}
              alt={cafe.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div className="card p-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          {cafe.name}
        </h1>

        <div className="flex items-start text-gray-300 mb-4">
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
          <span>{cafe.address}</span>
        </div>

        {cafe.description && (
          <p className="text-gray-300 leading-relaxed">
            {cafe.description}
          </p>
        )}
      </div>

      {/* Hardware Specs */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Hardware Specifications
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-4 rounded-lg border border-purple-500/20">
            <svg
              className="w-6 h-6 mr-3 text-purple-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8M12 17v4" />
            </svg>
            <div>
              <div className="font-semibold text-white">PCs Available</div>
              <div className="text-gray-300">{cafe.num_pcs} Gaming PCs</div>
            </div>
          </div>

          <div className="flex items-start bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-4 rounded-lg border border-purple-500/20">
            <svg
              className="w-6 h-6 mr-3 text-pink-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <div>
              <div className="font-semibold text-white">Graphics Card</div>
              <div className="text-gray-300">{cafe.gpu_specs}</div>
            </div>
          </div>

          {cafe.cpu_specs && (
            <div className="flex items-start bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-4 rounded-lg border border-purple-500/20">
              <svg
                className="w-6 h-6 mr-3 text-purple-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <div>
                <div className="font-semibold text-white">Processor</div>
                <div className="text-gray-300">{cafe.cpu_specs}</div>
              </div>
            </div>
          )}

          {cafe.ram_specs && (
            <div className="flex items-start bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-4 rounded-lg border border-purple-500/20">
              <svg
                className="w-6 h-6 mr-3 text-pink-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <div>
                <div className="font-semibold text-white">Memory</div>
                <div className="text-gray-300">{cafe.ram_specs}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Available Games */}
      {cafe.games && cafe.games.length > 0 && (
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Available Games
            </span>
          </h2>

          <div className="flex flex-wrap gap-2">
            {cafe.games.map((game) => (
              <span
                key={game.id}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-900/40 to-pink-900/40 text-purple-200 rounded-full text-sm font-medium border border-purple-500/30 hover:border-purple-400/50 hover:from-purple-800/40 hover:to-pink-800/40 transition-all"
              >
                {game.game_name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

