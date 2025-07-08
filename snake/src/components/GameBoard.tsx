import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import GameGrid from "./GameGrid";
import PlayerInfo from "./PlayerInfo";
import GameTimer from "./GameTimer";
import GameOverModal from "./GameOverModal";
import SnakeLadderOverlay from "./SnakeLadderOverlay";

interface GameBoardProps {
  gameId: Id<"games">;
  onBackToSetup: () => void;
}

export default function GameBoard({ gameId, onBackToSetup }: GameBoardProps) {
  const game = useQuery(api.games.getCurrentGame, { gameId });
  const startGame = useMutation(api.games.startGame);
  const [showOverlay, setShowOverlay] = useState<{
    type: "snake" | "ladder";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (game?.lastMoveType === "snake") {
      setShowOverlay({
        type: "snake",
        message: "🐍 Oh no! You hit a snake!"
      });
      setTimeout(() => setShowOverlay(null), 3000);
    } else if (game?.lastMoveType === "ladder") {
      setShowOverlay({
        type: "ladder",
        message: "🪜 Great! You found a ladder!"
      });
      setTimeout(() => setShowOverlay(null), 3000);
    }
  }, [game?.lastMoveType]);

  const handleStartGame = async () => {
    try {
      await startGame({ gameId });
      toast.success("Game started! 🎮");
    } catch (error) {
      toast.error("Failed to start game");
      console.error(error);
    }
  };

  if (!game) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🎮 Snake & Ladder Game
            </h2>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                game.gameStatus === "setup" ? "bg-yellow-100 text-yellow-800" :
                game.gameStatus === "playing" ? "bg-green-100 text-green-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {game.gameStatus === "setup" ? "⏳ Setup" :
                 game.gameStatus === "playing" ? "🎯 Playing" :
                 "🏆 Finished"}
              </span>
              {game.gameStatus === "playing" && game.startTime && (
                <GameTimer startTime={game.startTime} />
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {game.gameStatus === "setup" && (
              <button
                onClick={handleStartGame}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                🚀 Start Game
              </button>
            )}
            <button
              onClick={onBackToSetup}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              ← Back to Setup
            </button>
          </div>
        </div>
      </div>

      {/* Player Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <PlayerInfo
          playerNumber={1}
          name={game.player1Name}
          color={game.player1Color}
          position={game.player1Position}
          isCurrentPlayer={game.currentPlayer === 1 && game.gameStatus === "playing"}
          isWinner={game.winner === 1}
        />
        <PlayerInfo
          playerNumber={2}
          name={game.player2Name}
          color={game.player2Color}
          position={game.player2Position}
          isCurrentPlayer={game.currentPlayer === 2 && game.gameStatus === "playing"}
          isWinner={game.winner === 2}
        />
      </div>

      {/* Dice Roll Display */}
      {game.gameStatus === "playing" && game.lastDiceRoll && (
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-6xl mb-2">🎲</div>
          <div className="text-2xl font-bold text-gray-800">
            Last Roll: {game.lastDiceRoll}
          </div>
          <div className="text-gray-600">
            {game.currentPlayer === 1 ? game.player1Name : game.player2Name}'s turn
          </div>
        </div>
      )}

      {/* Game Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <GameGrid
          player1Position={game.player1Position}
          player1Color={game.player1Color}
          player2Position={game.player2Position}
          player2Color={game.player2Color}
          snakesAndLadders={game.snakesAndLadders}
        />
      </div>

      {/* Microcontroller Integration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          🔌 Microcontroller Integration
        </h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Game ID:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{gameId}</code></p>
          <p><strong>API Endpoint:</strong> <code className="bg-blue-100 px-2 py-1 rounded">/game/update</code></p>
          <p><strong>Status:</strong> Ready for ESP32/Arduino communication</p>
        </div>
      </div>

      {/* Overlays */}
      {showOverlay && (
        <SnakeLadderOverlay
          type={showOverlay.type}
          message={showOverlay.message}
          onClose={() => setShowOverlay(null)}
        />
      )}

      {game.gameStatus === "finished" && game.winner && (
        <GameOverModal
          winner={game.winner}
          player1Name={game.player1Name}
          player2Name={game.player2Name}
          duration={game.duration || 0}
          onNewGame={onBackToSetup}
        />
      )}
    </div>
  );
}
