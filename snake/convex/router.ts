import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// WebSocket-like endpoint for microcontroller communication
http.route({
  path: "/game/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    
    try {
      switch (body.type) {
        case "dice_roll":
          await ctx.runMutation(api.games.rollDice, {
            gameId: body.gameId,
            diceValue: body.diceValue
          });
          break;
          
        case "player_move":
          await ctx.runMutation(api.games.movePlayer, {
            gameId: body.gameId,
            newPosition: body.newPosition,
            moveType: body.moveType
          });
          break;
          
        default:
          return new Response(JSON.stringify({ error: "Unknown update type" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
      }
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  })
});

export default http;
