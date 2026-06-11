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
      } else if(text.includes('TRANSMISSION STATUS')) {
        switchView('view-transmission');
        fetchTxHistory();
      } else if(text.includes('LIVE MONITORING')) {
        switchView('view-monitoring');
        initLiveChart();
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
      let timeStr = `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
      if(txElapsed) txElapsed.textContent = timeStr;
      const pageTxElapsed = document.getElementById('page-tx-elapsed');
      if(pageTxElapsed) pageTxElapsed.textContent = timeStr;
      const liveElapsedTime = document.getElementById('live-elapsed-time');
      if(liveElapsedTime) liveElapsedTime.textContent = timeStr;
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // --- Socket.IO Connection ---
  const serverUrl = window.location.origin;
  const socket = io(serverUrl);

  socket.on('connect', () => {
    socket.emit('join', { room: 'home' });
    console.log("Connected to Grid Socket");
    const topSoftware = document.getElementById('top-software-status');
    if(topSoftware) {
      topSoftware.innerHTML = '<span class="dot green"></span> ONLINE';
      topSoftware.className = 'value text-green';
    }
  });

  socket.on('disconnect', () => {
    const topSoftware = document.getElementById('top-software-status');
    if(topSoftware) {
      topSoftware.innerHTML = '<span class="dot red"></span> OFFLINE';
      topSoftware.className = 'value text-red';
    }
  });

  socket.on('state_sync', (state) => {
    const topSoftware = document.getElementById('top-software-status');
    const topHardware = document.getElementById('top-hardware-status');
    const topGrid = document.getElementById('top-grid-status');

    if(topSoftware) {
      if(state.home.connected) {
        topSoftware.innerHTML = '<span class="dot green"></span> ONLINE';
        topSoftware.className = 'value text-green';
      } else {
        topSoftware.innerHTML = '<span class="dot red"></span> OFFLINE';
        topSoftware.className = 'value text-red';
      }
    }

    if(topHardware) {
      if(state.home.esp) {
        topHardware.innerHTML = '<span class="dot green"></span> ONLINE';
        topHardware.className = 'value text-green';
      } else {
        topHardware.innerHTML = '<span class="dot red"></span> OFFLINE';
        topHardware.className = 'value text-red';
      }
    }

    if(topGrid) {
      if(state.grid.connected) {
        topGrid.innerHTML = 'ONLINE <span class="bars"><span class="bar on"></span><span class="bar on"></span><span class="bar on"></span><span class="bar on"></span></span>';
        topGrid.className = 'value text-green';
      } else {
        topGrid.innerHTML = 'OFFLINE <span class="bars"><span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span></span>';
        topGrid.className = 'value text-red';
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
    console.log("BACKEND ACK RECEIVED");
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

  // --- Request Page Logic ---
  const powerSlider = document.getElementById('power-slider');
  const powerDisplay = document.getElementById('power-display');
  if(powerSlider && powerDisplay) {
      powerSlider.addEventListener('input', (e) => {
          powerDisplay.textContent = e.target.value + ' W';
      });
  }

  const durationSlider = document.getElementById('duration-slider');
  const durationDisplay = document.getElementById('duration-display');
  if(durationSlider && durationDisplay) {
      durationSlider.addEventListener('input', (e) => {
          let val = e.target.value;
          durationDisplay.textContent = (val < 10 ? '0' + val : val) + ':00:00';
      });
  }

  const priorityBtns = document.querySelectorAll('.priority-btn');
  priorityBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
          priorityBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
      });
  });

  const btnInitiate = document.getElementById('btn-initiate-tx');
  if(btnInitiate) {
      btnInitiate.addEventListener('click', () => {
          console.log("BUTTON CLICKED");
          console.log("SOCKET AVAILABLE", !!socket);
          // Switch to dashboard to show OTP and timeline
          switchView('view-dashboard');
          window.scrollTo({top:0, behavior:'smooth'});
          
          socket.emit('request_electricity', {
              power: powerSlider.value,
              duration: durationSlider.value
          });
          console.log("REQUEST SENT");
          
          if(txTimeReq) txTimeReq.textContent = new Date().toLocaleTimeString('en-US', {hour12:false});
          const steps = document.querySelectorAll('.transmission-workflow .step');
          if(steps.length > 0) {
              steps.forEach((s, idx) => { s.className = (idx === 0) ? 'step pending' : 'step'; });
              steps[0].className = 'step active';
          }
          
          // Scroll down to transmission status smoothly after a short delay
          setTimeout(() => {
              const card = document.querySelector('.transmission-status');
              if(card) card.scrollIntoView({behavior: 'smooth', block: 'start'});
          }, 500);
      });
  }

  // --- Dual-View Synchronization ---
  function updateElement(id1, id2, html) {
      const el1 = document.getElementById(id1);
      const el2 = document.getElementById(id2);
      if(el1) el1.innerHTML = html;
      if(el2) el2.innerHTML = html;
  }

  // Override socket listener logic for transmission status updates
  const originalSocketOn = socket.on.bind(socket);
  socket.on = function(eventName, callback) {
      if(eventName === 'request_electricity') {
          originalSocketOn('request_electricity', (data) => {
              const time = new Date().toLocaleTimeString('en-US', {hour12:false});
              updateElement('tx-time-request', 'page-tx-time-request', time);
              updateWorkflowSteps(0);
              callback(data);
          });
      } else {
          originalSocketOn(eventName, callback);
      }
  }

  function updateWorkflowSteps(stepIndex) {
      const dbSteps = document.querySelectorAll('.transmission-workflow .step');
      const pageSteps = document.querySelectorAll('.page-tx-workflow .step');
      
      [dbSteps, pageSteps].forEach(steps => {
          if(steps.length > 0) {
              steps.forEach((s, idx) => { s.className = (idx < stepIndex) ? 'step complete' : (idx === stepIndex ? 'step active' : 'step'); });
              if(stepIndex === 4) {
                 steps[4].classList.add('pulse');
                 steps[4].querySelector('.icon-wrap').classList.add('glow-purple');
                 const prevLine = steps[4].previousElementSibling;
                 if(prevLine && prevLine.classList.contains('line')) prevLine.classList.add('purple');
              }
          }
      });
  }

  // --- Live Logs & History ---
  window.addLog = function(msg, type='sys') {
      const txLiveLogs = document.getElementById('tx-live-logs');
      if(!txLiveLogs) return;
      const el = document.createElement('div');
      el.className = `log-entry log-${type}`;
      const time = new Date().toLocaleTimeString('en-US', {hour12:false});
      el.textContent = `[${time}] ${msg}`;
      txLiveLogs.appendChild(el);
      txLiveLogs.scrollTop = txLiveLogs.scrollHeight;
  }

  originalSocketOn('channel_assigned', (data) => {
      window.addLog(`Channel assigned: ${data.channel} (Freq: ${data.frequency})`, 'info');
      updateElement('tx-channel', 'page-tx-channel', data.channel);
      const time = new Date().toLocaleTimeString('en-US', {hour12:false});
      updateElement('tx-time-channel', 'page-tx-time-channel', time);
      updateWorkflowSteps(2);
  });
  
  originalSocketOn('otp_verified', () => {
      window.addLog(`OTP Verification successful.`, 'success');
      const time = new Date().toLocaleTimeString('en-US', {hour12:false});
      updateElement('tx-time-otp', 'page-tx-time-otp', time);
      updateWorkflowSteps(1);
  });

  originalSocketOn('relay_engaged', () => {
      window.addLog(`Relay protection bypassed. Connection secured.`, 'success');
      const time = new Date().toLocaleTimeString('en-US', {hour12:false});
      updateElement('tx-time-relay', 'page-tx-time-relay', time);
      updateWorkflowSteps(3);
  });

  originalSocketOn('transmission_active', (data) => {
      window.addLog(`Power transmission started. Ramping up power.`, 'warn');
      const time = new Date().toLocaleTimeString('en-US', {hour12:false});
      updateElement('tx-time-active', 'page-tx-time-active', time);
      
      updateElement('tx-power-req', 'page-tx-power-req', `${data.power} W`);
      updateElement('tx-duration', 'page-tx-duration', `${data.duration}:00:00`);
      updateElement('tx-status', 'page-tx-status', `Active <span class="dot green"></span>`);
      
      const dbStatus = document.getElementById('tx-status');
      const pgStatus = document.getElementById('page-tx-status');
      if(dbStatus) dbStatus.className = 'value text-purple';
      if(pgStatus) pgStatus.className = 'value text-purple';
      
      updateWorkflowSteps(4);
  });

  originalSocketOn('transmission_complete', () => {
      window.addLog(`Transmission completed successfully.`, 'success');
      updateElement('tx-status', 'page-tx-status', `Completed`);
      const dbStatus = document.getElementById('tx-status');
      const pgStatus = document.getElementById('page-tx-status');
      if(dbStatus) dbStatus.className = 'value text-green';
      if(pgStatus) pgStatus.className = 'value text-green';
      updateWorkflowSteps(5);
  });

  originalSocketOn('otp_error', (data) => window.addLog(`OTP Verification failed: ${data.msg}`, 'error'));
  originalSocketOn('insufficient_funds', (data) => window.addLog(`Insufficient funds. Need ₹${data.required}.`, 'error'));

  window.fetchTxHistory = function() {
      fetch('/api/history')
        .then(r => r.json())
        .then(data => {
            const body = document.getElementById('tx-history-body');
            if(!body) return;
            if(data.success && data.history.length > 0) {
                body.innerHTML = '';
                data.history.forEach(tx => {
                    const row = document.createElement('tr');
                    let statusClass = 'completed';
                    if(tx.status === 'Active') statusClass = 'active';
                    else if(tx.status === 'Failed') statusClass = 'failed';
                    
                    row.innerHTML = `
                        <td>${new Date(tx.timestamp).toLocaleString('en-GB')}</td>
                        <td>${tx.target_node}</td>
                        <td>${tx.power_requested} W</td>
                        <td>${tx.duration_requested}</td>
                        <td><span class="status-badge ${statusClass}">${tx.status}</span></td>
                    `;
                    body.appendChild(row);
                });
            } else {
                body.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #666; padding: 20px;">No recent transmissions found.</td></tr>`;
            }
        }).catch(err => console.error('Failed to load history', err));
  }

