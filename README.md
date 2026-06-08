# WETA: Wireless Electricity Transmission Architecture

> **AI CONTEXT NOTE**: This `README.md` serves as a comprehensive system map for future AI assistants or developers to instantly understand the architecture, data flow, and file structure of the WETA project.

## 📌 Project Overview
WETA is a high-fidelity, real-time control system for a **Wireless Electricity Transmission Grid**. It bridges physical hardware (ESP32-S3 microcontrollers) with a premium web-based dashboard using Flask, Socket.IO, and SQLite. 

The system operates in **Full Production Mode**. All hardware simulations have been stripped out. The backend strictly relies on live hardware telemetry, heartbeat watchdogs, and true relay states.

---

## 🏗️ System Architecture

### 1. The Backend (`server.py`)
- **Framework**: Python Flask + Flask-SocketIO.
- **Database**: SQLite (`database.db`) for logging telemetry, activity timelines, and grid credit transactions.
- **State Management**: A global `State` class holds the real-time status of the grid, voltage, current, relays, and security locks.
- **Hardware Watchdogs**: A dedicated background thread (`watchdog_loop`) monitors the Home ESP32. If a heartbeat is missed for 5 seconds, it forces an emergency relay disconnect. A separate `esp32_poller` auto-discovers the Grid ESP32.

### 2. The Hardware Nodes (ESP32)
- **Home Node (IP: 192.168.81.19)**: The receiver. Measures its own internal die temperature, Wi-Fi RSSI, power factor, and voltage/current telemetry. Code is located in `HOME_ESP_FIRMWARE/HOME_ESP_FIRMWARE.ino`.
- **Grid Node (IP: 192.168.81.98)**: The transmitter. Controls the primary power relays and transmission channels based on backend commands.

### 3. The Frontends (`/home` and `/grid`)
- **Tech Stack**: Pure HTML, Vanilla CSS (`style.css`), and Vanilla JS (`script.js`). No external frontend frameworks (e.g., React/Vue) are used.
- **Design Language**: Minimalist, premium, "industry-grade" dashboard with a dark mode aesthetic, micro-animations, and dynamic SVG flows.
- **Data Binding**: Uses Socket.IO to receive `state_sync` and `telemetry_update` events, directly manipulating the DOM by element IDs.

---

## 📂 File Directory Map

```text
e:\Wireless Electricity Transmission\
│
├── server.py                     # CORE: Flask server, Socket.IO routes, State Management
├── database.db                   # CORE: SQLite database (Auto-generated)
├── init_db.py                    # UTIL: Script to initialize/reset the database
│
├── HOME_ESP_FIRMWARE/            # HARDWARE: Home Node Firmware
│   └── HOME_ESP_FIRMWARE.ino     # C++ code for WebSocket connection, sensors, and relays
│
├── Home/                         # FRONTEND: Home Receiver Terminal
│   ├── index.html                # Main Dashboard UI (Flexbox layout)
│   ├── style.css                 # Premium Styling (CSS Variables, Flexbox, Animations)
│   └── script.js                 # Socket.IO event listeners & DOM updates
│
└── Grid/                         # FRONTEND: Grid Station Terminal (Currently simpler)
    ├── index.html                
    ├── style.css                 
    └── script.js                 
```

---

## 🔄 The Transmission Workflow

If an AI needs to debug the transmission process, it follows this strict linear flow:
1. **Request**: The user clicks "Request Electricity" on the Home UI. It triggers an API call which logs to the DB.
2. **OTP Verification**: An OTP is required. The UI simulates an AES-256 handshake. Once verified, the channel is "Assigned".
3. **Relay Verification**: `server.py` commands the ESP32s to close the physical relays.
4. **Transmission**: Power begins flowing. `server.py` starts broadcasting `telemetry_update` packets.
5. **Monitoring**: The UI updates the dials, energy wallet, and live stats based strictly on WebSocket data.
6. **Safety Disconnect**: If voltage/current exceeds safe limits, or if a heartbeat drops, `server.py` fires `esp_relay_off` and halts transmission immediately.

---

## ⚠️ Important Rules for Future Edits

1. **Do NOT Mock Data**: The UI is bound to live hardware. Never write JavaScript `setInterval` loops to simulate numbers on the dashboard. If data is missing, fix the ESP32 connection.
2. **Preserve Layouts**: The UI is meticulously crafted using Flexbox. Do not blindly change `display` properties or add `<div>` tags without understanding the `.row` and `.main-content` flex boundaries.
3. **Socket Rooms**: The backend isolates Socket.IO clients into rooms (`home`, `grid`, `home_esp`, `grid_esp`). Ensure emits are targeting the correct room.
