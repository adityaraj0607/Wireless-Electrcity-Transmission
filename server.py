"""
WIRELESS ELECTRICITY TRANSMISSION — MASTER CONTROL SERVER
Flask-SocketIO Bridge: Grid <-> Home <-> ESP32
Inventors: Aditya Raj & Deepak Kumar Gupta | v3.0
"""
import os, json, time, secrets, threading, random, sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, redirect
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS

app = Flask(__name__, static_folder=None)
app.config['SECRET_KEY'] = secrets.token_hex(32)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading',
                    ping_interval=5, ping_timeout=10)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database.db')

# ═══ DATABASE SETUP ═══
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS telemetry_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    voltage REAL, current REAL, wattage REAL, frequency REAL)''')
    c.execute('''CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    event_type TEXT, description TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS wallet (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    type TEXT, amount REAL, description TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY, value TEXT)''')
    
    # Initialize wallet if empty
    c.execute("SELECT SUM(amount) FROM wallet")
    if not c.fetchone()[0]:
        c.execute("INSERT INTO wallet (type, amount, description) VALUES ('credit', 5000.00, 'Initial Balance')")
        
    conn.commit()
    conn.close()

init_db()

def db_log_telemetry(v, a, w, f):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute("INSERT INTO telemetry_history (voltage, current, wattage, frequency) VALUES (?, ?, ?, ?)", (v, a, w, f))
        conn.commit()
        conn.close()
    except Exception as e:
        print("DB Error:", e)

def db_log_event(event_type, description):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute("INSERT INTO events (event_type, description) VALUES (?, ?)", (event_type, description))
        conn.commit()
        conn.close()
    except Exception as e:
        print("DB Error:", e)

def db_wallet_tx(tx_type, amount, description):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute("INSERT INTO wallet (type, amount, description) VALUES (?, ?, ?)", (tx_type, amount, description))
        conn.commit()
        conn.close()
    except Exception as e:
        print("DB Error:", e)

# ═══ GLOBAL STATE ═══
class State:
    def __init__(self):
        self.otp_code = None
        self.otp_ts = None
        self.otp_expiry = 120
        self.otp_verified = False
        self.encryption_active = False
        self.grid_ch1 = False
        self.grid_ch2 = False
        self.assigned_channel = None
        self.home_relay = False
        self.grid_connected = False
        self.home_connected = False
        self.grid_esp = False
        self.home_esp = False
        self.voltage = 0.0
        self.current = 0.0
        self.wattage = 0.0
        self.freq = 50.0
        self.v_limit = 240.0
        self.a_limit = 15.0
        self.w_limit = 3600.0
        self.tx_active = False
        self.tx_start = None
        self.pending = False
        self.req_source = None
        self.last_heartbeat = None
        self.esp_rssi = -100
        self.esp_uptime = 0
        self.temperature = 0.0
        self.power_factor = 0.0

    def gen_otp(self):
        self.otp_code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
        self.otp_ts = datetime.now()
        self.otp_verified = False
        return self.otp_code

    def verify_otp(self, code):
        if not self.otp_code: 
            return False, "No OTP generated"
        if (datetime.now() - self.otp_ts).total_seconds() > self.otp_expiry:
            return False, "OTP expired"
        if code == self.otp_code:
            self.otp_verified = True
            self.encryption_active = True
            return True, "Verified"
        return False, "Invalid OTP"

    def assign_ch(self):
        if not self.grid_ch1: 
            self.assigned_channel = 1
            self.grid_ch1 = True
            return 1
        if not self.grid_ch2: 
            self.assigned_channel = 2
            self.grid_ch2 = True
            return 2
        # Fallback to Channel 1 if both occupied or none set
        self.assigned_channel = 1
        self.grid_ch1 = True
        return 1

    def check_safe(self):
        ok = self.voltage <= self.v_limit and self.current <= self.a_limit and self.wattage <= self.w_limit
        v = []
        if self.voltage > self.v_limit: 
            v.append(f"Voltage:{self.voltage:.1f}V")
        if self.current > self.a_limit: 
            v.append(f"Current:{self.current:.1f}A")
        if self.wattage > self.w_limit: 
            v.append(f"Wattage:{self.wattage:.0f}W")
        return ok, v

    def stop_tx(self, reason="Manual"):
        self.tx_active = False
        self.grid_ch1 = False
        self.grid_ch2 = False
        self.home_relay = False
        self.assigned_channel = None
        self.otp_verified = False
        self.encryption_active = False
        self.pending = False
        self.voltage = 0.0
        self.current = 0.0
        self.wattage = 0.0
        self.tx_start = None

    def full_state(self):
        rem = 0
        if self.otp_code and self.otp_ts:
            rem = max(0, self.otp_expiry - (datetime.now() - self.otp_ts).total_seconds())
        return {
            "otp": {
                "code": self.otp_code,
                "verified": self.otp_verified,
                "remaining": round(rem),
                "encryption": self.encryption_active
            },
            "grid": {
                "connected": self.grid_connected,
                "esp": self.grid_esp,
                "ch1": self.grid_ch1,
                "ch2": self.grid_ch2,
                "channel": self.assigned_channel
            },
            "home": {
                "connected": self.home_connected,
                "esp": self.home_esp,
                "relay": self.home_relay
            },
            "power": {
                "voltage": round(self.voltage, 1),
                "current": round(self.current, 2),
                "wattage": round(self.wattage, 0),
                "frequency": round(self.freq, 2),
                "power_factor": round(self.power_factor, 2),
                "temperature": round(self.temperature, 1)
            },
            "device": {
                "rssi": self.esp_rssi,
                "uptime": self.esp_uptime,
                "last_heartbeat": self.last_heartbeat
            },
            "limits": {
                "voltage": self.v_limit,
                "current": self.a_limit,
                "wattage": self.w_limit
            },
            "tx": {
                "active": self.tx_active,
                "channel": self.assigned_channel,
                "duration": round((datetime.now() - self.tx_start).total_seconds(), 1) if self.tx_start else 0
            },
            "pending": self.pending,
            "source": self.req_source
        }

S = State()
CONNECTED_SIDS = {}  # sid -> room

def broadcast_state():
    state = S.full_state()
    # Broad state sync
    socketio.emit('state_sync', state)
    
    # Translate for Home Node's legacy listener
    home_state = {
        "grid_esp_connected": S.home_esp,
        "ch1": S.grid_ch1 or S.grid_ch2,
        "home_relay": S.home_relay
    }
    socketio.emit('master_state', home_state, room='home')

# ═══ STATIC FILES ═══
@app.route('/')
def idx(): 
    return redirect('/grid/', code=302)

@app.route('/grid')
def grid_redir(): 
    return redirect('/grid/', code=302)

@app.route('/grid/')
def grid_idx(): 
    return send_from_directory(os.path.join(BASE_DIR, 'Grid'), 'index.html')

@app.route('/grid/<path:f>')
def grid_s(f): 
    return send_from_directory(os.path.join(BASE_DIR, 'Grid'), f)

@app.route('/home')
def home_redir(): 
    return redirect('/home/', code=302)

@app.route('/home/')
def home_idx(): 
    return send_from_directory(os.path.join(BASE_DIR, 'Home'), 'index.html')

@app.route('/home/<path:f>')
def home_s(f): 
    return send_from_directory(os.path.join(BASE_DIR, 'Home'), f)

# ═══ REST API ═══
@app.route('/api/status')
def api_status(): 
    return jsonify(S.full_state())

@app.route('/api/history')
def api_history():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM telemetry_history ORDER BY id DESC LIMIT 100")
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify(rows)

@app.route('/api/wallet')
def api_wallet():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT SUM(amount) as balance FROM wallet")
    bal = c.fetchone()['balance'] or 0
    c.execute("SELECT * FROM wallet ORDER BY id DESC LIMIT 50")
    tx = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify({"balance": bal, "transactions": tx})

@app.route('/api/timeline')
def api_timeline():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM events ORDER BY id DESC LIMIT 50")
    events = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify(events)

@app.route('/api/request-electricity', methods=['POST'])
def api_req():
    S.pending = True
    S.req_source = "Home Node"
    otp = S.gen_otp()
    db_log_event("REQUEST", "Electricity requested by Home Node via API")
    
    socketio.emit('electricity_request', {
        'source': 'Home Node',
        'time': datetime.now().strftime("%H:%M:%S"),
        'protocol': 'WET-AES-V3',
        'encryption': 'AES-256-GCM',
        'otp': otp
    }, room='grid')
    
    socketio.emit('otp_generated', {'otp': otp, 'expiry': S.otp_expiry}, room='home')
    socketio.emit('otp_broadcast', {'otp': otp, 'expiry': S.otp_expiry}, room='home')
    
    broadcast_state()
    return jsonify({"status": "success", "otp": otp})

@app.route('/api/verify-otp', methods=['POST'])
def api_verify():
    ok, msg = S.verify_otp(request.json.get('otp', ''))
    if ok:
        ch = S.assign_ch()
        if not ch: 
            return jsonify({"status": "error", "message": "No channels"})
        
        db_log_event("OTP_VERIFY", f"OTP verified. Channel {ch} assigned via API.")
        S.tx_active = True
        S.tx_start = datetime.now()
        S.home_relay = True
        
        socketio.emit('esp_relay_on', {'channel': ch}, room='grid_esp')
        socketio.emit('esp_relay_on', {'channel': ch}, room='home_esp')
        
        socketio.emit('grid_relay_engage', {'channel': ch, 'verified': True}, room='grid')
        socketio.emit('grid_authorized', {'channel': ch}, room='home')
        socketio.emit('otp_verified_response', {'status': 'success', 'channel': ch}, room='home')
        
        socketio.emit('transmission_active', {
            'channel': ch,
            'voltage': S.voltage,
            'current': S.current,
            'wattage': S.wattage
        }, room='grid')
        
        broadcast_state()
        return jsonify({"status": "success", "channel": ch})
        
    socketio.emit('otp_failed', {'message': msg}, room='home')
    socketio.emit('otp_verified_response', {'status': 'error', 'message': msg}, room='home')
    broadcast_state()
    return jsonify({"status": "error", "message": msg})

@app.route('/api/home-safety-check', methods=['POST'])
def api_safety():
    d = request.json
    S.voltage = d.get('voltage', 0)
    S.current = d.get('current', 0)
    S.wattage = d.get('wattage', 0)
    ok, v = S.check_safe()
    if ok:
        S.home_relay = True
        S.tx_active = True
        if not S.tx_start:
            S.tx_start = datetime.now()
        
        socketio.emit('home_relay_engage', {'safe': True, 'voltage': S.voltage, 'current': S.current, 'wattage': S.wattage}, room='home')
        socketio.emit('esp_relay_on', {'channel': 1}, room='home_esp')
        socketio.emit('transmission_active', {'channel': S.assigned_channel, 'voltage': S.voltage, 'current': S.current, 'wattage': S.wattage}, room='grid')
        
        broadcast_state()
        return jsonify({"status": "success"})
        
    S.stop_tx("Safety violation")
    socketio.emit('overload_alert', {'violations': v, 'voltage': S.voltage, 'current': S.current, 'wattage': S.wattage}, room='home')
    socketio.emit('esp_relay_off', {}, room='grid_esp')
    socketio.emit('esp_relay_off', {}, room='home_esp')
    socketio.emit('transmission_halted', {'reason': 'Safety violation'}, room='grid')
    socketio.emit('transmission_stop', {}, room='home')
    
    broadcast_state()
    return jsonify({"status": "error", "violations": v})

@app.route('/api/grid-approve', methods=['POST'])
def api_approve():
    if request.json.get('approve') and S.pending:
        S.pending = False
        socketio.emit('request_approved', {}, room='home')
        broadcast_state()
        return jsonify({"status": "success"})
    S.pending = False
    S.stop_tx("Denied")
    socketio.emit('request_denied', {}, room='home')
    socketio.emit('transmission_stop', {}, room='home')
    socketio.emit('transmission_halted', {'reason': 'Denied by Operator'}, room='grid')
    broadcast_state()
    return jsonify({"status": "denied"})

@app.route('/api/emergency-stop', methods=['POST'])
def api_estop():
    S.stop_tx("Emergency")
    socketio.emit('esp_relay_off', {}, room='grid_esp')
    socketio.emit('esp_relay_off', {}, room='home_esp')
    socketio.emit('emergency_stop', {}, room='grid')
    socketio.emit('emergency_stop', {}, room='home')
    socketio.emit('transmission_halted', {'reason': 'Emergency Stop'}, room='grid')
    socketio.emit('transmission_stop', {}, room='home')
    broadcast_state()
    return jsonify({"status": "stopped"})

# ═══ WEBSOCKET ═══
@socketio.on('join')
def on_join(data):
    room = data.get('room', '')
    if room:
        join_room(room)
        CONNECTED_SIDS[request.sid] = room
        if room == 'grid': S.grid_connected = True
        elif room == 'home': S.home_connected = True
        elif room == 'grid_esp': S.grid_esp = True
        elif room == 'home_esp': S.home_esp = True
        broadcast_state()

@socketio.on('disconnect')
def on_disconnect():
    room = CONNECTED_SIDS.pop(request.sid, None)
    if room:
        if room == 'grid': S.grid_connected = False
        elif room == 'home': S.home_connected = False
        elif room == 'grid_esp': S.grid_esp = False
        elif room == 'home_esp': S.home_esp = False
        
        # If ESP32s disconnect, stop active transmission
        if room == 'grid_esp' or room == 'home_esp':
            if S.tx_active:
                S.stop_tx("ESP Disconnected")
                socketio.emit('esp_relay_off', {}, room='grid_esp')
                socketio.emit('esp_relay_off', {}, room='home_esp')
                socketio.emit('transmission_halted', {'reason': 'Hardware Disconnect'}, room='grid')
                socketio.emit('transmission_stop', {}, room='home')
        broadcast_state()

@socketio.on('request_state')
def on_req_state():
    emit('state_sync', S.full_state())

@socketio.on('ping_latency')
def on_ping_lat():
    emit('pong_latency')

@socketio.on('request_electricity')
def on_socket_req_elec():
    S.pending = True
    S.req_source = "Home Node"
    otp = S.gen_otp()
    db_log_event("REQUEST", "Electricity requested by Home Node via Socket")
    
    socketio.emit('electricity_request', {
        'source': 'Home Node',
        'time': datetime.now().strftime("%H:%M:%S"),
        'protocol': 'WET-AES-V3',
        'encryption': 'AES-256-GCM',
        'otp': otp
    }, room='grid')
    
    socketio.emit('otp_generated', {'otp': otp, 'expiry': S.otp_expiry}, room='home')
    socketio.emit('otp_broadcast', {'otp': otp, 'expiry': S.otp_expiry}, room='home')
    broadcast_state()

@socketio.on('submit_otp')
def on_socket_submit_otp(data):
    otp = data.get('otp', '')
    ok, msg = S.verify_otp(otp)
    if ok:
        ch = S.assign_ch()
        db_log_event("OTP_VERIFY", f"OTP verified. Channel {ch} assigned via Socket.")
        S.tx_active = True
        S.tx_start = datetime.now()
        S.home_relay = True
        
        socketio.emit('esp_relay_on', {'channel': ch}, room='grid_esp')
        socketio.emit('esp_relay_on', {'channel': ch}, room='home_esp')
        
        socketio.emit('grid_relay_engage', {'channel': ch, 'verified': True}, room='grid')
        socketio.emit('grid_authorized', {'channel': ch}, room='home')
        socketio.emit('otp_verified_response', {'status': 'success', 'channel': ch}, room='home')
        
        socketio.emit('transmission_active', {
            'channel': ch,
            'voltage': S.voltage,
            'current': S.current,
            'wattage': S.wattage
        }, room='grid')
        
        broadcast_state()
    else:
        socketio.emit('otp_failed', {'message': msg}, room='home')
        socketio.emit('otp_verified_response', {'status': 'error', 'message': msg}, room='home')
        broadcast_state()

@socketio.on('emergency_shutdown')
def on_socket_shutdown():
    S.stop_tx("Emergency")
    socketio.emit('esp_relay_off', {}, room='grid_esp')
    socketio.emit('esp_relay_off', {}, room='home_esp')
    socketio.emit('emergency_stop', {}, room='grid')
    socketio.emit('emergency_stop', {}, room='home')
    socketio.emit('transmission_halted', {'reason': 'Emergency Stop'}, room='grid')
    socketio.emit('transmission_stop', {}, room='home')
    broadcast_state()

@socketio.on('update_limits')
def on_socket_update_limits(data):
    S.v_limit = float(data.get('voltage', S.v_limit))
    S.a_limit = float(data.get('current', S.a_limit))
    S.w_limit = float(data.get('wattage', S.w_limit))
    broadcast_state()

@socketio.on('esp_telemetry')
def on_telem(d):
    S.last_heartbeat = time.time()
    if not S.home_esp:
        S.home_esp = True
        S.home_connected = True
        db_log_event("SYSTEM", "ESP32 Device Online (Heartbeat Restored)")
        broadcast_state()

    S.voltage = float(d.get('voltage', S.voltage))
    S.current = float(d.get('current', S.current))
    S.wattage = float(d.get('wattage', S.wattage))
    S.freq = float(d.get('frequency', S.freq))
    S.power_factor = float(d.get('power_factor', S.power_factor))
    S.temperature = float(d.get('temperature', S.temperature))
    S.esp_rssi = int(d.get('rssi', S.esp_rssi))
    S.esp_uptime = int(d.get('uptime', S.esp_uptime))
    S.home_relay = str(d.get('relay_state', '')).lower() == 'true'

    
    t = {
        'voltage': round(S.voltage, 1),
        'current': round(S.current, 2),
        'wattage': round(S.wattage, 0),
        'frequency': round(S.freq, 2),
        'ts': time.time()
    }
    if S.tx_active:
        db_log_telemetry(S.voltage, S.current, S.wattage, S.freq)
    
    socketio.emit('telemetry_update', t, room='home')
    socketio.emit('telemetry_update', t, room='grid')
    socketio.emit('esp_telemetry', t, room='home')
    
    ok, v = S.check_safe()
    if not ok and S.tx_active:
        S.stop_tx("Overload")
        socketio.emit('overload_alert', {'violations': v, 'voltage': S.voltage, 'current': S.current, 'wattage': S.wattage}, room='home')
        socketio.emit('esp_relay_off', {}, room='grid_esp')
        socketio.emit('esp_relay_off', {}, room='home_esp')
        socketio.emit('transmission_halted', {'reason': 'Overload Trip'}, room='grid')
        socketio.emit('transmission_stop', {}, room='home')
        broadcast_state()

@socketio.on('grid_manual_relay')
def on_manual(d):
    ch = d.get('channel', 1)
    st = d.get('state', False)
    if ch == 1: 
        S.grid_ch1 = st
    else: 
        S.grid_ch2 = st
        
    if st:
        socketio.emit('esp_relay_on', {'channel': ch}, room='grid_esp')
    else:
        socketio.emit('esp_relay_off', {'channel': ch}, room='grid_esp')
        
    socketio.emit('relay_state_update', {'ch1': S.grid_ch1, 'ch2': S.grid_ch2, 'home': S.home_relay}, room='grid')
    broadcast_state()


def watchdog_loop():
    while True:
        time.sleep(1)
        if S.home_esp and S.last_heartbeat:
            if time.time() - S.last_heartbeat > 5.0:
                # Device lost
                S.home_esp = False
                S.home_connected = False
                S.last_heartbeat = None
                db_log_event("SYSTEM", "CRITICAL: ESP32 Device Offline (Heartbeat Lost)")
                if S.tx_active:
                    S.stop_tx("Heartbeat Lost")
                    socketio.emit('transmission_halted', {'reason': 'Hardware Disconnect'}, room='grid')
                    socketio.emit('transmission_stop', {}, room='home')
                broadcast_state()

if __name__ == '__main__':
    threading.Thread(target=watchdog_loop, daemon=True).start()

    print("\n" + "=" * 60)
    print("  WET MASTER SERVER v3.0 | Aditya Raj & Deepak Kumar Gupta")
    print("=" * 60)
    print(f"  Grid: http://localhost:5000/grid")
    print(f"  Home: http://localhost:5000/home")
    print("=" * 60 + "\n")
    # Production Watchdog handles timeouts instead of simulations
    socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)
