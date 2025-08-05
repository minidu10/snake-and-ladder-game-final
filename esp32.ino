#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>

const char* ssid = "SnakeLadderESP32";
const char* password = "12345678";

WebServer server(80);

String currentGameId = "";
bool gameActive = false;
void sendGameSetupToMega(String mode, String gameId, String p1Name, String p1Color, String p2Name, String p2Color) {
  Serial2.println("GAME_SETUP");
  Serial2.println("MODE:" + mode);
  Serial2.println("GAMEID:" + gameId);
  Serial2.println("P1NAME:" + p1Name);
  Serial2.println("P1COLOR:" + p1Color);
  Serial2.println("P2NAME:" + p2Name);
  Serial2.println("P2COLOR:" + p2Color);
  Serial2.println("START");
  
  Serial.println("Game setup sent to Mega:");
  Serial.println("  Mode: " + mode + ", GameID: " + gameId);
  Serial.println("  P1: " + p1Name + " (" + p1Color + ")");
  Serial.println("  P2: " + p2Name + " (" + p2Color + ")");
}

void handleGameSetup() {
  if (server.method() == HTTP_POST) {
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, server.arg("plain"));

    if (error) {
      Serial.println("JSON parse failed: " + String(error.c_str()));
      server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
      return;
    }

    String mode = doc["mode"].as<String>();
    String gameId = doc["gameId"].as<String>();
    currentGameId = gameId;
    gameActive = true;

    JsonArray players = doc["players"];
    if (players.size() < 2) {
      server.send(400, "application/json", "{\"error\":\"Need 2 players\"}");
      return;
    }

    String p1Name = players[0]["name"].as<String>();
    String p1Color = players[0]["color"].as<String>();
    String p2Name = players[1]["name"].as<String>();
    String p2Color = players[1]["color"].as<String>();

    Serial.println("Game Setup Received from Web App:");
    Serial.println("MODE:" + mode + " GAMEID:" + gameId);
    Serial.println("PLAYER1: " + p1Name + " (" + p1Color + ")");
    Serial.println("PLAYER2: " + p2Name + " (" + p2Color + ")");

    sendGameSetupToMega(mode, gameId, p1Name, p1Color, p2Name, p2Color);
    
    server.send(200, "application/json", "{\"message\":\"Game setup sent to Arduino\"}");
  } else {
    server.send(405, "application/json", "{\"error\":\"Method Not Allowed\"}");
  }
}

void sendScoreToWebApp(int player, int diceValue) {
  if (currentGameId == "") {
    Serial.println("No gameId set, score not sent to web app");
    return;
  }

  if (!gameActive) {
    Serial.println("Game not active, score not sent");
    return;
  }

  String backend_url = "http://192.168.4.2:5000/api/update-position/" + currentGameId;
  HTTPClient http;
  http.begin(backend_url);
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\"dice\":" + String(diceValue) + ",\"player\":" + String(player) + "}";
  int httpCode = http.POST(payload);
  
  Serial.print("Sent to Web App: ");
  Serial.println(payload);
  Serial.print("Response code: ");
  Serial.println(httpCode);
  
  if (httpCode > 0) {
    String response = http.getString();
    if (response.length() > 0) {
      Serial.println("Web App Response: " + response);
    }
  } else {
    Serial.println("HTTP POST failed, code: " + String(httpCode));
  }
  
  http.end();
}

void handlePlayAgain() {
  if (server.method() == HTTP_POST) {
    if (currentGameId != "") {
      Serial2.println("PLAY_AGAIN");
      Serial.println("Play Again command sent to Mega");
      gameActive = true;
      server.send(200, "application/json", "{\"message\":\"Play again sent to Arduino\"}");
    } else {
      Serial.println("Play Again requested but no active game");
      server.send(400, "application/json", "{\"error\":\"No active game\"}");
    }
  } else {
    server.send(405, "application/json", "{\"error\":\"Method Not Allowed\"}");
  }
}

void handleEndGame() {
  if (server.method() == HTTP_POST) {
    if (currentGameId != "") {
      Serial2.println("END_GAME");
      Serial.println("End Game command sent to Mega");
      
      gameActive = false;
      currentGameId = "";
      
      server.send(200, "application/json", "{\"message\":\"End game sent to Arduino\"}");
    } else {
      Serial.println("End Game requested but no active game");
      server.send(400, "application/json", "{\"error\":\"No active game\"}");
    }
  } else {
    server.send(405, "application/json", "{\"error\":\"Method Not Allowed\"}");
  }
}

void handleResetFromMega() {
  Serial.println("Hardware reset signal received from Arduino Mega");
  
  if (currentGameId != "") {
    Serial.println("Forwarding reset signal to Web App...");
    
    bool resetSuccess = sendResetToWebApp();
    
    if (resetSuccess) {
      Serial.println("Reset signal successfully sent to Web App");
    } else {
      Serial.println("Failed to send reset signal to Web App");
    }
    
    String previousGameId = currentGameId;
    currentGameId = "";
    gameActive = false;
    
    Serial.println("ESP32 game state cleared");
    Serial.println("Previous Game ID: " + previousGameId + " -> Now: " + currentGameId);
  } else {
    Serial.println("Reset received but no active game ID stored");
    gameActive = false;
  }
}

