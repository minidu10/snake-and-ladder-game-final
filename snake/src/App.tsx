import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import GameSetup from "./components/GameSetup";
import GameBoard from "./components/GameBoard";
import GameHistory from "./components/GameHistory";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const [currentView, setCurrentView] = useState<"setup" | "game" | "history">("setup");
  const [currentGameId, setCurrentGameId] = useState<Id<"games"> | null>(null);

  const handleGameCreated = (gameId: Id<"games">) => {
    setCurrentGameId(gameId);
    setCurrentView("game");
  };

  const handleBackToSetup = () => {
    setCurrentGameId(null);
    setCurrentView("setup");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-blue-600">🐍 Snake & Ladder</h2>
          <nav className="flex gap-2">
            <button
              onClick={() => setCurrentView("setup")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentView === "setup" 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              New Game
            </button>
            <button
              onClick={() => setCurrentView("history")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentView === "history" 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              History
            </button>
          </nav>
        </div>
        <SignOutButton />
      </header>
      
      <main className="flex-1 p-4">
        <Content 
          currentView={currentView}
          currentGameId={currentGameId}
          onGameCreated={handleGameCreated}
          onBackToSetup={handleBackToSetup}
        />
      </main>
      <Toaster />
    </div>
  );
}

function Content({ 
  currentView, 
  currentGameId, 
  onGameCreated, 
  onBackToSetup 
}: {
  currentView: "setup" | "game" | "history";
  currentGameId: Id<"games"> | null;
  onGameCreated: (gameId: Id<"games">) => void;
  onBackToSetup: () => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Authenticated>
        {currentView === "setup" && (
          <GameSetup onGameCreated={onGameCreated} />
        )}
        {currentView === "game" && currentGameId && (
          <GameBoard gameId={currentGameId} onBackToSetup={onBackToSetup} />
        )}
        {currentView === "history" && (
          <GameHistory />
        )}
      </Authenticated>
      
      <Unauthenticated>
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🐍 Snake & Ladder Game
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Real-time multiplayer game with LED grid synchronization
          </p>
          <div className="max-w-md mx-auto">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
