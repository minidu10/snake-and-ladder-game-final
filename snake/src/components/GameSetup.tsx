import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

const PLAYER_COLORS = [
  { name: "Red", value: "#EF4444", bg: "bg-red-500" },
  { name: "Blue", value: "#3B82F6", bg: "bg-blue-500" },
  { name: "Green", value: "#10B981", bg: "bg-green-500" },
  { name: "Purple", value: "#8B5CF6", bg: "bg-purple-500" },
  { name: "Orange", value: "#F97316", bg: "bg-orange-500" }
];

interface GameSetupProps {
  onGameCreated: (gameId: Id<"games">) => void;
}

export default function GameSetup({ onGameCreated }: GameSetupProps) {
  const [player1Name, setPlayer1Name] = useState("");
  const [player1Color, setPlayer1Color] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [player2Color, setPlayer2Color] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createGame = useMutation(api.games.createGame);

  const handleCreateGame = async () => {
    if (!player1Name.trim() || !player2Name.trim()) {
      toast.error("Please enter names for both players");
      return;
    }

    if (!player1Color || !player2Color) {
      toast.error("Please select colors for both players");
      return;
    }

    if (player1Color === player2Color) {
      toast.error("Players must have different colors");
      return;
    }

    setIsCreating(true);
    try {
      const gameId = await createGame({
        player1Name: player1Name.trim(),
        player1Color,
        player2Name: player2Name.trim(),
        player2Color
      });
      
      toast.success("Game created successfully!");
      onGameCreated(gameId);
    } catch (error) {
      toast.error("Failed to create game");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const availableColorsForPlayer2 = PLAYER_COLORS.filter(
    color => color.value !== player1Color
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            🎮 Game Setup
          </h2>
          <p className="text-gray-600">
            Configure players and start your Snake & Ladder adventure!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Player 1 Setup */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              Player 1
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Enter player 1 name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PLAYER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setPlayer1Color(color.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      player1Color === color.value
                        ? "border-gray-800 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-6 h-6 ${color.bg} rounded-full mx-auto mb-1`}></div>
                    <span className="text-xs font-medium">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Player 2 Setup */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              Player 2
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Enter player 2 name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="grid grid-cols-3 gap-2">
                {availableColorsForPlayer2.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setPlayer2Color(color.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      player2Color === color.value
                        ? "border-gray-800 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-6 h-6 ${color.bg} rounded-full mx-auto mb-1`}></div>
                    <span className="text-xs font-medium">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleCreateGame}
            disabled={isCreating || !player1Name.trim() || !player2Name.trim() || !player1Color || !player2Color || player1Color === player2Color}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Game...
              </span>
            ) : (
              "🚀 Create Game"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
