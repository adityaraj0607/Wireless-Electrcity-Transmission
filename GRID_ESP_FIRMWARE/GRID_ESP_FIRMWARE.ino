/*
╔══════════════════════════════════════════════════════════════════════╗
║  WIRELESS ELECTRICITY TRANSMISSION (WET) — GRID ESP32 FIRMWARE       ║
║  AES-256 Decryption, 2-Channel Relay Gating, I2C OLED Diagnostics   ║
║  Inventors: Aditya Raj & Deepak Kumar Gupta                        ║
║  Version: 3.0.0-GRID                                                 ║
╚══════════════════════════════════════════════════════════════════════╝
*/

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <Wire.h>
#include <U8g2lib.h>
#include "mbedtls/aes.h"

// ═════ Wi-Fi & SERVER CONFIGURATION ═════
const char* ssid     = "Aditya";
const char* password = "Aditya09";
const char* serverIP = "172.168.27.37"; // Target Flask server IP address
const int serverPort = 5000;

WebSocketsClient webSocket;

// ═════ HARDWARE CONNECTIONS ═════
const int RELAY_CH1 = 26; // Main power channel
const int RELAY_CH2 = 27; // Secondary/Backup channel

// 1.3" OLED Display (SH1106 I2C)
U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);

// ═════ CRYPTOGRAPHIC KEY (AES-256) ═════
unsigned char aes_key[] = "AdityaRajSecureGridKey1234567890";
unsigned char iv[]      = "InitVector12345"; 

bool ch1_active = false;
bool ch2_active = false;
bool ws_connected = false;

// ═════ OLED UPDATE UTILITY ═════
void updateOLED(String status, String line1, String line2) {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_6x10_tf);
  
  u8g2.drawStr(0, 10, "═══ WET GRID NODE A ═══");
  u8g2.drawStr(0, 26, "Server Link:");
  u8g2.drawStr(80, 26, status.c_str());
  
  u8g2.drawStr(0, 40, "CH1 Gate:");
  u8g2.drawStr(80, 40, ch1_active ? "OPEN (ON)" : "LOCKED");
  
  u8g2.drawStr(0, 52, "CH2 Gate:");
  u8g2.drawStr(80, 52, ch2_active ? "OPEN (ON)" : "LOCKED");
  
  u8g2.drawStr(0, 64, line2.substring(0, 21).c_str());
  u8g2.sendBuffer();
}

// ═════ AES DECRYPTION ═════
void decryptPayload(unsigned char* ciphertext, int len, unsigned char* output) {
  mbedtls_aes_context aes;
  mbedtls_aes_init(&aes);
  mbedtls_aes_setkey_dec(&aes, (const unsigned char*)aes_key, 256);
  
  unsigned char decrypt_iv[16];
  memcpy(decrypt_iv, iv, 16);
  
  mbedtls_aes_crypt_cbc(&aes, MBEDTLS_AES_DECRYPT, len, decrypt_iv, ciphertext, output);
  mbedtls_aes_free(&aes);
}

// ═════ WEBSOCKET EVENTS (Socket.IO client protocol) ═════
void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  String msg = "";
  
  switch(type) {
    case WStype_DISCONNECTED:
      ws_connected = false;
      Serial.println("[WS] Severed connection to server.");
      updateOLED("OFFLINE", "", "Reconnecting...");
      break;
      
    case WStype_CONNECTED:
      ws_connected = true;
      Serial.println("[WS] Connected to control server.");
      updateOLED("ONLINE", "", "Joining room...");
      
      // Handshake: Socket.IO connection frame
      webSocket.sendTXT("40");
      // Join Room
      webSocket.sendTXT("42[\"join\",{\"room\":\"grid_esp\"}]");
      break;
      
    case WStype_TEXT:
      msg = (char*)payload;
      Serial.print("[WS] Received payload: ");
      Serial.println(msg);
      
      // Socket.IO event parsing
      if (msg.startsWith("42[\"esp_relay_on\"")) {
        // Turn relay ON
        if (msg.indexOf("\"channel\":1") > 0) {
          ch1_active = true;
          digitalWrite(RELAY_CH1, HIGH);
          Serial.println("[RELAY] Channel 1 ENGAGED.");
        } else if (msg.indexOf("\"channel\":2") > 0) {
          ch2_active = true;
          digitalWrite(RELAY_CH2, HIGH);
          Serial.println("[RELAY] Channel 2 ENGAGED.");
        }
        updateOLED("ONLINE", "", "Corridor Open");
      }
      else if (msg.startsWith("42[\"esp_relay_off\"")) {
        // Turn relay OFF
        if (msg.indexOf("\"channel\":1") > 0) {
          ch1_active = false;
          digitalWrite(RELAY_CH1, LOW);
          Serial.println("[RELAY] Channel 1 DISENGAGED.");
        } else if (msg.indexOf("\"channel\":2") > 0) {
          ch2_active = false;
          digitalWrite(RELAY_CH2, LOW);
          Serial.println("[RELAY] Channel 2 DISENGAGED.");
        } else {
          ch1_active = false;
          ch2_active = false;
          digitalWrite(RELAY_CH1, LOW);
          digitalWrite(RELAY_CH2, LOW);
          Serial.println("[RELAY] Emergency shutoff executed.");
        }
        updateOLED("ONLINE", "", "Locked");
      }
      break;
  }
}

// ═════ SETUP ═════
void setup() {
  Serial.begin(115200);
  
  // Set relay pins as outputs
  pinMode(RELAY_CH1, OUTPUT);
  pinMode(RELAY_CH2, OUTPUT);
  digitalWrite(RELAY_CH1, LOW);
  digitalWrite(RELAY_CH2, LOW);

  // Initialize OLED display
  u8g2.begin();
  updateOLED("BOOTING", "", "Connecting WiFi...");

  // Wi-Fi Connection
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n[SYSTEM] WiFi connected.");
  Serial.print("[SYSTEM] IP: ");
  Serial.println(WiFi.localIP());

  // WebSocket Server targets Socket.IO
  webSocket.begin(serverIP, serverPort, "/socket.io/?EIO=4&transport=websocket");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
  
  updateOLED("CONNECTING", "", WiFi.localIP().toString());
}

// ═════ MAIN LOOP ═════
void loop() {
  webSocket.loop();
}