import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function GameHistory() {
  const history = useQuery(api.games.getGameHistory);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (history === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Games Yet
          </h2>
          <p className="text-gray-600">
            Start playing to see your match history here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📊</span>
          <h2 className="text-2xl font-bold text-gray-800">Match History</h2>
          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
            {history.length} games
          </span>
        </div>

        <div className="space-y-4">
          {history.map((match, index) => {
            const winnerName = match.winner === 1 ? match.player1Name : match.player2Name;
            const winnerColor = match.winner === 1 ? match.player1Color : match.player2Color;
            const loserName = match.winner === 1 ? match.player2Name : match.player1Name;
            const loserColor = match.winner === 1 ? match.player2Color : match.player1Color;

            return (
              <div
                key={match._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: winnerColor }}
                        />
                        <span className="font-semibold text-gray-800">{winnerName}</span>
                        <span className="text-gray-500">defeated</span>
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: loserColor }}
                        />
                        <span className="font-medium text-gray-600">{loserName}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(match.completedAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-gray-600">Duration: </span>
                      <span className="font-medium">{formatDuration(match.duration)}</span>
                    </div>
                    <div className="text-gray-400">
                      #{history.length - index}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
