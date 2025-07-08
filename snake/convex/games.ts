import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Default snakes and ladders configuration
const DEFAULT_SNAKES_AND_LADDERS = {
  snakes: [
    { head: 99, tail: 78 },
    { head: 95, tail: 75 },
    { head: 92, tail: 88 },
    { head: 87, tail: 24 },
    { head: 64, tail: 60 },
    { head: 62, tail: 19 },
    { head: 56, tail: 53 },
    { head: 49, tail: 11 },
    { head: 47, tail: 26 },
    { head: 16, tail: 6 }
  ],
  ladders: [
    { bottom: 1, top: 38 },
    { bottom: 4, top: 14 },
    { bottom: 9, top: 21 },
    { bottom: 21, top: 42 },
    { bottom: 28, top: 84 },
    { bottom: 36, top: 44 },
    { bottom: 51, top: 67 },
    { bottom: 71, top: 91 },
    { bottom: 80, top: 100 }
  ]
};

export const createGame = mutation({
  args: {
    player1Name: v.string(),
    player1Color: v.string(),
    player2Name: v.string(),
    player2Color: v.string()
  },
  handler: async (ctx, args) => {
    const gameId = await ctx.db.insert("games", {
      player1Name: args.player1Name,
      player1Color: args.player1Color,
      player1Position: 0,
      player2Name: args.player2Name,
      player2Color: args.player2Color,
      player2Position: 0,
      currentPlayer: 1,
      gameStatus: "setup",
      snakesAndLadders: DEFAULT_SNAKES_AND_LADDERS
    });
    
    return gameId;
  }
});

export const startGame = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    
    const startTime = Date.now();
    
    await ctx.db.patch(args.gameId, {
      gameStatus: "playing",
      startTime
    });
    
    await ctx.db.insert("gameEvents", {
      gameId: args.gameId,
      eventType: "game_start",
      player: 1,
      data: { startTime },
      timestamp: startTime
    });
    
    return { success: true };
  }
});

export const rollDice = mutation({
  args: { 
    gameId: v.id("games"),
    diceValue: v.number()
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.gameStatus !== "playing") {
      throw new Error("Game not found or not in playing state");
    }
    
    await ctx.db.patch(args.gameId, {
      lastDiceRoll: args.diceValue
    });
    
    await ctx.db.insert("gameEvents", {
      gameId: args.gameId,
      eventType: "dice_roll",
      player: game.currentPlayer,
      data: { diceValue: args.diceValue },
      timestamp: Date.now()
    });
    
    return { success: true };
  }
});

export const movePlayer = mutation({
  args: {
    gameId: v.id("games"),
    newPosition: v.number(),
    moveType: v.optional(v.union(
      v.literal("normal"),
      v.literal("snake"),
      v.literal("ladder")
    ))
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.gameStatus !== "playing") {
      throw new Error("Game not found or not in playing state");
    }
    
    const currentPlayer = game.currentPlayer;
    const moveType = args.moveType || "normal";
    
    // Update player position
    const updateData: any = {
      lastMoveType: moveType,
      currentPlayer: currentPlayer === 1 ? 2 : 1 // Switch turns
    };
    
    if (currentPlayer === 1) {
      updateData.player1Position = args.newPosition;
    } else {
      updateData.player2Position = args.newPosition;
    }
    
    // Check for win condition
    if (args.newPosition >= 100) {
      updateData.gameStatus = "finished";
      updateData.winner = currentPlayer;
      updateData.endTime = Date.now();
      updateData.duration = Date.now() - (game.startTime || Date.now());
      
      // Add to history
      await ctx.db.insert("gameHistory", {
        gameId: args.gameId,
        player1Name: game.player1Name,
        player1Color: game.player1Color,
        player2Name: game.player2Name,
        player2Color: game.player2Color,
        winner: currentPlayer,
        duration: updateData.duration,
        completedAt: Date.now()
      });
      
      await ctx.db.insert("gameEvents", {
        gameId: args.gameId,
        eventType: "game_end",
        player: currentPlayer,
        data: { winner: currentPlayer, position: args.newPosition },
        timestamp: Date.now()
      });
    }
    
    await ctx.db.patch(args.gameId, updateData);
    
    // Log move event
    await ctx.db.insert("gameEvents", {
      gameId: args.gameId,
      eventType: moveType === "snake" ? "snake_encounter" : 
                moveType === "ladder" ? "ladder_encounter" : "move",
      player: currentPlayer,
      data: { 
        newPosition: args.newPosition,
        moveType
      },
      timestamp: Date.now()
    });
    
    return { success: true };
  }
});

export const getCurrentGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.gameId);
  }
});

export const getGameHistory = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("gameHistory")
      .withIndex("by_completed_at")
      .order("desc")
      .take(20);
  }
});

export const getGameEvents = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gameEvents")
      .withIndex("by_game_and_timestamp", (q) => q.eq("gameId", args.gameId))
      .order("desc")
      .take(50);
  }
});
