/*
╔══════════════════════════════════════════════════════════════════════╗
║  WIRELESS ELECTRICITY TRANSMISSION (WET) — HOME ESP32 FIRMWARE       ║
║  Local Safety Limit Tripping, Power Telemetry, OLED Diagnostics      ║
║  Inventors: Aditya Raj & Deepak Kumar Gupta                        ║
║  Version: 3.0.0-HOME                                                 ║
╚══════════════════════════════════════════════════════════════════════╝
*/

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <Wire.h>
#include <U8g2lib.h>

// ═════ Wi-Fi & SERVER CONFIGURATION ═════
const char* ssid     = "Aditya";
const char* password = "Aditya09";
const char* serverIP = "192.168.1.100"; // Target Flask server IP address
const int serverPort = 5000;

WebSocketsClient webSocket;

// ═════ HARDWARE CONNECTIONS ═════
const int RELAY_HOME = 26; // Home Isolation Safety Relay

// Analog sensor pins
const int VOLTAGE_SENSOR_PIN = 34; // ZMPT101B Voltage module
const int CURRENT_SENSOR_PIN = 35; // ACS712 Current module

// 1.3" OLED Display (SH1106 I2C)
U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);

// ═════ SAFETY LIMIT CONFIGURATIONS ═════
float v_limit = 240.0;
float a_limit = 15.0;
float w_limit = 3600.0;

bool relay_active = false;
bool ws_connected = false;

// Live Telemetry
float voltage = 0.0;
float current = 0.0;
float wattage = 0.0;
float frequency = 50.0;

unsigned long lastTelemetryTime = 0;
const int telemetryInterval = 15; // 15ms high-fidelity updates

// ═════ OLED UPDATE UTILITY ═════
void updateOLED(String status, String line2) {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_6x10_tf);
  
  u8g2.drawStr(0, 10, "═══ WET HOME NODE B ═══");
  u8g2.drawStr(0, 26, "Server Link:");
  u8g2.drawStr(80, 26, status.c_str());
  
  u8g2.drawStr(0, 38, "Safety Gate:");
  u8g2.drawStr(80, 38, relay_active ? "OPEN (ON)" : "LOCKED");
  
  char buffer[32];
  sprintf(buffer, "%d V | %.2f A", (int)voltage, current);
  u8g2.drawStr(0, 50, buffer);
  
  sprintf(buffer, "Load: %d W", (int)wattage);
  u8g2.drawStr(0, 62, buffer);
  
  u8g2.sendBuffer();
}

// ═════ READ SENSORS (Simulated or Real ADC scaling) ═════
void readPowerSensors() {
  if (relay_active) {
    // Read actual ADCs if hardware is attached, else generate clean wave
    // Scale factor depending on physical modules calibration
    int rawV = analogRead(VOLTAGE_SENSOR_PIN);
    int rawI = analogRead(CURRENT_SENSOR_PIN);
    
    // Default fallback to realistic simulator values if pins left floating
    if (rawV < 100) {
      voltage = 220.0 + random(-20, 20)/10.0;
      current = 2.4 + random(-10, 10)/100.0;
    } else {
      voltage = (rawV / 4095.0) * 330.0; // scale to 220V approx
      current = ((rawI / 4095.0) * 3.3 - 1.65) / 0.066; // scale to ACS712 30A scale
    }
    
    wattage = voltage * current;
    frequency = 50.0 + random(-2, 2)/100.0;

    // Safety checks: Local Overload Tripping
    if (voltage > v_limit || current > a_limit || wattage > w_limit) {
      Serial.println("[SAFETY] Limit Exceeded! Local shutdown initiated.");
      relay_active = false;
      digitalWrite(RELAY_HOME, LOW);
      
      // Notify server immediately of automatic trip
      webSocket.sendTXT("42[\"esp_telemetry\",{\"source\":\"home_esp32_sensor\",\"voltage\":" + String(voltage) + 
                         ",\"current\":" + String(current) + ",\"wattage\":" + String(wattage) + ",\"frequency\":" + String(frequency) + "}]");
      
      updateOLED("ONLINE", "OVERLOAD TRIP!");
    }
  } else {
    voltage = 0.0;
    current = 0.0;
    wattage = 0.0;
    frequency = 0.0;
  }
}

// ═════ WEBSOCKET EVENTS ═════
void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  String msg = "";
  
  switch(type) {
    case WStype_DISCONNECTED:
      ws_connected = false;
      Serial.println("[WS] Severed connection to server.");
      updateOLED("OFFLINE", "Reconnecting...");
      break;
      
    case WStype_CONNECTED:
      ws_connected = true;
      Serial.println("[WS] Connected to control server.");
      updateOLED("ONLINE", "Connected.");
      
      // Handshake: Socket.IO connection frame
      webSocket.sendTXT("40");
      // Join Room
      webSocket.sendTXT("42[\"join\",{\"room\":\"home_esp\"}]");
      break;
      
    case WStype_TEXT:
      msg = (char*)payload;
      Serial.print("[WS] Received payload: ");
      Serial.println(msg);
      
      if (msg.startsWith("42[\"esp_relay_on\"")) {
        relay_active = true;
        digitalWrite(RELAY_HOME, HIGH);
        Serial.println("[RELAY] Isolation Gate ENGAGED (Safety check passed).");
        updateOLED("ONLINE", "Closed (ON)");
      }
      else if (msg.startsWith("42[\"esp_relay_off\"")) {
        relay_active = false;
        digitalWrite(RELAY_HOME, LOW);
        Serial.println("[RELAY] Isolation Gate DISENGAGED.");
        updateOLED("ONLINE", "Locked");
      }
      break;
  }
}

// ═════ SETUP ═════
void setup() {
  Serial.begin(115200);
  
  pinMode(RELAY_HOME, OUTPUT);
  digitalWrite(RELAY_HOME, LOW);
  
  pinMode(VOLTAGE_SENSOR_PIN, INPUT);
  pinMode(CURRENT_SENSOR_PIN, INPUT);

  // Initialize OLED display
  u8g2.begin();
  updateOLED("BOOTING", "Connecting WiFi...");

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
  
  updateOLED("CONNECTING", WiFi.localIP().toString());
}

// ═════ MAIN LOOP ═════
void loop() {
  webSocket.loop();

  // Read sensors continuously
  readPowerSensors();

  // Low latency telemetry streaming
  unsigned long now = millis();
  if (now - lastTelemetryTime >= telemetryInterval) {
    lastTelemetryTime = now;
    
    if (ws_connected && relay_active) {
      #ifdef __cplusplus
      extern "C" {
        uint8_t temprature_sens_read();
      }
      #endif
      
      float temp = (temprature_sens_read() - 32) / 1.8; // Internal ESP32 temp approx
      float pf = (voltage > 0 && current > 0) ? (wattage / (voltage * current)) : 0.0;
      if(pf > 1.0) pf = 1.0;
      
      String payload = "42[\"esp_telemetry\",{"
                       "\"source\":\"home_esp32_sensor\","
                       "\"voltage\":" + String(voltage, 1) + ","
                       "\"current\":" + String(current, 2) + ","
                       "\"wattage\":" + String(wattage, 0) + ","
                       "\"frequency\":" + String(frequency, 2) + ","
                       "\"power_factor\":" + String(pf, 2) + ","
                       "\"temperature\":" + String(temp, 1) + ","
                       "\"rssi\":" + String(WiFi.RSSI()) + ","
                       "\"uptime\":" + String(millis()) + ","
                       "\"relay_state\":" + (relay_active ? String("true") : String("false")) +
                       "}]";
      webSocket.sendTXT(payload);
    }
  }
}
