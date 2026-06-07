document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements ---
  const views = document.querySelectorAll('.view');
  const navItems = document.querySelectorAll('.nav-item');
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');
  
  // Dashboard Status elements
  const elGridConn = document.querySelector('.topbar-status .status-item:nth-child(5) .value');
  const elHomeConn = document.querySelector('.topbar-status .status-item:nth-child(3) .value');
  
  // Dashboard Metrics
  const elLivePower = document.querySelector('.gauge-center .value');
  const elVolt = document.querySelectorAll('.metric-card .value')[0];
  const elAmp = document.querySelectorAll('.metric-card .value')[1];
  const elFreq = document.querySelectorAll('.metric-card .value')[2];
  const elTemp = document.querySelectorAll('.metric-card .value')[4];
  
  // Footer Safety Elements
  const elSafetyStatus = document.querySelector('.system-footer .sys-item:nth-child(1) .value');
  const elRelayStatus = document.querySelector('.system-footer .sys-item:nth-child(2) .value');
  
  // Modals and Buttons
  const btnReqElec = document.querySelector('.actions-grid .action-btn:nth-child(1)');
  const btnEmergency = document.querySelector('.btn-emergency');
  const modalOtp = document.getElementById('modal-otp');
  const inputOtp = document.getElementById('otp-input');
  const btnSubmitOtp = document.getElementById('btn-submit-otp');
  
  // Transmission Status Elements
  const txChannel = document.getElementById('tx-channel');
  const txPowerReq = document.getElementById('tx-power-req');
  const txDuration = document.getElementById('tx-duration');
  const txElapsed = document.getElementById('tx-elapsed');
  const txStatus = document.getElementById('tx-status');
  const txTimeReq = document.getElementById('tx-time-request');
  const txTimeOtp = document.getElementById('tx-time-otp');
  const txTimeChan = document.getElementById('tx-time-channel');
  const txTimeRelay = document.getElementById('tx-time-relay');
  const txTimeActive = document.getElementById('tx-time-active');
  
  let txStartTime = null;
  
  // --- View Switching ---
  function switchView(viewId) {
    views.forEach(v => {
      v.classList.remove('active');
      v.style.display = 'none';
    });
    const target = document.getElementById(viewId);
    if(target) {
      target.style.display = 'block';
      setTimeout(() => target.classList.add('active'), 10);
    }
  }

  navItems.forEach((item, index) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const text = item.textContent.trim().toUpperCase();
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      if(text.includes('DASHBOARD')) {
        switchView('view-dashboard');
      } else if(text.includes('REQUEST ELECTRICITY')) {
        switchView('view-request');
        socket.emit('request_electricity');
        if(txTimeReq) txTimeReq.textContent = new Date().toLocaleTimeString('en-US', {hour12:false});
        const steps = document.querySelectorAll('.transmission-workflow .step');
        if(steps.length > 0) {
          steps.forEach((s, idx) => { s.className = (idx === 0) ? 'step pending' : 'step'; });
          steps[0].className = 'step active';
        }
      } else if(text.includes('TRANSMISSION STATUS')) {
        switchView('view-transmission');
      } else if(text.includes('LIVE MONITORING')) {
        switchView('view-live');
      } else if(text.includes('USAGE')) {
        switchView('view-usage');
        fetchUsage();
      } else if(text.includes('SAFETY')) {
        switchView('view-safety');
      } else if(text.includes('TIMELINE')) {
        switchView('view-timeline');
        fetchTimeline();
      } else if(text.includes('DEVICE')) {
        switchView('view-device');
      } else if(text.includes('WALLET')) {
        switchView('view-wallet');
        fetchWallet();
      } else if(text.includes('SETTINGS')) {
        switchView('view-settings');
      }
    });
  });

  // --- Clock ---
  function updateClock() {
    const now = new Date();
    if(timeEl) timeEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    if(dateEl) dateEl.textContent = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
    
    if(txStartTime && txElapsed) {
      let s = Math.floor((Date.now() - txStartTime) / 1000);
      let hrs = Math.floor(s / 3600);
      let mins = Math.floor((s % 3600) / 60);
      let secs = Math.floor(s % 60);
      txElapsed.textContent = `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // --- Socket.IO Connection ---
  const socket = io('/home');

  socket.on('connect', () => {
    console.log("Connected to Grid Socket");
    if(elHomeConn) elHomeConn.innerHTML = '<span class="dot green"></span> CONNECTED';
  });

  socket.on('disconnect', () => {
    if(elHomeConn) elHomeConn.innerHTML = '<span class="dot red"></span> OFFLINE';
  });

  socket.on('state_sync', (state) => {
    if(elGridConn) {
      if(state.grid.connected) {
        elGridConn.innerHTML = 'EXCELLENT <span class="bars"><span class="bar on"></span><span class="bar on"></span><span class="bar on"></span><span class="bar on"></span></span>';
        elGridConn.className = 'value text-green';
      } else {
        elGridConn.innerHTML = 'OFFLINE <span class="bars"><span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span></span>';
        elGridConn.className = 'value text-red';
      }
    }

    if(elRelayStatus) {
      if(state.home.relay) {
        elRelayStatus.textContent = 'CLOSED';
        elRelayStatus.className = 'value text-green';
      } else {
        elRelayStatus.textContent = 'OPEN';
        elRelayStatus.className = 'value text-amber';
      }
    }

    if (state.tx && state.tx.active) {
      if(!txStartTime) {
        txStartTime = Date.now() - (state.tx.duration * 1000);
      }
      
      if(txStatus) txStatus.innerHTML = 'Active <span class="dot green"></span>';
      if(txChannel) txChannel.textContent = 'Channel ' + state.tx.channel;
      if(txPowerReq) txPowerReq.textContent = '1000 W'; // Target
      if(txDuration) txDuration.textContent = '02:00:00'; // Target duration
      
      // Re-apply visual steps if reconnected
      const steps = document.querySelectorAll('.transmission-workflow .step');
      if(steps.length > 0 && steps[4].className !== 'step active pulse') {
        steps.forEach(s => s.className = 'step complete');
        steps[4].className = 'step active pulse';
      }
    } else {
      txStartTime = null;
      if(txStatus) txStatus.innerHTML = 'Inactive <span class="dot red"></span>';
      if(txChannel) txChannel.textContent = '--';
      if(txElapsed) txElapsed.textContent = '--:--:--';
    }
  });

  socket.on('telemetry_update', (t) => {
    if(elVolt) elVolt.textContent = t.voltage.toFixed(1) + ' V';
    if(elAmp) elAmp.textContent = t.current.toFixed(2) + ' A';
    if(elFreq) elFreq.textContent = t.frequency.toFixed(2) + ' Hz';
    if(elLivePower) elLivePower.innerHTML = t.wattage + '<span>W</span>';
  });

  socket.on('overload_alert', (data) => {
    if(elSafetyStatus) {
      elSafetyStatus.textContent = 'TRIPPED';
      elSafetyStatus.className = 'value text-red';
    }
    alert("SAFETY TRIP: " + data.violations.join(', '));
  });

  socket.on('transmission_halted', () => {
    txStartTime = null;
    if(txElapsed) txElapsed.textContent = '--:--:--';
    const steps = document.querySelectorAll('.transmission-workflow .step');
    if(steps.length > 0) {
      steps.forEach(s => s.className = 'step');
    }
  });

  // --- Transmission Workflow ---
  if(btnReqElec) {
    btnReqElec.addEventListener('click', () => {
      socket.emit('request_electricity');
      switchView('view-dashboard');
      if(txTimeReq) txTimeReq.textContent = new Date().toLocaleTimeString('en-US', {hour12:false});
      
      // Reset steps
      const steps = document.querySelectorAll('.transmission-workflow .step');
      if(steps.length > 0) {
        steps.forEach((s, idx) => {
          s.className = (idx === 0) ? 'step pending' : 'step';
        });
        steps[0].className = 'step active';
      }
    });
  }

  socket.on('otp_broadcast', (data) => {
    if(modalOtp) {
      modalOtp.style.display = 'flex';
      inputOtp.value = '';
      inputOtp.focus();
    }
  });

  if(btnSubmitOtp) {
    btnSubmitOtp.addEventListener('click', () => {
      const otp = inputOtp.value;
      if(otp.length === 6) {
        fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp })
        }).then(r => r.json()).then(data => {
          if(data.status === 'success') {
            modalOtp.style.display = 'none';
            // Trigger transmission status UI
            const steps = document.querySelectorAll('.transmission-workflow .step');
            if(steps.length > 0) {
              steps.forEach(s => s.className = 'step complete');
              steps[4].className = 'step active pulse'; // Transmission active
            }
            
            const nowTime = new Date().toLocaleTimeString('en-US', {hour12:false});
            if(txTimeOtp) txTimeOtp.textContent = nowTime;
            if(txTimeChan) txTimeChan.textContent = nowTime;
            if(txTimeRelay) txTimeRelay.textContent = nowTime;
            if(txTimeActive) txTimeActive.textContent = nowTime;
            
          } else {
            alert('Verification failed: ' + data.message);
          }
        });
      }
    });
  }

  if(btnEmergency) {
    btnEmergency.addEventListener('click', () => {
      fetch('/api/emergency-stop', {method:'POST'});
    });
  }

  // --- Data Fetching ---
  function fetchWallet() {
    fetch('/api/wallet').then(r=>r.json()).then(d => {
      const balEl = document.getElementById('sidebar-wallet-bal');
      if(balEl) balEl.textContent = d.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      
      const el = document.getElementById('wallet-content');
      if(!el) return;
      let html = `<h1 style="color:var(--cyan);font-size:36px;margin-bottom:20px;">₹ ${d.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h1>`;
      html += `<table style="width:100%;text-align:left;color:var(--text-muted);border-collapse:collapse;">
        <tr style="border-bottom:1px solid var(--panel-border);"><th>Type</th><th>Amount</th><th>Desc</th><th>Time</th></tr>`;
      d.transactions.forEach(tx => {
        html += `<tr style="border-bottom:1px solid var(--panel-border);">
          <td style="padding:10px 0;">${tx.type}</td>
          <td>${tx.amount}</td>
          <td>${tx.description}</td>
          <td>${tx.timestamp}</td>
        </tr>`;
      });
      html += `</table>`;
      el.innerHTML = html;
    });
  }

  function fetchTimeline() {
    fetch('/api/timeline').then(r=>r.json()).then(d => {
      const el = document.getElementById('timeline-content');
      if(!el) return;
      let html = '<ul style="list-style:none;padding:0;">';
      d.forEach(ev => {
        html += `<li style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid var(--panel-border);">
          <strong style="color:var(--cyan);">${ev.event_type}</strong> - ${ev.description}
          <div style="font-size:12px;opacity:0.5;margin-top:4px;">${ev.timestamp}</div>
        </li>`;
      });
      html += '</ul>';
      el.innerHTML = html;
    });
  }

  function fetchUsage() {
    fetch('/api/history').then(r=>r.json()).then(d => {
      const el = document.getElementById('usage-content');
      if(!el) return;
      let html = '<h3>Recent Telemetry Data</h3><table style="width:100%;text-align:left;color:var(--text-muted);border-collapse:collapse;margin-top:20px;">';
      html += '<tr style="border-bottom:1px solid var(--panel-border);"><th>Time</th><th>Voltage</th><th>Current</th><th>Power</th></tr>';
      d.slice(0,20).forEach(h => {
        html += `<tr style="border-bottom:1px solid var(--panel-border);">
          <td style="padding:10px 0;">${h.timestamp}</td>
          <td>${h.voltage} V</td>
          <td>${h.current} A</td>
          <td>${h.wattage} W</td>
        </tr>`;
      });
      html += '</table>';
      el.innerHTML = html;
    });
  }
  
  // Initial Fetch for Sidebar
  fetchWallet();
});
