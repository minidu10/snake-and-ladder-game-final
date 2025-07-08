interface PlayerInfoProps {
  playerNumber: 1 | 2;
  name: string;
  color: string;
  position: number;
  isCurrentPlayer: boolean;
  isWinner: boolean;
}

export default function PlayerInfo({
  playerNumber,
  name,
  color,
  position,
  isCurrentPlayer,
  isWinner
}: PlayerInfoProps) {
  return (
    <div className={`
      bg-white rounded-xl shadow-lg p-6 transition-all duration-300
      ${isCurrentPlayer ? "ring-4 ring-blue-400 ring-opacity-50 shadow-xl" : ""}
      ${isWinner ? "ring-4 ring-yellow-400 ring-opacity-50 bg-gradient-to-br from-yellow-50 to-orange-50" : ""}
    `}>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div
            className="w-16 h-16 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: color }}
          >
            {playerNumber}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-gray-800">{name}</h3>
            {isCurrentPlayer && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                Your Turn
              </span>
            )}
            {isWinner && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                🏆 Winner!
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Position:</span>
              <span className="font-bold text-lg text-gray-800">
                {position === 0 ? "Start" : position >= 100 ? "🏁 Finish!" : position}
              </span>
            </div>
            
            {position > 0 && position < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500 ease-out"
                  style={{
                    backgroundColor: color,
                    width: `${Math.min(position, 100)}%`
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
