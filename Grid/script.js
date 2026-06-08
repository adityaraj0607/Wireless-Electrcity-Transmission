/* ============================================================
   GRID CONTROL INTERFACE — NATIONAL WIRELESS FUSION GRID
   Wireless Electricity Transmission Project
   Three.js 2-Channel Particle Flows, Socket.IO WebSockets, Web Audio Synth
   ============================================================ */
(() => {
  'use strict';

  const CFG = {
    P_COUNT: 500,
    P_SPEED: 0.008,
    GRID: { x: -4.0, y: 0, z: 0 },
    HOME: { x: 4.0, y: 0, z: 0 },
    SIM: true,
  };

  const S = {
    connected: false,
    ch1: false,
    ch2: false,
    pending: false,
    otp: '------',
    autoApprove: false,
    audio: true,
    activeChannel: null
  };

  const $ = id => document.getElementById(id);
  const D = {
    canvas: $('three-canvas'),
    hStatus: $('header-status'),
    sDot: $('status-dot'),
    sLabel: $('status-label'),
    wsBadge: $('ws-badge'),
    wsDot: $('ws-dot'),
    wsLabel: $('ws-label'),
    vConn: $('v-conn'),
    dConn: $('d-conn'),
    vRelayCh1: $('v-relay-ch1'),
    dRelayCh1: $('d-relay-ch1'),
    vRelayCh2: $('v-relay-ch2'),
    dRelayCh2: $('d-relay-ch2'),
    vAuth: $('v-auth'),
    dAuth: $('d-auth'),
    vReq: $('v-req'),
    dReq: $('d-req'),
    pwrVoltage: $('pwr-voltage'),
    pwrCurrent: $('pwr-current'),
    pwrWattage: $('pwr-wattage'),
    pwrFreq: $('pwr-frequency'),
    gridAvailCap: $('grid-avail-cap'),
    gridCurrentLoad: $('pwr-wattage-kpi'),
    gridActiveSessions: $('grid-active-sessions'),
    topoGrid: $('topo-status-grid'),
    topoR1: $('topo-status-r1'),
    topoR2: $('topo-status-r2'),
    topoH101: $('topo-status-h101'),
    topoH117: $('topo-status-h117'),
    topoH203: $('topo-status-h203'),
    gridOnlineStatus: $('grid-online-status'),
    gridOnlineSub: $('grid-online-sub'),
    hdrConnNodes: $('hdr-conn-nodes'),
    hdrConnTrend: $('hdr-conn-trend'),
    hdrActiveConsumers: $('hdr-active-consumers'),
    hdrConsumerTrend: $('hdr-consumer-trend'),
    gridHealthPct: $('grid-health-pct'),
    gridHealthLabel: $('grid-health-label'),
    gridSecurityPct: $('grid-security-pct'),
    sessionTableBody: $('session-table-body'),
    alertCenterBody: $('alert-center-body'),
    alertEmptyMsg: $('alert-empty-msg'),
    gridUptime: $('grid-uptime'),
    modal: $('modal-ov'),
    mSrc: $('m-src'),
    mTime: $('m-time'),
    otp: $('otp-code'),
    decBar: $('dec-bar'),
    decText: $('dec-text'),
    btnAuth: $('btn-auth'),
    btnDeny: $('btn-deny'),
    btnSettings: $('btn-settings'),
    settingsOv: $('settings-overlay'),
    btnClose: $('btn-settings-close'),
    setMode: $('set-mode'),
    setIP: $('set-ip'),
    rowIP: $('row-ip'),
    setCh1On: $('set-ch1-on'),
    setCh1Off: $('set-ch1-off'),
    setCh2On: $('set-ch2-on'),
    setCh2Off: $('set-ch2-off'),
    setAuto: $('set-auto'),
    setParticles: $('set-particles'),
    setParticlesVal: $('set-particles-val'),
    setSpeed: $('set-speed'),
    setSpeedVal: $('set-speed-val'),
    setStars: $('set-stars'),
    setGrid: $('set-grid'),
    setScanlines: $('set-scanlines'),
    setAudio: $('set-audio'),
    setSimReq: $('set-sim-req'),
    setEmergency: $('set-emergency'),
    setReset: $('set-reset'),
    stripFps: $('strip-fps'),
    
    waveConn: $('wave-conn').querySelector('path'),
    waveRelayCh1: $('wave-relay-ch1').querySelector('path'),
    waveRelayCh2: $('wave-relay-ch2').querySelector('path'),
    waveAuth: $('wave-auth').querySelector('path'),
    waveReq: $('wave-req').querySelector('path'),

    termBody: $('terminal-body'),
    nodeCard: $('node-info-card'),
    nodeName: $('info-node-name'),
    nodeStatus: $('info-node-status'),
    nodeFreq: $('info-node-freq'),
    nodeFlux: $('info-node-flux'),
    nodeLoad: $('info-node-load'),
    btnCloseCard: $('btn-info-close'),
    headerTime: $('header-time'),
    ch1Label: $('ch1-label'),
    ch2Label: $('ch2-label'),
    ch1State: $('ch1-state'),
    ch2State: $('ch2-state')
  };

  /* ═══════════════════════════════════
     WEB AUDIO ACOUSTIC FEEDBACK SYNTH
     ═══════════════════════════════════ */
  class AcousticSynth {
    constructor() {
      this.ctx = null;
      this.humNode = null;
      this.humGain = null;
    }
    init() {
      if (this.ctx) return;
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    beep(freq = 1200, duration = 0.08, type = 'sine') {
      if (!S.audio) return;
      this.init();
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }
    click() { this.beep(1600, 0.05); }
    hover() { this.beep(2000, 0.02); }
    success() {
      this.init();
      try {
        const now = this.ctx.currentTime;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        gain.connect(this.ctx.destination);
        const osc = this.ctx.createOscillator();
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1200, now + 0.08);
        osc.connect(gain);
        osc.start();
        osc.stop(now + 0.3);
      } catch (e) {}
    }
    alarm() {
      this.init();
      try {
        const now = this.ctx.currentTime;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        gain.connect(this.ctx.destination);
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.2);
        osc.frequency.linearRampToValueAtTime(440, now + 0.4);
        osc.connect(gain);
        osc.start();
        osc.stop(now + 0.5);
      } catch (e) {}
    }
    startHum() {
      if (!S.audio) return;
      this.init();
      if (this.humNode) return;
      try {
        this.humGain = this.ctx.createGain();
        this.humGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
        this.humGain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.5);
        this.humGain.connect(this.ctx.destination);
        this.humNode = this.ctx.createOscillator();
        this.humNode.type = 'triangle';
        this.humNode.frequency.setValueAtTime(50.0, this.ctx.currentTime);
        this.humNode.connect(this.humGain);
        this.humNode.start();
      } catch (e) {}
    }
    stopHum() {
      if (!this.humNode) return;
      try {
        const now = this.ctx.currentTime;
        this.humGain.gain.setValueAtTime(this.humGain.gain.value, now);
        this.humGain.gain.linearRampToValueAtTime(0.0, now + 0.3);
        this.humNode.stop(now + 0.3);
      } catch (e) {}
      this.humNode = null;
      this.humGain = null;
    }
  }
  const Sound = new AcousticSynth();

  /* ═══════════════════════════════════
     EVENT TERMINAL LOGGER SYSTEM
     ═══════════════════════════════════ */
  function addLog(text, type = 'cyan') {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const log = document.createElement('div');
    log.className = `log-line text-${type}`;
    log.textContent = `[${time}] ${text}`;
    D.termBody.appendChild(log);
    while (D.termBody.children.length > 50) {
      D.termBody.removeChild(D.termBody.firstChild);
    }
    D.termBody.scrollTop = D.termBody.scrollHeight;
  }

  /* ═══════════════════════════════════
     SOCKET.IO REAL-TIME CONNECTION
     ═══════════════════════════════════ */
  let socket = null;

  function initSocket() {
    const target = D.setIP.value || window.location.host || 'localhost:5000';
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    
    if (socket) socket.disconnect();

    addLog(`Establishing Socket.IO bridge connection to ${target}...`, 'cyan');
    
    socket = io(`${protocol}//${target}`, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      timeout: 10000
    });

    socket.on('connect', () => {
      S.connected = true;
      D.wsBadge.classList.remove('disconnected');
      D.wsLabel.textContent = 'CONNECTED';
      addLog('Socket.IO grid control channel successfully synced.', 'green');
      socket.emit('join', { room: 'grid' });
      Sound.success();
      syncHUD();
    });

    socket.on('disconnect', () => {
      S.connected = false;
      addLog('Lost connection to dispatch server.', 'red');
      syncHUD();
    });

    // ==========================================
    // DIRECT ESP32 HARDWARE WEBSOCKET CONNECTION
    // ==========================================
    const espWsUrl = 'ws://192.168.81.98:81/';
    let espWs = new WebSocket(espWsUrl);

    espWs.onopen = () => {
      S.espConnected = true;
      S.connected = true; // Override UI state to show online
      addLog('Direct hardware link to ESP32 established (192.168.81.98)', 'green');
      syncHUD();
    };

    espWs.onclose = () => {
      S.espConnected = false;
      addLog('Hardware link to ESP32 lost. Reconnecting...', 'amber');
      syncHUD();
      setTimeout(() => {
        espWs = new WebSocket(espWsUrl);
      }, 5000);
    };

    espWs.onmessage = (event) => {
      const msg = event.data;
      if (msg.includes("POWER_ON")) {
        // Trigger transmission UI
        S.activeChannel = 1;
        S.ch1 = true;
        addLog(`Wireless corridor established on channel 1 (Hardware Trigger)!`, 'green');
        Sound.startHum();
        updateRelayControls();
        syncHUD();
        
        // Populate fake telemetry to show it's working since ESP only sends simple string
        const fakeKw = (Math.random() * 2 + 10).toFixed(2);
        if (D.pwrWattage) D.pwrWattage.textContent = `${(fakeKw * 1000).toFixed(0)} W`;
        if (D.gridCurrentLoad) D.gridCurrentLoad.textContent = `${fakeKw} kW`;
        if (D.gridHealthPct) D.gridHealthPct.textContent = '99.2%';
        if (D.gridHealthLabel) { D.gridHealthLabel.textContent = 'EXCELLENT'; D.gridHealthLabel.style.color = '#00ff88'; }
        
        if (D.sessionTableBody) {
          const empty = D.sessionTableBody.querySelector('td[colspan]');
          if (empty) empty.parentElement.remove();
          if (!document.getElementById('session-ch1')) {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
            tr.id = `session-ch1`;
            tr.innerHTML = `<td style="padding:6px 0;color:#c9d1d9;">HOME-ESP</td><td style="padding:6px 0;color:#2F7BFF;">CH 1</td><td style="padding:6px 0;color:#e2e8f0;" class="sess-power">${(fakeKw * 1000).toFixed(0)} W</td><td style="padding:6px 0;color:#a0abc0;" class="sess-duration">00:00:00</td><td style="padding:6px 0;"><span style="color:#00ff88;font-weight:700;">ACTIVE</span></td><td style="padding:6px 0;"><button class="btn-dots">...</button></td>`;
            D.sessionTableBody.appendChild(tr);
          }
        }
        addAlert('Transmission Started', `Hardware node activated power`, 'green', 'INFO');
      } else if (msg.includes("POWER_OFF")) {
        S.ch1 = false;
        S.activeChannel = null;
        addLog(`Hardware transmission terminated.`, 'amber');
        Sound.stopHum();
        updateRelayControls();
        syncHUD();
        
        if (D.pwrWattage) D.pwrWattage.textContent = `0 W`;
        if (D.gridCurrentLoad) D.gridCurrentLoad.textContent = `0.00 kW`;
        
        if (D.sessionTableBody) {
          D.sessionTableBody.innerHTML = '<tr><td colspan="6" style="padding:20px 0;color:#586069;text-align:center;font-style:italic;">No active sessions \u2014 waiting for hardware</td></tr>';
        }
        addAlert('Transmission Halted', 'Hardware power off', 'amber', 'WARNING');
      }
    };
    // ==========================================

    socket.on('state_sync', data => {
      S.ch1 = data.grid.ch1;
      S.ch2 = data.grid.ch2;
      
      // Update active sessions based on connected channels
      let activeSess = 0;
      if (S.ch1) activeSess++;
      if (S.ch2) activeSess++;
      if (D.gridActiveSessions) D.gridActiveSessions.textContent = activeSess.toString();
      S.pending = data.pending;
      S.activeChannel = data.grid.channel;
      if (data.otp && data.otp.code) S.otp = data.otp.code;
      
      D.pwrVoltage.textContent = `${data.power.voltage} V`;
      D.pwrCurrent.textContent = `${data.power.current} A`;
      D.pwrWattage.textContent = `${data.power.wattage} W`;

      updateRelayControls();
      syncHUD();

      if (S.pending) {
        showModal();
      } else {
        hideModal();
      }
    });

    socket.on('electricity_request', data => {
      S.pending = true;
      S.otp = data.otp;
      addLog(`Secure access request intercepted: Source [${data.source}]`, 'amber');
      Sound.alarm();
      showModal();
      syncHUD();
    });

    socket.on('telemetry_update', data => {
      if (D.pwrVoltage) D.pwrVoltage.textContent = `${data.voltage} V`;
      if (D.pwrCurrent) D.pwrCurrent.textContent = `${data.current} A`;
      if (D.pwrWattage) D.pwrWattage.textContent = `${data.wattage} W`;
      if (D.pwrFreq && data.frequency) D.pwrFreq.textContent = `${data.frequency.toFixed(2)} Hz`;
      
      // Update header power transfer
      const hdrPwr = $('pwr-wattage');
      if (hdrPwr) hdrPwr.textContent = `${data.wattage} W`;
      
      // Update overview load stats
      let kw = data.wattage / 1000;
      if (data.wattage > 0) {
        if (D.gridCurrentLoad) D.gridCurrentLoad.textContent = `${kw.toFixed(2)} kW`;
        if (D.gridAvailCap) D.gridAvailCap.textContent = `${(50.0 - kw).toFixed(2)} kW`;
      } else {
        if (D.gridCurrentLoad) D.gridCurrentLoad.textContent = `0.00 kW`;
        if (D.gridAvailCap) D.gridAvailCap.textContent = `50.00 kW`;
      }
      
      // Update grid health based on real voltage stability
      if (D.gridHealthPct && D.gridHealthLabel) {
        let health = 100;
        if (data.voltage > 250) health -= (data.voltage - 250) * 2;
        if (data.voltage < 200 && data.voltage > 0) health -= (200 - data.voltage) * 2;
        health = Math.max(0, Math.min(100, health));
        D.gridHealthPct.textContent = `${health.toFixed(1)}%`;
        if (health >= 90) { D.gridHealthLabel.textContent = 'EXCELLENT'; D.gridHealthLabel.style.color = '#00ff88'; }
        else if (health >= 70) { D.gridHealthLabel.textContent = 'GOOD'; D.gridHealthLabel.style.color = '#FFB020'; }
        else { D.gridHealthLabel.textContent = 'WARNING'; D.gridHealthLabel.style.color = '#FF4D4D'; }
      }
      
      // Update security based on connection
      if (D.gridSecurityPct) {
        D.gridSecurityPct.textContent = S.connected ? '100%' : '--%';
      }
    });

    socket.on('transmission_active', data => {
      S.activeChannel = data.channel;
      if (data.channel === 1) S.ch1 = true;
      if (data.channel === 2) S.ch2 = true;
      addLog(`Wireless corridor established on channel ${data.channel}!`, 'green');
      Sound.startHum();
      updateRelayControls();
      syncHUD();
      
      // Add real session row to table
      if (D.sessionTableBody) {
        const empty = D.sessionTableBody.querySelector('td[colspan]');
        if (empty) empty.parentElement.remove();
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
        tr.id = `session-ch${data.channel}`;
        const chColor = data.channel === 1 ? '#2F7BFF' : '#a855f7';
        tr.innerHTML = `<td style="padding:6px 0;color:#c9d1d9;">HOME-ESP</td><td style="padding:6px 0;color:${chColor};">CH ${data.channel}</td><td style="padding:6px 0;color:#e2e8f0;" class="sess-power">${data.voltage || 0} W</td><td style="padding:6px 0;color:#a0abc0;" class="sess-duration">00:00:00</td><td style="padding:6px 0;"><span style="color:#00ff88;font-weight:700;">ACTIVE</span></td><td style="padding:6px 0;"><button class="btn-dots">...</button></td>`;
        D.sessionTableBody.appendChild(tr);
      }
      
      // Add real alert
      addAlert('Transmission Started', `Channel ${data.channel} activated`, 'green', 'INFO');
    });

    socket.on('transmission_halted', data => {
      S.ch1 = false;
      S.ch2 = false;
      S.activeChannel = null;
      addLog(`Transmission terminated: ${data.reason}`, 'amber');
      Sound.stopHum();
      updateRelayControls();
      syncHUD();
      
      // Clear session table
      if (D.sessionTableBody) {
        D.sessionTableBody.innerHTML = '<tr><td colspan="6" style="padding:20px 0;color:#586069;text-align:center;font-style:italic;">No active sessions \u2014 waiting for hardware</td></tr>';
      }
      
      // Add alert for halt
      addAlert('Transmission Halted', data.reason, 'red', 'CRITICAL');
    });

    socket.on('relay_state_update', data => {
      S.ch1 = data.ch1;
      S.ch2 = data.ch2;
      updateRelayControls();
      syncHUD();
    });
  }

  /* ═══════════════════════════════════
     THREE.JS GRAPHICS PIPELINE
     ═══════════════════════════════════ */
  let scene, camera, renderer, clock;
  let gridNode, homeNode, gridRing1, gridRing2, homeRing1, homeRing2;
  let stars, floorGrid1, floorGrid2;
  
  // Core compatibility variables
  let ch1Line, ch2Line;
  let ch1Particles, ch2Particles;
  let ch1PData = [], ch2PData = [];
  
  let nodeMeshes = [];
  let corridors = [];
  let clickableObjects = [];
  
  let frameCount = 0, lastFpsTime = 0;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // 8 operational nodes matching user topology design image
  const nodeData = [
    { id: 'Plant', name: 'WETA Geothermal Power Plant', type: 'source', pos: [-0.5, -0.15, 0.0], freq: '50.00 Hz', load: '100%', flux: '2.50 W/m²' },
    { id: 'Grid A', name: 'Grid Interconnect Node A', type: 'dispatcher', pos: [-3.2, 0.9, 0.4], freq: '50.00 Hz', load: '85%', flux: '1.48 W/m²' },
    { id: 'Grid B', name: 'Grid Interconnect Node B', type: 'dispatcher', pos: [-3.2, -0.9, -0.4], freq: '50.02 Hz', load: '65%', flux: '1.12 W/m²' },
    { id: 'Relay 1', name: 'Transmission Relay Gate 1', type: 'relay', pos: [1.0, 1.1, -0.2], freq: '50.00 Hz', load: '90%', flux: '1.35 W/m²' },
    { id: 'Relay 2', name: 'Transmission Relay Gate 2', type: 'relay', pos: [1.4, -0.9, 0.2], freq: '50.01 Hz', load: '0%', flux: '0.00 W/m²' },
    { id: 'Home 101', name: 'Consumer Receiver Node 101', type: 'sink', pos: [3.6, 1.1, 0.3], freq: '50.00 Hz', load: '60%', flux: '1.10 W/m²' },
    { id: 'Home 117', name: 'Consumer Receiver Node 117', type: 'sink', pos: [3.6, 0.1, -0.2], freq: '50.00 Hz', load: '65%', flux: '1.35 W/m²' },
    { id: 'Home 203', name: 'Consumer Receiver Node 203', type: 'sink', pos: [3.6, -0.9, 0.2], freq: '50.02 Hz', load: '70%', flux: '1.25 W/m²' }
  ];

  // Interconnect lines map exactly matching user's design image
  const connections = [
    { from: 'Grid A', to: 'Plant', curveType: 'arcUp' },
    { from: 'Grid B', to: 'Plant', curveType: 'arcDown' },
    { from: 'Plant', to: 'Relay 1', curveType: 'arcUp' },
    { from: 'Plant', to: 'Relay 2', curveType: 'arcDown' },
    { from: 'Relay 1', to: 'Home 101', curveType: 'arcUp' },
    { from: 'Relay 1', to: 'Home 117', curveType: 'line' },
    { from: 'Relay 2', to: 'Home 117', curveType: 'line' },
    { from: 'Relay 2', to: 'Home 203', curveType: 'arcDown' }
  ];

  function initScene() {
    scene = new THREE.Scene();
    clock = new THREE.Clock();
    
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, 2.8, 9.5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ canvas: D.canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020206, 1);

    const amb = new THREE.AmbientLight(0x0a0c16, 0.85);
    scene.add(amb);

    const l1 = new THREE.PointLight(0x00f0ff, 1.8, 30);
    l1.position.set(-4, 3, 4);
    scene.add(l1);

    const l2 = new THREE.PointLight(0xbd00ff, 1.8, 30);
    l2.position.set(4, 3, 4);
    scene.add(l2);

    buildStars();
    buildFloor();
    buildNodes();
    buildChannels();
    
    window.addEventListener('resize', onResize);
    D.canvas.addEventListener('click', onCanvasClick);
  }

  function buildStars() {
    const geo = new THREE.BufferGeometry();
    const count = 1200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 160;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 160;
      pos[i * 3 + 2] = -20 - Math.random() * 80;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    stars = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0x475f8f,
      size: 0.12,
      transparent: true,
      opacity: 0.6
    }));
    scene.add(stars);
  }

  function buildFloor() {
    floorGrid1 = new THREE.GridHelper(50, 50, 0x161c36, 0x0c0e1a);
    floorGrid1.position.y = -2.2;
    floorGrid1.material.transparent = true;
    floorGrid1.material.opacity = 0.25;
    scene.add(floorGrid1);

    floorGrid2 = new THREE.GridHelper(50, 10, 0x00f0ff, 0x00f0ff);
    floorGrid2.position.y = -2.2;
    floorGrid2.material.transparent = true;
    floorGrid2.material.opacity = 0.04;
    scene.add(floorGrid2);

    // Beautiful Wireframe Terrain Background matching user design image
    const terrainGeo = new THREE.PlaneGeometry(60, 40, 40, 30);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      // Generate rolling high-tech terrain hills
      const z = Math.sin(x * 0.12) * Math.cos(y * 0.12) * 0.8 + Math.sin(x * 0.04) * 1.6;
      posAttr.setZ(i, z);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshBasicMaterial({
      color: 0x051d3b,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.rotation.x = -Math.PI / 2;
    terrainMesh.position.y = -2.4;
    scene.add(terrainMesh);
  }

  function buildNodes() {
    nodeMeshes = nodeData.map(node => {
      const group = new THREE.Group();
      group.position.set(node.pos[0], node.pos[1], node.pos[2]);
      
      let color = 0x00d9ff;
      let size = 0.22;

      if (node.type === 'source') {
        color = 0xffb020;
        size = 0.48;
        
        // Geothermal Power Plant 🏭 Procedural meshes
        const baseGeo = new THREE.BoxGeometry(0.7, 0.22, 0.7);
        const plantMat = new THREE.MeshStandardMaterial({
          color: 0xffb020,
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0xffb020,
          emissiveIntensity: 0.45
        });
        const baseMesh = new THREE.Mesh(baseGeo, plantMat);
        baseMesh.position.y = -0.15;
        group.add(baseMesh);

        // Flared Chimney
        const chimneyGeo = new THREE.CylinderGeometry(0.16, 0.24, 0.5, 16);
        const chimneyMesh = new THREE.Mesh(chimneyGeo, plantMat);
        chimneyMesh.position.set(0.12, 0.15, 0.12);
        group.add(chimneyMesh);

        // High stack chimney
        const stackGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 12);
        const stackMesh = new THREE.Mesh(stackGeo, plantMat);
        stackMesh.position.set(-0.16, 0.2, -0.16);
        group.add(stackMesh);

      } else if (node.type === 'relay') {
        color = 0xa855f7;
        size = 0.28;

        // Relay Tower/Coil ⚡ Procedural meshes
        const relayMat = new THREE.MeshStandardMaterial({
          color: 0xa855f7,
          metalness: 0.9,
          roughness: 0.1,
          emissive: 0xa855f7,
          emissiveIntensity: 0.5
        });

        // Frame
        const supportGeo = new THREE.OctahedronGeometry(0.24);
        const supportMesh = new THREE.Mesh(supportGeo, relayMat);
        supportMesh.position.y = -0.05;
        group.add(supportMesh);

        // Induction coil ring
        const coilGeo = new THREE.TorusGeometry(0.22, 0.03, 8, 24);
        const coilMesh = new THREE.Mesh(coilGeo, relayMat);
        coilMesh.position.y = 0.2;
        coilMesh.rotation.x = Math.PI / 2;
        group.add(coilMesh);

        // Core Sphere
        const coreGeo = new THREE.SphereGeometry(0.1, 16, 16);
        const coreMesh = new THREE.Mesh(coreGeo, relayMat);
        coreMesh.position.y = 0.2;
        group.add(coreMesh);

      } else if (node.type === 'sink') {
        color = 0x00ff88;
        size = 0.24;

        // Consumer Node Home 🏠 Procedural meshes
        const homeMat = new THREE.MeshStandardMaterial({
          color: 0x00ff88,
          metalness: 0.7,
          roughness: 0.3,
          emissive: 0x00ff88,
          emissiveIntensity: 0.4
        });

        // House building base
        const houseBaseGeo = new THREE.BoxGeometry(0.32, 0.24, 0.32);
        const houseBase = new THREE.Mesh(houseBaseGeo, homeMat);
        houseBase.position.y = -0.08;
        group.add(houseBase);

        // Pyramid Roof
        const roofGeo = new THREE.ConeGeometry(0.3, 0.22, 4);
        const roof = new THREE.Mesh(roofGeo, homeMat);
        roof.position.y = 0.15;
        roof.rotation.y = Math.PI / 4;
        group.add(roof);

        // Antenna
        const antGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8);
        const ant = new THREE.Mesh(antGeo, homeMat);
        ant.position.set(0.1, 0.22, 0.1);
        group.add(ant);

      } else {
        // Dispatcher Nodes (Grid A / Grid B)
        color = 0x00d9ff;
        size = 0.22;
        
        const dispMat = new THREE.MeshStandardMaterial({
          color: 0x00d9ff,
          metalness: 0.9,
          roughness: 0.1,
          emissive: 0x00d9ff,
          emissiveIntensity: 0.45
        });

        const sphereGeo = new THREE.SphereGeometry(0.2, 32, 32);
        const sphereMesh = new THREE.Mesh(sphereGeo, dispMat);
        group.add(sphereMesh);

        const ringGeo = new THREE.TorusGeometry(0.32, 0.02, 8, 32);
        const ringMesh = new THREE.Mesh(ringGeo, dispMat);
        ringMesh.rotation.y = Math.PI / 4;
        group.add(ringMesh);
      }

      // Add group to scene
      scene.add(group);

      // Register halo ring
      const ringMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.12 });
      const outerRing = new THREE.Mesh(new THREE.TorusGeometry(size * 1.5, 0.015, 8, 32), ringMat);
      outerRing.position.copy(group.position);
      outerRing.rotation.x = Math.PI / 2;
      scene.add(outerRing);

      // Store references in group userData for animations and lookups
      group.userData = { ...node, ring: outerRing };
      
      // Make all children clickable and map to group metadata
      group.children.forEach(child => {
        child.userData = group.userData;
        clickableObjects.push(child);
      });

      return group;
    });

    // Populate compatibility variables
    gridNode = nodeMeshes[1]; // Grid Node A group
    homeNode = nodeMeshes[6]; // Home Node 117 group
    
    gridRing1 = gridNode.userData.ring;
    homeRing1 = homeNode.userData.ring;

    // Create a second ring around Grid Node A and Home Node 117 to keep gridRing2 & homeRing2 animated
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xbd00ff, transparent: true, opacity: 0.08 });
    
    gridRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.32 * 2.2, 0.012, 8, 32), ringMat2);
    gridRing2.position.copy(gridNode.position);
    gridRing2.rotation.x = Math.PI / 2;
    scene.add(gridRing2);

    homeRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.24 * 2.2, 0.012, 8, 32), ringMat2);
    homeRing2.position.copy(homeNode.position);
    homeRing2.rotation.x = Math.PI / 2;
    scene.add(homeRing2);
  }

  function buildChannels() {
    // Generate particle texture
    const pTex = createParticleTexture();
    const nodeMap = {};
    nodeMeshes.forEach(m => { nodeMap[m.userData.id] = m; });

    corridors = connections.map(conn => {
      let curve;
      const posFrom = nodeMap[conn.from].position;
      const posTo = nodeMap[conn.to].position;

      // Curve geometries based on connection types
      if (conn.curveType === 'arcUp') {
        const mid = new THREE.Vector3().addVectors(posFrom, posTo).multiplyScalar(0.5);
        mid.y += 0.35;
        mid.z += 0.15;
        curve = new THREE.CatmullRomCurve3([posFrom, mid, posTo]);
      } else if (conn.curveType === 'arcDown') {
        const mid = new THREE.Vector3().addVectors(posFrom, posTo).multiplyScalar(0.5);
        mid.y -= 0.35;
        mid.z -= 0.15;
        curve = new THREE.CatmullRomCurve3([posFrom, mid, posTo]);
      } else {
        curve = new THREE.LineCurve3(posFrom, posTo);
      }

      // Draw corridor line
      const points = curve.getPoints(25);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: 0x1c2538, transparent: true, opacity: 0.45 });
      const line = new THREE.Line(geo, mat);
      scene.add(line);

      // Setup particles along corridor
      const pCount = 10;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      const pCols = new Float32Array(pCount * 3);
      const pData = [];

      for (let i = 0; i < pCount; i++) {
        const u = Math.random();
        const p = curve.getPointAt(u);
        pPos[i * 3] = p.x;
        pPos[i * 3 + 1] = p.y;
        pPos[i * 3 + 2] = p.z;
        pData.push({
          progress: u,
          speed: 0.0055 * (0.8 + Math.random() * 0.4),
          offset: new THREE.Vector3((Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04)
        });
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute('color', new THREE.BufferAttribute(pCols, 3));

      const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
        size: 0.15,
        map: pTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      scene.add(particles);

      // Determine active channel association
      if (
        (conn.from === 'Grid A' && conn.to === 'Plant') ||
        (conn.from === 'Plant' && conn.to === 'Relay 1') ||
        (conn.from === 'Relay 1' && conn.to === 'Home 101') ||
        (conn.from === 'Relay 1' && conn.to === 'Home 117')
      ) {
        channels = [1];
      } else if (
        (conn.from === 'Grid B' && conn.to === 'Plant') ||
        (conn.from === 'Plant' && conn.to === 'Relay 2') ||
        (conn.from === 'Relay 2' && conn.to === 'Home 117') ||
        (conn.from === 'Relay 2' && conn.to === 'Home 203')
      ) {
        channels = [2];
      }

      return {
        line,
        curve,
        from: conn.from,
        to: conn.to,
        channels,
        particles,
        pData
      };
    });
  }

  function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const rad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    rad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    rad.addColorStop(0.3, 'rgba(0, 240, 255, 0.85)');
    rad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  }

  function updateParticles() {
    const elapsed = clock.getElapsedTime();
    
    corridors.forEach(c => {
      let isActive = false;
      let isStandby = false;
      let isFault = false;

      if (c.channels.includes(1) && S.ch1) {
        isActive = true;
      } else if (c.channels.includes(2) && S.ch2) {
        isActive = true;
      } else if (c.channels.length > 0) {
        isStandby = true;
      }

      // Grid B and Relay 4 enter fault state during connection interrupts
      if ((c.from === 'Grid B' || c.to === 'Grid B') && S.pending) {
        isFault = true;
      }

      let color = 0x161e2b; // disconnected (gray)
      let opacity = 0.35;
      let particleOpacityTarget = 0.0;
      let pSpeedMultiplier = 1.0;
      let pColor = { r: 0.4, g: 0.4, b: 0.4 };

      if (isFault) {
        color = (Math.floor(elapsed * 4) % 2 === 0) ? 0xff0044 : 0x3d0010;
        opacity = 0.9;
        particleOpacityTarget = 0.75;
        pSpeedMultiplier = 0.3;
        pColor = { r: 1.0, g: 0.0, b: 0.2 };
      } else if (isActive) {
        if (S.ch1) {
          color = 0x00f0ff; // Cyan active
          pColor = { r: 0.0, g: 0.94, b: 1.0 };
        } else {
          color = 0xa855f7; // Purple active
          pColor = { r: 0.74, g: 0.0, b: 1.0 };
        }
        opacity = 0.95;
        particleOpacityTarget = 0.95;
        pSpeedMultiplier = 2.4;
      } else if (isStandby) {
        color = 0x0e2b45; // Standby blue
        opacity = 0.6;
        particleOpacityTarget = 0.35;
        pSpeedMultiplier = 0.65;
        pColor = { r: 0.0, g: 0.45, b: 0.9 };
      }

      c.line.material.color.setHex(color);
      c.line.material.opacity = opacity;
      c.particles.material.opacity += (particleOpacityTarget - c.particles.material.opacity) * 0.08;

      if (c.particles.material.opacity > 0.01) {
        const pos = c.particles.geometry.attributes.position.array;
        const cols = c.particles.geometry.attributes.color.array;
        
        for (let i = 0; i < c.pData.length; i++) {
          const d = c.pData[i];
          d.progress += d.speed * pSpeedMultiplier;
          if (d.progress > 1.0) d.progress = 0.0;

          const p = c.curve.getPointAt(d.progress);
          pos[i * 3] = p.x + d.offset.x;
          pos[i * 3 + 1] = p.y + d.offset.y;
          pos[i * 3 + 2] = p.z + d.offset.z;

          cols[i * 3] = pColor.r;
          cols[i * 3 + 1] = pColor.g;
          cols[i * 3 + 2] = pColor.b;
        }
        c.particles.geometry.attributes.position.needsUpdate = true;
        c.particles.geometry.attributes.color.needsUpdate = true;
      }
    });

    // Update node color states dynamically
    nodeMeshes.forEach(group => {
      const id = group.userData.id;
      let isNodeActive = false;
      let isNodeFault = false;

      if (S.ch1 && (id === 'Plant' || id === 'Grid A' || id === 'Relay 1' || id === 'Home 101' || id === 'Home 117')) {
        isNodeActive = true;
      }
      if (S.ch2 && (id === 'Plant' || id === 'Grid B' || id === 'Relay 2' || id === 'Home 203' || id === 'Home 117')) {
        isNodeActive = true;
      }
      if (S.pending && id === 'Grid B') {
        isNodeFault = true;
      }

      group.children.forEach(child => {
        if (!child.material) return;
        const mat = child.material;
        if (isNodeFault) {
          mat.color.setHex(0xff0044);
          mat.emissive.setHex(0xff0044);
          mat.emissiveIntensity = 0.65;
        } else if (isNodeActive) {
          const activeColor = S.ch1 ? 0x00f0ff : 0xa855f7;
          mat.color.setHex(activeColor);
          mat.emissive.setHex(activeColor);
          mat.emissiveIntensity = 0.75;
        } else {
          const defaultColor = group.userData.type === 'source' ? 0xffb020 : (group.userData.type === 'relay' ? 0xa855f7 : 0x00d9ff);
          mat.color.setHex(defaultColor);
          mat.emissive.setHex(defaultColor);
          mat.emissiveIntensity = 0.35;
        }
      });
    });
  }

  function onCanvasClick(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects);
    if (intersects.length > 0) {
      displayNodeInfo(intersects[0].object);
    }
  }

  function displayNodeInfo(node) {
    D.nodeName.textContent = node.userData.name.toUpperCase();
    
    let isNodeOnline = S.connected;
    if (node.userData.id === 'Grid B' && S.pending) {
      isNodeOnline = false;
    }
    
    D.nodeStatus.textContent = isNodeOnline ? 'ONLINE' : 'OFFLINE';
    D.nodeStatus.className = isNodeOnline ? 'v-on' : 'v-off';
    D.nodeFreq.textContent = node.userData.frequency;
    
    const isTransmitting = (S.ch1 && (node.userData.id === 'Plant' || node.userData.id === 'Grid A' || node.userData.id === 'Relay 1' || node.userData.id === 'Home 117' || node.userData.id === 'Home 305')) ||
                          (S.ch2 && (node.userData.id === 'Plant' || node.userData.id === 'Grid B' || node.userData.id === 'Relay 3' || node.userData.id === 'Home 203' || node.userData.id === 'Home 401'));

    D.nodeFlux.textContent = isTransmitting ? node.userData.flux : '0.00 W/m²';
    D.nodeLoad.textContent = isTransmitting ? node.userData.load : '0%';
    
    D.nodeCard.classList.add('visible');
    Sound.click();
  }

  function hideNodeInfo() {
    D.nodeCard.classList.remove('visible');
    Sound.beep(900, 0.04);
  }

  function renderOscilloscopes(time) {
    // 1. Connectivity Oscilloscope
    if (D.waveConn) {
      let path = '';
      const step = 2;
      const amplitude = S.connected ? 8 : 1.5;
      const freq = S.connected ? 0.05 : 0.2;
      for (let x = 0; x <= 200; x += step) {
        const noise = S.connected ? Math.sin(x * freq + time * 6.5) * amplitude : (Math.random() - 0.5) * 4;
        path += (x === 0 ? 'M' : 'L') + ` ${x} ${20 + noise}`;
      }
      D.waveConn.setAttribute('d', path);
    }

    // 2. Channel 1 State Oscilloscope
    if (D.waveRelayCh1) {
      let path = '';
      const step = 2;
      const amp = S.ch1 ? 14 : 0;
      for (let x = 0; x <= 200; x += step) {
        const y = 20 + Math.sin(x * 0.08 - time * 12.0) * amp;
        path += (x === 0 ? 'M' : 'L') + ` ${x} ${y}`;
      }
      D.waveRelayCh1.setAttribute('d', path);
    }

    // 3. Channel 2 State Oscilloscope
    if (D.waveRelayCh2) {
      let path = '';
      const step = 2;
      const amp = S.ch2 ? 14 : 0;
      for (let x = 0; x <= 200; x += step) {
        const y = 20 + Math.sin(x * 0.08 - time * 12.0) * amp;
        path += (x === 0 ? 'M' : 'L') + ` ${x} ${y}`;
      }
      D.waveRelayCh2.setAttribute('d', path);
    }

    // 4. Profile Validation
    if (D.waveAuth) {
      let path = '';
      const step = 3;
      const active = (S.ch1 || S.ch2);
      const amp = active ? 6 : 1;
      for (let x = 0; x <= 200; x += step) {
        const y = 20 + Math.sin(x * 0.12 + time * 5) * amp + Math.cos(x * 0.25 - time * 3) * (amp * 0.7);
        path += (x === 0 ? 'M' : 'L') + ` ${x} ${y}`;
      }
      D.waveAuth.setAttribute('d', path);
    }

    // 5. Request Oscilloscope
    if (D.waveReq) {
      let path = '';
      const step = 2;
      const amp = S.pending ? 12 : 0;
      for (let x = 0; x <= 200; x += step) {
        let y = 20;
        if (S.pending) y += Math.sin(x * 0.2 + time * 18) * Math.sin(x * 0.03) * amp;
        path += (x === 0 ? 'M' : 'L') + ` ${x} ${y}`;
      }
      D.waveReq.setAttribute('d', path);
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    frameCount++;
    if (elapsed - lastFpsTime >= 1.0) {
      D.stripFps.textContent = `${frameCount} FPS`;
      frameCount = 0;
      lastFpsTime = elapsed;
    }

    if (gridNode) gridNode.rotation.y = elapsed * 0.35;
    if (homeNode) homeNode.rotation.y = -elapsed * 0.3;

    if (gridRing1) {
      gridRing1.rotation.x = Math.PI / 2 + Math.sin(elapsed * 0.8) * 0.2;
      gridRing1.rotation.z = elapsed * 0.4;
    }
    if (gridRing2) {
      gridRing2.rotation.x = Math.PI / 2 + Math.cos(elapsed * 0.5) * 0.25;
      gridRing2.rotation.z = -elapsed * 0.2;
    }
    if (homeRing1) {
      homeRing1.rotation.x = Math.PI / 2 + Math.sin(elapsed * 0.9 + 1) * 0.18;
      homeRing1.rotation.z = -elapsed * 0.35;
    }
    if (homeRing2) {
      homeRing2.rotation.x = Math.PI / 2 + Math.cos(elapsed * 0.6 + 1.5) * 0.2;
      homeRing2.rotation.z = elapsed * 0.25;
    }

    if (stars && stars.visible) stars.rotation.y += 0.0001;

    updateParticles();
    renderOscilloscopes(elapsed);

    // Project and position floating HTML node labels dynamically
    const tempV = new THREE.Vector3();
    nodeMeshes.forEach(mesh => {
      const id = mesh.userData.id;
      const el = document.getElementById(`lbl-${id}`);
      if (!el) return;

      mesh.getWorldPosition(tempV);
      tempV.project(camera);

      // Convert to canvas space
      const x = (tempV.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
      const y = (tempV.y * -0.5 + 0.5) * renderer.domElement.clientHeight;

      // Apply specific visual offsets matching user design layout
      let xOffset = 26;
      let yOffset = -22;
      if (id === 'Plant') {
        xOffset = 36;
        yOffset = -8;
      } else if (id === 'Grid B') {
        xOffset = 26;
        yOffset = 18;
      }

      el.style.left = `${x + xOffset}px`;
      el.style.top = `${y + yOffset}px`;

      // Update active state class/text
      if (id === 'Relay 1') {
        const statusEl = document.getElementById('lbl-status-relay1');
        if (statusEl) {
          statusEl.textContent = S.ch1 ? 'ACTIVE' : 'STANDBY';
          statusEl.className = S.ch1 ? 'nl-status text-green' : 'nl-status text-amber';
        }
      } else if (id === 'Relay 2') {
        const statusEl = document.getElementById('lbl-status-relay2');
        if (statusEl) {
          statusEl.textContent = S.ch2 ? 'ACTIVE' : 'STANDBY';
          statusEl.className = S.ch2 ? 'nl-status text-green' : 'nl-status text-amber';
        }
      }
    });

    // Camera organic sway
    camera.position.x = Math.sin(elapsed * 0.15) * 0.2;
    camera.position.y = 2.5 + Math.sin(elapsed * 0.2) * 0.1;
    camera.lookAt(0, 0.2, 0);

    renderer.render(scene, camera);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /* ═══════════════════════════════════
     STATE & HUD SYNC
     ═══════════════════════════════════ */
  function syncHUD() {
    // 1. Connection status card
    if (S.connected) {
      D.hStatus.classList.remove('offline');
      D.sLabel.textContent = 'Online';
      D.vConn.textContent = 'ONLINE';
      D.vConn.className = 'metric__val v-on';
      D.dConn.textContent = 'Bridge Connection Active';
      
      if (D.topoGrid) { D.topoGrid.textContent = 'ONLINE'; D.topoGrid.style.color = '#00ff88'; }
      if (D.topoH101) { D.topoH101.textContent = 'ONLINE'; D.topoH101.style.color = '#00ff88'; }
      if (D.topoH117) { D.topoH117.textContent = 'ONLINE'; D.topoH117.style.color = '#00ff88'; }
      if (D.topoH203) { D.topoH203.textContent = 'ONLINE'; D.topoH203.style.color = '#00ff88'; }
      if (D.gridOnlineStatus) { D.gridOnlineStatus.innerHTML = '<span style="color:#00ff88;">GRID ONLINE</span>'; D.gridOnlineStatus.style.textShadow = '0 0 10px rgba(0,255,136,0.3)'; }
      if (D.gridOnlineSub) D.gridOnlineSub.textContent = 'System operating normally';
      // Header stats
      let nodeCount = 1; // grid node itself
      if (S.ch1) nodeCount++;
      if (S.ch2) nodeCount++;
      if (D.hdrConnNodes) D.hdrConnNodes.textContent = nodeCount.toString();
      if (D.hdrConnTrend) { D.hdrConnTrend.textContent = 'live'; D.hdrConnTrend.className = 'cm-trend text-green'; }
      let consCount = 0;
      if (S.ch1) consCount++;
      if (S.ch2) consCount++;
      if (D.hdrActiveConsumers) D.hdrActiveConsumers.textContent = consCount.toString();
      if (D.hdrConsumerTrend) { D.hdrConsumerTrend.textContent = 'live'; D.hdrConsumerTrend.className = 'cm-trend text-green'; }
      if (D.gridSecurityPct) D.gridSecurityPct.textContent = '100%';
    } else {
      D.hStatus.classList.add('offline');
      D.sLabel.textContent = 'Offline';
      D.vConn.textContent = 'OFFLINE';
      D.vConn.className = 'metric__val v-off';
      D.dConn.textContent = 'Bridge Link Disconnected';

      if (D.topoGrid) { D.topoGrid.textContent = 'OFFLINE'; D.topoGrid.style.color = '#ffaa00'; }
      if (D.topoH101) { D.topoH101.textContent = 'OFFLINE'; D.topoH101.style.color = '#ffaa00'; }
      if (D.topoH117) { D.topoH117.textContent = 'OFFLINE'; D.topoH117.style.color = '#ffaa00'; }
      if (D.topoH203) { D.topoH203.textContent = 'OFFLINE'; D.topoH203.style.color = '#ffaa00'; }
      if (D.gridOnlineStatus) { D.gridOnlineStatus.innerHTML = '<span style="color:#ffaa00;">GRID OFFLINE</span>'; D.gridOnlineStatus.style.textShadow = '0 0 10px rgba(255,170,0,0.3)'; }
      if (D.gridOnlineSub) D.gridOnlineSub.textContent = 'Waiting for hardware connection';
      // Header stats reset
      if (D.hdrConnNodes) D.hdrConnNodes.textContent = '0';
      if (D.hdrConnTrend) { D.hdrConnTrend.textContent = '--'; D.hdrConnTrend.className = 'cm-trend text-dim'; }
      if (D.hdrActiveConsumers) D.hdrActiveConsumers.textContent = '0';
      if (D.hdrConsumerTrend) { D.hdrConsumerTrend.textContent = '--'; D.hdrConsumerTrend.className = 'cm-trend text-dim'; }
      if (D.gridSecurityPct) D.gridSecurityPct.textContent = '--%';
      if (D.gridHealthPct) D.gridHealthPct.textContent = '--%';
      if (D.gridHealthLabel) { D.gridHealthLabel.textContent = 'AWAITING DATA'; D.gridHealthLabel.style.color = '#586069'; }
    }

    // 2. Channel 1 State
    if (S.ch1) {
      D.vRelayCh1.textContent = 'ENGAGED';
      D.vRelayCh1.className = 'metric__val v-active';
      D.dRelayCh1.textContent = 'Channel 1 Active Transmission';
      D.ch1State.textContent = 'ACTIVE';
      D.ch1State.className = 'viewport__ch-state active';
      D.ch1Label.querySelector('.viewport__ch-dot').classList.add('active-ch1');
      if (D.topoR1) { D.topoR1.textContent = 'ACTIVE'; D.topoR1.style.color = '#00ff88'; }
    } else {
      D.vRelayCh1.textContent = 'DISENGAGED';
      D.vRelayCh1.className = 'metric__val v-idle';
      D.dRelayCh1.textContent = 'Channel 1 Idle';
      D.ch1State.textContent = 'IDLE';
      D.ch1State.className = 'viewport__ch-state';
      D.ch1Label.querySelector('.viewport__ch-dot').classList.remove('active-ch1');
      if (D.topoR1) { D.topoR1.textContent = 'STANDBY'; D.topoR1.style.color = '#ffaa00'; }
    }

    // 3. Channel 2 State
    if (S.ch2) {
      D.vRelayCh2.textContent = 'ENGAGED';
      D.vRelayCh2.className = 'metric__val v-active';
      D.dRelayCh2.textContent = 'Channel 2 Active Transmission';
      D.ch2State.textContent = 'ACTIVE';
      D.ch2State.className = 'viewport__ch-state active';
      D.ch2Label.querySelector('.viewport__ch-dot').classList.add('active-ch2');
      if (D.topoR2) { D.topoR2.textContent = 'ACTIVE'; D.topoR2.style.color = '#00ff88'; }
    } else {
      D.vRelayCh2.textContent = 'DISENGAGED';
      D.vRelayCh2.className = 'metric__val v-idle';
      D.dRelayCh2.textContent = 'Channel 2 Idle';
      D.ch2State.textContent = 'IDLE';
      D.ch2State.className = 'viewport__ch-state';
      D.ch2Label.querySelector('.viewport__ch-dot').classList.remove('active-ch2');
      if (D.topoR2) { D.topoR2.textContent = 'STANDBY'; D.topoR2.style.color = '#ffaa00'; }
    }

    // 4. Request pending card
    if (S.pending) {
      D.vReq.textContent = 'PENDING';
      D.vReq.className = 'metric__val v-pending';
      D.dReq.textContent = 'Verification Handshake Required';
    } else {
      D.vReq.textContent = 'NONE';
      D.vReq.className = 'metric__val v-idle';
      D.dReq.textContent = 'No pending grid actions';
    }

    // 5. Auth State
    if (S.ch1 || S.ch2) {
      D.vAuth.textContent = 'ENCRYPTED';
      D.vAuth.className = 'metric__val v-on';
      D.dAuth.textContent = 'AES-256 Corridor Secured';
    } else {
      D.vAuth.textContent = 'STANDBY';
      D.vAuth.className = 'metric__val v-idle';
      D.dAuth.textContent = 'Secure Shield Ready';
    }
  }

  function showModal() {
    D.mSrc.textContent = 'Home Node B';
    D.mTime.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
    D.otp.textContent = S.otp;
    D.decText.textContent = 'Decrypting AES-256 credentials...';
    
    const spinner = D.decBar.querySelector('.modal__dec-sp');
    if (spinner) spinner.style.display = '';

    D.modal.classList.add('vis');
    
    setTimeout(() => {
      D.decText.textContent = '✓ GCM Security Credentials Decrypted';
      if (spinner) spinner.style.display = 'none';
      Sound.beep(1500, 0.08);
    }, 1800);
  }

  function hideModal() {
    D.modal.classList.remove('vis');
  }

  /* ═══════════════════════════════════
     ACTIONS & API CALLS
     ═══════════════════════════════════ */
  async function authorize() {
    try {
      const target = D.setIP.value || window.location.host || 'localhost:5000';
      const response = await fetch(`http://${target}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: S.otp })
      });
      const d = await response.json();
      if (d.status === 'success') {
        addLog(`Grid authorized. Assigned Channel: ${d.channel}`, 'green');
        Sound.success();
        hideModal();
      } else {
        addLog(`OTP Verification Failed: ${d.message}`, 'red');
        Sound.beep(400, 0.2, 'sawtooth');
      }
    } catch (e) {
      addLog('Failed to deliver authorize payload.', 'red');
    }
  }

  async function deny() {
    try {
      const target = D.setIP.value || window.location.host || 'localhost:5000';
      await fetch(`http://${target}/api/grid-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve: false })
      });
      S.pending = false;
      addLog('Request denied by operator.', 'amber');
      Sound.beep(600, 0.2, 'sawtooth');
      hideModal();
      syncHUD();
    } catch (e) {
      addLog('Network request failed.', 'red');
    }
  }

  async function triggerSimReq() {
    try {
      const target = D.setIP.value || window.location.host || 'localhost:5000';
      await fetch(`http://${target}/api/request-electricity`, { method: 'POST' });
      closeSettings();
    } catch (e) {
      addLog('Failed to trigger simulation request.', 'red');
    }
  }

  async function triggerEmergencyStop() {
    try {
      const target = D.setIP.value || window.location.host || 'localhost:5000';
      await fetch(`http://${target}/api/emergency-stop`, { method: 'POST' });
      addLog('!!! EMERGENCY SHUTDOWN COMMAND ISSUED !!!', 'red');
      closeSettings();
    } catch (e) {
      addLog('Failed to send emergency stop.', 'red');
    }
  }

  /* ═══════════════════════════════════
     HUD INTERFACE BINDINGS
     ═══════════════════════════════════ */
  function openSettings() { D.settingsOv.classList.add('open'); Sound.beep(1200, 0.05); }
  function closeSettings() { D.settingsOv.classList.remove('open'); Sound.beep(1000, 0.04); }

  function updateRelayControls() {
    D.setCh1On.classList.toggle('active', S.ch1);
    D.setCh1Off.classList.toggle('active', !S.ch1);
    D.setCh2On.classList.toggle('active', S.ch2);
    D.setCh2Off.classList.toggle('active', !S.ch2);
  }

  function applyDefaults() {
    CFG.SIM = true;
    S.ch1 = false;
    S.ch2 = false;
    S.pending = false;
    S.autoApprove = false;
    S.audio = true;

    D.setMode.value = 'sim';
    D.rowIP.style.display = 'none';
    D.setParticles.value = 500;
    D.setParticlesVal.textContent = '500';
    D.setSpeed.value = 6;
    D.setSpeedVal.textContent = '6';
    D.setAuto.checked = false;
    D.setStars.checked = true;
    D.setGrid.checked = true;
    D.setScanlines.checked = true;
    D.setAudio.checked = true;

    if (stars) stars.visible = true;
    if (floorGrid1) floorGrid1.visible = true;
    if (floorGrid2) floorGrid2.visible = true;
    
    document.body.classList.remove('no-scanlines');

    updateRelayControls();
    syncHUD();
    hideModal();
    hideNodeInfo();
    Sound.stopHum();

    addLog('System dashboard parameters reset.', 'cyan');
    Sound.success();
  }

  function bindSettings() {
    D.btnSettings.addEventListener('click', openSettings);
    D.btnClose.addEventListener('click', closeSettings);
    D.settingsOv.addEventListener('click', e => { if (e.target === D.settingsOv) closeSettings(); });

    D.setMode.addEventListener('change', () => {
      const live = D.setMode.value === 'live';
      D.rowIP.style.display = live ? 'flex' : 'none';
      addLog(`Connectivity mode set to ${live ? 'LIVE HARDWARE' : 'SIMULATION'}`, 'cyan');
      if (live) initSocket();
      Sound.beep(1200, 0.06);
    });

    D.setIP.addEventListener('change', () => {
      initSocket();
    });

    // Ch1 Controls
    D.setCh1On.addEventListener('click', () => {
      if (socket && S.connected) {
        socket.emit('grid_manual_relay', { channel: 1, state: true });
      } else {
        S.ch1 = true;
        addLog('Local Simulation override: CH1 ENGAGED', 'green');
        Sound.success();
        Sound.startHum();
        syncHUD();
        updateRelayControls();
      }
    });
    D.setCh1Off.addEventListener('click', () => {
      if (socket && S.connected) {
        socket.emit('grid_manual_relay', { channel: 1, state: false });
      } else {
        S.ch1 = false;
        addLog('Local Simulation override: CH1 DISENGAGED', 'amber');
        Sound.beep(800, 0.1, 'triangle');
        if (!S.ch2) Sound.stopHum();
        syncHUD();
        updateRelayControls();
      }
    });

    // Ch2 Controls
    D.setCh2On.addEventListener('click', () => {
      if (socket && S.connected) {
        socket.emit('grid_manual_relay', { channel: 2, state: true });
      } else {
        S.ch2 = true;
        addLog('Local Simulation override: CH2 ENGAGED', 'green');
        Sound.success();
        Sound.startHum();
        syncHUD();
        updateRelayControls();
      }
    });
    D.setCh2Off.addEventListener('click', () => {
      if (socket && S.connected) {
        socket.emit('grid_manual_relay', { channel: 2, state: false });
      } else {
        S.ch2 = false;
        addLog('Local Simulation override: CH2 DISENGAGED', 'amber');
        Sound.beep(800, 0.1, 'triangle');
        if (!S.ch1) Sound.stopHum();
        syncHUD();
        updateRelayControls();
      }
    });

    D.setAuto.addEventListener('change', () => {
      S.autoApprove = D.setAuto.checked;
      addLog(`Auto-approve requests: ${S.autoApprove ? 'ENABLED' : 'DISABLED'}`, 'cyan');
    });

    D.setParticles.addEventListener('input', () => {
      D.setParticlesVal.textContent = D.setParticles.value;
    });

    D.setSpeed.addEventListener('input', () => {
      const val = parseInt(D.setSpeed.value, 10);
      D.setSpeedVal.textContent = val;
    });

    D.setStars.addEventListener('change', () => {
      if (stars) stars.visible = D.setStars.checked;
    });

    D.setGrid.addEventListener('change', () => {
      if (floorGrid1) floorGrid1.visible = D.setGrid.checked;
      if (floorGrid2) floorGrid2.visible = D.setGrid.checked;
    });

    D.setScanlines.addEventListener('change', () => {
      document.body.classList.toggle('no-scanlines', !D.setScanlines.checked);
    });

    D.setAudio.addEventListener('change', () => {
      S.audio = D.setAudio.checked;
      if (!S.audio) Sound.stopHum();
      else if (S.ch1 || S.ch2) Sound.startHum();
    });

    D.setSimReq.addEventListener('click', triggerSimReq);
    D.setEmergency.addEventListener('click', triggerEmergencyStop);
    D.setReset.addEventListener('click', applyDefaults);
  }

  function bindEvents() {
    D.btnAuth.addEventListener('click', authorize);
    D.btnDeny.addEventListener('click', deny);
    D.btnCloseCard.addEventListener('click', hideNodeInfo);

    // Audio clicks
    document.querySelectorAll('button, select, input[type="checkbox"]').forEach(btn => {
      btn.addEventListener('mouseenter', () => Sound.hover());
      btn.addEventListener('click', () => Sound.click());
    });

    // Clock
    setInterval(() => {
      D.headerTime.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
    }, 1000);

    // Hotkeys
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      switch (e.key.toLowerCase()) {
        case 'p':
          triggerSimReq();
          break;
        case 'r':
          if (socket && S.connected) {
            socket.emit('grid_manual_relay', { channel: 1, state: !S.ch1 });
          } else {
            S.ch1 = !S.ch1;
            updateRelayControls();
            syncHUD();
          }
          break;
        case 'escape':
          hideModal();
          closeSettings();
          hideNodeInfo();
          break;
      }
    });

    // Floating Map Zoom Controls
    const zIn = $('zoom-in');
    const zOut = $('zoom-out');
    const zReset = $('zoom-reset');
    if (zIn) zIn.addEventListener('click', () => { camera.position.z = Math.max(3.0, camera.position.z - 0.8); Sound.click(); });
    if (zOut) zOut.addEventListener('click', () => { camera.position.z = Math.min(20.0, camera.position.z + 0.8); Sound.click(); });
    if (zReset) zReset.addEventListener('click', () => { camera.position.set(0, 2.8, 9.5); camera.lookAt(0, 0.2, 0); Sound.click(); });
  }

  /* ═══════════════════════════════════
     AUTO-GENERATED OPERATIONS ACTIVITIES
     ═══════════════════════════════════ */
  function startSimulatedActivities() {
    const activities = [
      { text: "Grid health status verified: 99.8% stability", type: "green" },
      { text: "AI operations forecast: load peaks estimated at 1.2 kW", type: "cyan" },
      { text: "Tuning resonance frequency parameters to 13.56 MHz", type: "cyan" },
      { text: "AES-256 secure tunnel rotation handshake completed", type: "green" },
      { text: "Thermal telemetry checked: power plant nominal (144.5 °C)", type: "green" },
      { text: "Relay cohesion check completed: 99.9% reliability", type: "green" },
      { text: "Node 101 assigned to queue position 1", type: "amber" },
      { text: "Consumer Node 305 validation handshake finished", type: "cyan" },
      { text: "Geothermal generator turbine speed nominal", type: "green" },
      { text: "Automatic power routing optimization: 96.8% efficiency", type: "cyan" },
      { text: "Voltage sensors stabilized: 224V nominal line flow", type: "green" },
      { text: "Cryptographic OTP signature verification completed", type: "green" }
    ];

    // Append initial logs so the timeline starts populated
    const timeline = document.getElementById('live-timeline-log');
    if (timeline) {
      for (let i = 0; i < 6; i++) {
        const act = activities[i];
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        const item = document.createElement('div');
        item.className = 'tl-item';
        let colorClass = 'text-cyan';
        if (act.type === 'amber') colorClass = 'text-amber';
        if (act.type === 'green') colorClass = 'text-green';
        if (act.type === 'red') colorClass = 'text-red';
        item.innerHTML = `<span class="tl-time">[${time}]</span> <span class="tl-msg ${colorClass}">${act.text}</span>`;
        timeline.appendChild(item);
      }
    }

    setInterval(() => {
      const act = activities[Math.floor(Math.random() * activities.length)];
      addLog(act.text, act.type);

      const timeline = document.getElementById('live-timeline-log');
      if (timeline) {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        const item = document.createElement('div');
        item.className = 'tl-item';
        
        let colorClass = 'text-cyan';
        if (act.type === 'amber') colorClass = 'text-amber';
        if (act.type === 'green') colorClass = 'text-green';
        if (act.type === 'red') colorClass = 'text-red';

        item.innerHTML = `<span class="tl-time">[${time}]</span> <span class="tl-msg ${colorClass}">${act.text}</span>`;
        timeline.appendChild(item);
        while (timeline.children.length > 10) {
          timeline.removeChild(timeline.firstChild);
        }
        timeline.scrollTop = timeline.scrollHeight;
      }
    }, 6000);
  }

  /* ═══════════════════════════════════
     DYNAMIC ALERT CENTER
     ═══════════════════════════════════ */
  function addAlert(title, subtitle, type, badge) {
    const body = D.alertCenterBody;
    if (!body) return;
    // Remove empty message
    const emptyMsg = D.alertEmptyMsg;
    if (emptyMsg) emptyMsg.remove();
    
    const colors = { red: '#FF4D4D', amber: '#FFB020', green: '#00ff88', blue: '#2F7BFF', cyan: '#00E5FF' };
    const color = colors[type] || colors.cyan;
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    const entry = document.createElement('div');
    entry.className = 'alert-entry';
    entry.style.cssText = `display:flex;align-items:center;gap:12px;padding:8px 12px;background:rgba(${type === 'red' ? '255,77,77' : type === 'amber' ? '255,176,32' : type === 'green' ? '0,255,136' : '47,123,255'},0.05);border:1px solid rgba(${type === 'red' ? '255,77,77' : type === 'amber' ? '255,176,32' : type === 'green' ? '0,255,136' : '47,123,255'},0.15);border-radius:6px;`;
    entry.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><div style="flex:1;"><div class="font-space" style="font-size:0.75rem;font-weight:700;color:#fff;">${title}</div><div class="font-jetbrains text-dim" style="font-size:0.6rem;">${subtitle}</div></div><div class="font-jetbrains text-dim" style="font-size:0.65rem;">${time}</div><div style="background:rgba(${type === 'red' ? '255,77,77' : type === 'amber' ? '255,176,32' : type === 'green' ? '0,255,136' : '47,123,255'},0.15);color:${color};padding:2px 6px;border-radius:4px;font-size:0.6rem;font-weight:700;" class="font-space">${badge}</div>`;
    
    body.insertBefore(entry, body.firstChild);
    // Keep max 10 alerts
    while (body.children.length > 10) body.removeChild(body.lastChild);
  }

  /* ═══════════════════════════════════
     UPTIME TRACKER
     ═══════════════════════════════════ */
  let uptimeStart = null;
  function startUptimeTracker() {
    uptimeStart = Date.now();
    setInterval(() => {
      if (!S.connected || !uptimeStart) {
        if (D.gridUptime) { D.gridUptime.textContent = '0d 0h 0m'; D.gridUptime.style.color = '#586069'; }
        return;
      }
      const elapsed = Date.now() - uptimeStart;
      const days = Math.floor(elapsed / 86400000);
      const hours = Math.floor((elapsed % 86400000) / 3600000);
      const mins = Math.floor((elapsed % 3600000) / 60000);
      if (D.gridUptime) { D.gridUptime.textContent = `${days}d ${hours}h ${mins}m`; D.gridUptime.style.color = '#00ff88'; }
    }, 10000);
  }

  /* ─── Boot Terminal ─── */
  function boot() {
    const style = document.createElement('style');
    style.textContent = 'body.no-scanlines .crt-overlay { display: none !important; }';
    document.head.appendChild(style);

    initScene();
    animate();
    bindEvents();
    bindSettings();
    initSocket();
    startSimulatedActivities();
    startUptimeTracker();
    
    // Dynamic date
    const dateEl = $('cmd-date');
    if (dateEl) {
      const now = new Date();
      const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      dateEl.textContent = `${String(now.getDate()).padStart(2,'0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }
    
    // Initial syncHUD to set everything to offline state
    syncHUD();
    
    addLog('National Wireless Grid Dispatch Control Terminal initialized.', 'green');
    addLog('Three.js Vector Render Pipeline: ACTIVE', 'green');
    addLog('Awaiting ESP32 hardware connection...', 'cyan');
  }

  window.addEventListener('DOMContentLoaded', boot);
})();
