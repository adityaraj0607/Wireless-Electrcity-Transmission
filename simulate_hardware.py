"""
╔══════════════════════════════════════════════════════════════════════╗
║  WIRELESS ELECTRICITY TRANSMISSION (WET) — HARDWARE SIMULATOR       ║
║  Simulates both Grid ESP32 and Home ESP32 via Socket.IO Clients     ║
║  Inventors: Aditya Raj & Deepak Kumar Gupta                        ║
║  Version: 3.0.0-SIM                                                  ║
╚══════════════════════════════════════════════════════════════════════╝
"""

import time
import sys
import random
import threading
import socketio

# Initialize Socket.IO Clients
grid_sio = socketio.Client()
home_sio = socketio.Client()

SERVER_URL = "http://localhost:5000"

# Hardware States
class ESPStates:
    def __init__(self):
        # Grid ESP State
        self.grid_relay_ch1 = False
        self.grid_relay_ch2 = False
        
        # Home ESP State
        self.home_relay = False
        
        # System Load
        self.voltage = 0.0
        self.current = 0.0
        self.wattage = 0.0
        self.frequency = 0.0

ESP = ESPStates()

# ═══════════════════════════════════════════════════════════════
#  GRID ESP32 SOCKET HANDLERS
# ═══════════════════════════════════════════════════════════════

@grid_sio.on('connect')
def on_grid_connect():
    print("[GRID ESP32] Connected to control server.")
    grid_sio.emit('join', {'room': 'grid_esp'})

@grid_sio.on('disconnect')
def on_grid_disconnect():
    print("[GRID ESP32] Severed connection to server.")

@grid_sio.on('esp_relay_on')
def on_grid_relay_on(data):
    channel = data.get('channel', 1)
    if channel == 1:
        ESP.grid_relay_ch1 = True
        print("[GRID ESP32] Physical Relay Channel 1 engaged (POWER GATES OPEN).")
    elif channel == 2:
        ESP.grid_relay_ch2 = True
        print("[GRID ESP32] Physical Relay Channel 2 engaged (POWER GATES OPEN).")

@grid_sio.on('esp_relay_off')
def on_grid_relay_off(data):
    channel = data.get('channel', None)
    if channel == 1:
        ESP.grid_relay_ch1 = False
        print("[GRID ESP32] Physical Relay Channel 1 disengaged (POWER GATES SHUT).")
    elif channel == 2:
        ESP.grid_relay_ch2 = False
        print("[GRID ESP32] Physical Relay Channel 2 disengaged (POWER GATES SHUT).")
    else:
        ESP.grid_relay_ch1 = False
        ESP.grid_relay_ch2 = False
        print("[GRID ESP32] All Physical Relays disengaged (EMERGENCY SHUTDOWN).")

# ═══════════════════════════════════════════════════════════════
#  HOME ESP32 SOCKET HANDLERS
# ═══════════════════════════════════════════════════════════════

@home_sio.on('connect')
def on_home_connect():
    print("[HOME ESP32] Connected to control server.")
    home_sio.emit('join', {'room': 'home_esp'})

@home_sio.on('disconnect')
def on_home_disconnect():
    print("[HOME ESP32] Severed connection to server.")

@home_sio.on('esp_relay_on')
def on_home_relay_on(data):
    ESP.home_relay = True
    print("[HOME ESP32] Physical Isolation Safety Relay engaged (HOME LOAD ONLINE).")

@home_sio.on('esp_relay_off')
def on_home_relay_off(data):
    ESP.home_relay = False
    print("[HOME ESP32] Physical Isolation Safety Relay disengaged (HOME LOAD OFFLINE).")

# ═══════════════════════════════════════════════════════════════
#  TELEMETRY LOOP (10-20ms high-fidelity simulation)
# ═══════════════════════════════════════════════════════════════

def telemetry_stream_loop():
    print("[SYSTEM] High-speed 15ms telemetry thread started.")
    last_emit_time = time.time()
    
    while True:
        # High speed polling/publishing loop
        time.sleep(0.015)  # 15 milliseconds target latency
        
        # Calculate live simulated power flow if relays are active
        if (ESP.grid_relay_ch1 or ESP.grid_relay_ch2) and ESP.home_relay:
            # Power flowing
            base_v = 220.0
            # Introduce small noise fluctuation
            ESP.voltage = base_v + random.uniform(-2.5, 2.5)
            # Home load current draw
            ESP.current = 4.8 + random.uniform(-0.15, 0.15)
            # Wattage calculation
            ESP.wattage = ESP.voltage * ESP.current
            ESP.frequency = 50.0 + random.uniform(-0.01, 0.01)
        else:
            # Grid offline / isolated
            ESP.voltage = 0.0
            ESP.current = 0.0
            ESP.wattage = 0.0
            ESP.frequency = 0.0

        # Send telemetry from Home ESP representing real-time load
        now = time.time()
        if now - last_emit_time >= 0.03:  # limit socket emit to ~30ms to prevent buffer flood
            if home_sio.connected:
                home_sio.emit('esp_telemetry', {
                    'source': 'home_esp32_sensor',
                    'voltage': ESP.voltage,
                    'current': ESP.current,
                    'wattage': ESP.wattage,
                    'frequency': ESP.frequency
                })
            last_emit_time = now

# ═══════════════════════════════════════════════════════════════
#  BOOTSTRAP
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("\n" + "=" * 68)
    print("  WIRELESS ELECTRICITY TRANSMISSION — HARDWARE DEVICE SIMULATOR")
    print("  Version 3.0.0 | Aditya Raj & Co-Inventor Deepak Kumar Gupta")
    print("=" * 68)
    
    # Try connecting to Socket.IO Server
    try:
        grid_sio.connect(SERVER_URL)
        home_sio.connect(SERVER_URL)
    except Exception as e:
        print(f"[ERROR] Could not connect to Socket.IO server at {SERVER_URL}.")
        print("[ERROR] Ensure that server.py is running first!")
        sys.exit(1)

    # Start high frequency telemetry broadcast
    t_thread = threading.Thread(target=telemetry_stream_loop, daemon=True)
    t_thread.start()

    # Block main thread, handle exceptions
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[SYSTEM] Hardware Simulator shutting down.")
        grid_sio.disconnect()
        home_sio.disconnect()
        sys.exit(0)
