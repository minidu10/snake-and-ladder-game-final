import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  games: defineTable({
    player1Name: v.string(),
    player1Color: v.string(),
    player1Position: v.number(),
    player2Name: v.string(),
    player2Color: v.string(),
    player2Position: v.number(),
    currentPlayer: v.union(v.literal(1), v.literal(2)),
    gameStatus: v.union(
      v.literal("setup"),
      v.literal("playing"),
      v.literal("finished")
    ),
    winner: v.optional(v.union(v.literal(1), v.literal(2))),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    duration: v.optional(v.number()),
    lastDiceRoll: v.optional(v.number()),
    lastMoveType: v.optional(v.union(
      v.literal("normal"),
      v.literal("snake"),
      v.literal("ladder")
    )),
    snakesAndLadders: v.object({
      snakes: v.array(v.object({
        head: v.number(),
        tail: v.number()
      })),
      ladders: v.array(v.object({
        bottom: v.number(),
        top: v.number()
      }))
    })
  }),
  
  gameHistory: defineTable({
    gameId: v.id("games"),
    player1Name: v.string(),
    player1Color: v.string(),
    player2Name: v.string(),
    player2Color: v.string(),
    winner: v.union(v.literal(1), v.literal(2)),
    duration: v.number(),
    completedAt: v.number()
  }).index("by_completed_at", ["completedAt"]),
  
  gameEvents: defineTable({
    gameId: v.id("games"),
    eventType: v.union(
      v.literal("dice_roll"),
      v.literal("move"),
      v.literal("snake_encounter"),
      v.literal("ladder_encounter"),
      v.literal("game_start"),
      v.literal("game_end")
    ),
    player: v.union(v.literal(1), v.literal(2)),
    data: v.any(),
    timestamp: v.number()
  }).index("by_game_and_timestamp", ["gameId", "timestamp"])
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