bool sendResetToWebApp() {
  if (currentGameId == "") {
    Serial.println("No gameId set, reset not sent to web app");
    return false;
  }

  String backend_url = "http://192.168.4.2:5000/api/hardware-reset/" + currentGameId;
  HTTPClient http;
  http.begin(backend_url);
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\"source\":\"arduino_mega\",\"timestamp\":\"" + String(millis()) + "\",\"gameId\":\"" + currentGameId + "\"}";
  int httpCode = http.POST(payload);
  
  Serial.print("Reset sent to Web App: ");
  Serial.println(payload);
  Serial.print("Response code: ");
  Serial.println(httpCode);
  
  bool success = false;
  if (httpCode > 0) {
    String response = http.getString();
    if (response.length() > 0) {
      Serial.println("Web App Response: " + response);
    }
    
    if (httpCode >= 200 && httpCode < 300) {
      success = true;
    }
  } else {
    Serial.println("HTTP POST failed, code: " + String(httpCode));
  }
  
  http.end();
  return success;
}

void handleGameStatus() {
  String status = "waiting";
  if (currentGameId != "" && gameActive) {
    status = "active";
  } else if (currentGameId != "" && !gameActive) {
    status = "paused";
  }
  
  String response = "{\"gameId\":\"" + currentGameId + "\",\"status\":\"" + status + "\",\"gameActive\":" + (gameActive ? "true" : "false") + "}";
  server.send(200, "application/json", response);
}

void handleHealthCheck() {
  String healthStatus = "{\"status\":\"ESP32 Bridge Ready\",\"gameId\":\"" + currentGameId + "\",\"gameActive\":" + (gameActive ? "true" : "false") + ",\"uptime\":" + String(millis()) + "}";
  server.send(200, "application/json", healthStatus);
}

void handleCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(200);
}

void setup() {
  Serial.begin(9600);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);

  WiFi.softAP(ssid, password);
  Serial.println("WiFi Access Point Started");
  Serial.println("SSID: " + String(ssid));
  Serial.println("Password: " + String(password));
  Serial.println("ESP32 IP Address: " + WiFi.softAPIP().toString());

  server.on("/game-setup", HTTP_POST, handleGameSetup);
  server.on("/play-again", HTTP_POST, handlePlayAgain);
  server.on("/end-game", HTTP_POST, handleEndGame);
  server.on("/game-status", HTTP_GET, handleGameStatus);
  server.on("/health", HTTP_GET, handleHealthCheck);
  
  server.on("/game-setup", HTTP_OPTIONS, handleCORS);
  server.on("/play-again", HTTP_OPTIONS, handleCORS);
  server.on("/end-game", HTTP_OPTIONS, handleCORS);
  server.on("/game-status", HTTP_OPTIONS, handleCORS);
  
  server.onNotFound([]() {
    server.send(404, "application/json", "{\"error\":\"Endpoint not found\"}");
  });

  server.begin();
  Serial.println("HTTP Server started on port 80");
  Serial.println("Ready to bridge Web App and Arduino Mega");
  Serial.println("Available endpoints:");
  Serial.println("  POST /game-setup - Receive game setup from web");
  Serial.println("  POST /play-again - Handle play again requests");
  Serial.println("  POST /end-game - Handle end game requests");
  Serial.println("  GET  /game-status - Get current game status");
  Serial.println("  GET  /health - Health check");
  Serial.println();
  Serial.println("Waiting for Mega connection and web app requests...");
  
  currentGameId = "";
  gameActive = false;
}

void loop() {
  server.handleClient();

  if (Serial2.available()) {
    String receivedData = Serial2.readStringUntil('\n');
    receivedData.trim();
    
    if (receivedData.length() > 0) {
      Serial.println("From Mega: " + receivedData);

      if (receivedData == "RESET_GAME") {
        handleResetFromMega();
      }
      else {
        int commaIndex = receivedData.indexOf(',');
        if (commaIndex > 0) {
          int player = receivedData.substring(0, commaIndex).toInt();
          int diceValue = receivedData.substring(commaIndex + 1).toInt();
          
          if (player >= 1 && player <= 2 && diceValue >= 1 && diceValue <= 6) {
            Serial.println("Valid score - Player " + String(player) + " rolled " + String(diceValue));
            sendScoreToWebApp(player, diceValue);
          } else {
            Serial.println("Invalid score data: Player=" + String(player) + ", Dice=" + String(diceValue));
          }
        } else {
          Serial.println("Info from Mega: " + receivedData);
          
          if (receivedData.startsWith("ERROR:")) {
            Serial.println("Error from Mega: " + receivedData);
          } else if (receivedData.startsWith("STATUS:")) {
            Serial.println("Status from Mega: " + receivedData);
          } else if (receivedData.startsWith("DEBUG:")) {
            Serial.println("Debug from Mega: " + receivedData);
          } else {
            Serial.println("Unknown message from Mega: " + receivedData);
          }
        }
      }
    }
  }
  
  delay(10);
}

bool testBackendConnection() {
  HTTPClient http;
  http.begin("http://192.168.4.2:5000/api/health");
  http.setTimeout(5000);
  
  int httpCode = http.GET();
  bool connected = (httpCode == 200);
  
  Serial.println("Backend connection test: " + String(connected ? "SUCCESS" : "FAILED") + " (Code: " + String(httpCode) + ")");
  
  http.end();
  return connected;
}

void sendHeartbeat() {
  if (currentGameId != "" && gameActive) {
    HTTPClient http;
    http.begin("http://192.168.4.2:5000/api/heartbeat");
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{\"gameId\":\"" + currentGameId + "\",\"source\":\"esp32\",\"timestamp\":" + String(millis()) + "}";
    int httpCode = http.POST(payload);
    
    if (httpCode != 200) {
      Serial.println("Heartbeat failed: " + String(httpCode));
    }
    
    http.end();
  }
}