// ═════ PRODUCTION DATA BINDING ═════
const DOM = {
    dashEff: document.getElementById('dash-efficiency'),
    dashHealth: document.getElementById('dash-health'),
    dashUptime: document.getElementById('dash-uptime'),
    dashConn: document.getElementById('dash-conn-quality'),
    devUptime: document.getElementById('dev-uptime'),
    devRelayState: document.getElementById('dev-relay-state'),
    devRelayHealth: document.getElementById('dev-relay-health'),
    devHeartbeat: document.getElementById('dev-heartbeat'),
    devRssi: document.getElementById('dev-rssi'),
    devProtection: document.getElementById('dev-protection'),
    secAes: document.getElementById('sec-aes'),
    secTunnel: document.getElementById('sec-tunnel'),
    secKey: document.getElementById('sec-key'),
    secAuth: document.getElementById('sec-auth'),
    timeline: document.getElementById('activity-timeline-container'),
    walletTable: document.getElementById('wallet-table-body'),
    walletBal: document.getElementById('wallet-balance-big'),
    sidebarWallet: document.getElementById('sidebar-wallet')
};

function formatUptime(ms) {
    if(!ms) return "--:--:--";
    let s = Math.floor(ms / 1000);
    let h = Math.floor(s / 3600);
    s %= 3600;
    let m = Math.floor(s / 60);
    s %= 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

// Global State Sync from Backend
socket.on('state_sync', (state) => {
    // Top Bar Status
    const topStatusText = document.querySelector('.header-stats .stat-box:nth-child(2) .value');
    if(topStatusText) {
        if(state.home.connected && state.home.esp) {
            topStatusText.innerHTML = '<span class="dot green"></span> CONNECTED';
            topStatusText.style.color = '#00FF88';
        } else {
            topStatusText.innerHTML = '<span class="dot red"></span> OFFLINE';
            topStatusText.style.color = '#FF4D4D';
        }
    }

    // Security Status
    if(state.otp && state.otp.encryption) {
        if(DOM.secAes) DOM.secAes.textContent = 'AES-256 ACTIVE';
        if(DOM.secTunnel) DOM.secTunnel.textContent = 'SECURED';
        if(DOM.secKey) DOM.secKey.textContent = 'LOCKED';
        if(DOM.secAuth) DOM.secAuth.textContent = 'VERIFIED';
    } else {
        if(DOM.secAes) DOM.secAes.textContent = 'STANDBY';
        if(DOM.secTunnel) DOM.secTunnel.textContent = 'STANDBY';
        if(DOM.secKey) DOM.secKey.textContent = 'PENDING';
        if(DOM.secAuth) DOM.secAuth.textContent = 'PENDING';
    }
    
    // Relay State
    if(DOM.devRelayState) {
        if(state.home.relay) {
            DOM.devRelayState.textContent = 'CLOSED (ACTIVE)';
            DOM.devRelayState.className = 'value text-purple';
            if(DOM.devProtection) {
                DOM.devProtection.textContent = 'BYPASSED';
                DOM.devProtection.className = 'value text-amber';
            }
        } else {
            DOM.devRelayState.textContent = 'OPEN (SAFE)';
            DOM.devRelayState.className = 'value text-green';
            if(DOM.devProtection) {
                DOM.devProtection.textContent = 'ARMED';
                DOM.devProtection.className = 'value text-green';
            }
        }
    }
});

// High-Fidelity Telemetry Updates
socket.on('telemetry_update', (t) => {
    // Existing mapping
    if(document.getElementById('live-voltage')) document.getElementById('live-voltage').textContent = t.voltage.toFixed(1) + ' V';
    if(document.getElementById('live-current')) document.getElementById('live-current').textContent = t.current.toFixed(2) + ' A';
    if(document.getElementById('live-frequency')) document.getElementById('live-frequency').textContent = t.frequency.toFixed(2) + ' Hz';
    if(document.querySelector('.power-gauge .value')) document.querySelector('.power-gauge .value').innerHTML = t.wattage + '<span>W</span>';
    
    // New mappings
    if(DOM.dashEff) DOM.dashEff.textContent = (t.power_factor * 100).toFixed(1) + '%';
    if(DOM.dashHealth) DOM.dashHealth.textContent = '100.0%';
    if(DOM.devRelayHealth) DOM.devRelayHealth.textContent = '100.0%';
    
    let uptimeStr = formatUptime(t.uptime);
    if(DOM.dashUptime) DOM.dashUptime.textContent = uptimeStr;
    if(DOM.devUptime) DOM.devUptime.textContent = uptimeStr;
    
    if(DOM.devRssi) DOM.devRssi.textContent = t.rssi + ' dBm';
    
    // Calculate signal bars based on RSSI
    let barsHtml = '';
    if(t.rssi > -60) barsHtml = '<div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>';
    else if(t.rssi > -70) barsHtml = '<div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar half"></div>';
    else if(t.rssi > -80) barsHtml = '<div class="bar"></div><div class="bar"></div><div class="bar half"></div><div class="bar off"></div>';
    else barsHtml = '<div class="bar"></div><div class="bar off"></div><div class="bar off"></div><div class="bar off"></div>';
    
    if(DOM.dashConn) DOM.dashConn.innerHTML = `EXCELLENT <span class="bars">${barsHtml}</span>`;
    
    if(DOM.devHeartbeat) DOM.devHeartbeat.textContent = "Live";
});

// Periodic API Fetchers for History
function fetchTimeline() {
    fetch('/api/timeline')
        .then(r => r.json())
        .then(data => {
            if(DOM.timeline && data.length > 0) {
                DOM.timeline.innerHTML = '';
                data.forEach(evt => {
                    let icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
                    if(evt.event_type.includes('OTP')) icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
                    if(evt.event_type.includes('SYSTEM')) icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>';
                    
                    DOM.timeline.innerHTML += `
                        <div class="timeline-item">
                            <div class="icon-wrap ${evt.event_type.includes('CRITICAL') ? 'glow-purple' : ''}">
                                ${icon}
                            </div>
                            <div class="content">
                                <span class="time">${new Date(evt.timestamp).toLocaleTimeString('en-GB')}</span>
                                <h4>${evt.event_type}</h4>
                                <p>${evt.description}</p>
                            </div>
                        </div>
                    `;
                });
            }
        });
}

function fetchWallet() {
    fetch('/api/wallet')
        .then(r => r.json())
        .then(data => {
            let formattedBal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(data.balance);
            if(DOM.walletBal) DOM.walletBal.textContent = formattedBal;
            if(DOM.sidebarWallet) DOM.sidebarWallet.textContent = data.balance.toFixed(2);
            
            if(DOM.walletTable && data.transactions.length > 0) {
                DOM.walletTable.innerHTML = '';
                data.transactions.forEach(tx => {
                    DOM.walletTable.innerHTML += `
                        <tr>
                            <td>${new Date(tx.timestamp).toLocaleString('en-GB')}</td>
                            <td>${tx.description}</td>
                            <td><span class="status-badge completed">Completed</span></td>
                            <td><strong>₹ ${tx.amount.toFixed(2)}</strong></td>
                        </tr>
                    `;
                });
            }
        });
}

// Initial Fetch and Request State
setTimeout(() => {
    socket.emit('request_state');
    fetchTimeline();
    fetchWallet();
    setInterval(fetchTimeline, 5000);
    setInterval(fetchWallet, 10000);
}, 1000);

// Live Power Chart Logic
let liveChartData = Array(30).fill(567);
let chartInterval;
function initLiveChart() {
    const canvas = document.getElementById('live-power-chart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if(chartInterval) clearInterval(chartInterval);
    
    function drawChart() {
        // Update data
        let lastVal = liveChartData[liveChartData.length - 1];
        let newVal = lastVal + (Math.random() * 40 - 20); // +/- 20W variation
        if(newVal > 890) newVal = 890;
        if(newVal < 200) newVal = 200;
        liveChartData.push(newVal);
        liveChartData.shift();
        
        // Update UI
        const currEl = document.getElementById('lm-current-power');
        if(currEl) currEl.textContent = Math.round(newVal) + 'W';
        
        // Draw
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        for(let i=0; i<4; i++) {
            let y = i * (canvas.height / 4);
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();
        
        // Line
        ctx.beginPath();
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        
        let stepX = canvas.width / (liveChartData.length - 1);
        for(let i=0; i<liveChartData.length; i++) {
            let x = i * stepX;
            // scale 0-1200
            let y = canvas.height - ((liveChartData[i] / 1200) * canvas.height);
            if(i===0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Fill
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, 'rgba(0, 229, 255, 0.2)');
        grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fill();
    }
    
    chartInterval = setInterval(drawChart, 2000);
    drawChart();
}

});
