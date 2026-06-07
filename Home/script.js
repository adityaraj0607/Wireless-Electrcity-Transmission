/**
 * WETA Home Terminal v3 — Script
 * Aditya Raj & Deepak Kumar Gupta
 */
(function(){
const S={connected:false,esp:false,link:"OFF",ch:null,volts:0,amps:0,watts:0,otp:"",otpActive:false,packets:0,lats:[],limV:240,limA:15,limW:3600,audio:true};

// ── Audio ──
const Snd={ctx:null,init(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume()},
beep(f,d,t='sine',g=.06){if(!S.audio)return;try{this.init();const o=this.ctx.createOscillator(),gn=this.ctx.createGain();o.connect(gn);gn.connect(this.ctx.destination);o.frequency.value=f;o.type=t;gn.gain.setValueAtTime(g,this.ctx.currentTime);gn.gain.exponentialRampToValueAtTime(.0001,this.ctx.currentTime+d);o.start();o.stop(this.ctx.currentTime+d)}catch(e){}},
click(){this.beep(1200,.05,'triangle',.04)},ok(){this.beep(800,.1);setTimeout(()=>this.beep(1200,.15),100)},alarm(){this.beep(480,.2,'sawtooth',.1);setTimeout(()=>this.beep(400,.2,'sawtooth',.1),200)}};

// ── DOM refs ──
const $=id=>document.getElementById(id);
const el={
connChip:$('conn-chip'),connDot:$('conn-dot'),connLabel:$('conn-label'),clock:$('clock-chip'),
btnSettings:$('btn-settings'),ovSettings:$('overlay-settings'),btnCloseSettings:$('btn-close-settings'),
beamPill:$('beam-pill'),bfLink:$('bf-link'),bfFps:$('bf-fps'),
otpPill:$('otp-pill'),otpCode:$('otp-code'),otpTimer:$('otp-timer'),
btnReq:$('btn-request'),btnSubmit:$('btn-submit-otp'),encFill:$('enc-fill'),encText:$('enc-text'),
rnGrid:$('rn-grid'),rnHome:$('rn-home'),rrGrid:$('rr-grid'),rrHome:$('rr-home'),rsGrid:$('rs-grid'),rsHome:$('rs-home'),rBridge:$('relay-bridge'),
mnGrid:$('mn-grid'),mnHome:$('mn-home'),msGrid:$('ms-grid'),msHome:$('ms-home'),latVal:$('lat-val'),
streamBox:$('stream-box'),stPackets:$('st-packets'),stInt:$('st-integrity'),logScroll:$('log-scroll'),
gVolts:$('g-volts'),gAmps:$('g-amps'),gWatts:$('g-watts'),arcV:$('arc-v'),arcA:$('arc-a'),arcW:$('arc-w'),
safetyStrip:$('safety-strip'),safetyMsg:$('safety-msg'),
ovOtp:$('overlay-otp'),otpField:$('otp-field'),btnVerify:$('btn-verify'),btnCancelOtp:$('btn-cancel-otp'),
ovOL:$('overlay-overload'),olV:$('ol-v'),olA:$('ol-a'),olW:$('ol-w'),btnAckOL:$('btn-ack-ol'),
cfgV:$('cfg-v'),cfgVv:$('cfg-v-val'),cfgA:$('cfg-a'),cfgAv:$('cfg-a-val'),cfgW:$('cfg-w'),cfgWv:$('cfg-w-val'),cfgAudio:$('cfg-audio'),
btnEstop:$('btn-estop'),btnReset:$('btn-reset-cfg'),btnDrip:$('btn-drip')
};

// ── Socket.IO ──
const sock=io('/',{autoConnect:true});
sock.on('connect',()=>{S.connected=true;updConn(true);sock.emit('join',{room:'home'});log('Connected to grid master server.','ok');el.mnGrid.classList.add('on');el.msGrid.textContent='CONNECTED'});
sock.on('disconnect',()=>{S.connected=false;updConn(false);log('Connection lost.','err');el.mnGrid.classList.remove('on');el.msGrid.textContent='OFFLINE';resetTx()});

sock.on('master_state',d=>{
if(d.grid_esp_connected!==undefined){S.esp=d.grid_esp_connected;el.msHome.textContent=S.esp?'CONNECTED':'OFFLINE';el.mnHome.classList.toggle('on',S.esp)}
updRelays(d.ch1,d.home_relay);
});

sock.on('esp_telemetry',d=>{
if(S.link!=="ACTIVE")return;
S.volts=+(d.voltage||0);S.amps=+(d.current||0);S.watts=Math.round(S.volts*S.amps);S.packets++;
el.gVolts.textContent=S.volts.toFixed(1);el.gAmps.textContent=S.amps.toFixed(2);el.gWatts.textContent=S.watts;
el.stPackets.textContent=S.packets;
const hex=Array.from({length:10},()=>Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();
el.streamBox.textContent=`[AES-GCM] V=${S.volts.toFixed(1)} A=${S.amps.toFixed(2)} W=${S.watts} SIG:${hex}`;
el.streamBox.classList.add('active');
updArcs();checkSafety();
});

sock.on('otp_broadcast',d=>{
S.otpActive=true;S.otp=d.otp;
el.otpPill.className='pill pill--amber';el.otpPill.querySelector('.pill__dot').className='pill__dot';
el.otpCode.textContent=S.otp.split('').join(' ');
el.otpTimer.textContent='Valid for 120s';
el.btnSubmit.removeAttribute('disabled');
el.encFill.style.width='40%';el.encText.textContent='Corridor handshaking...';
log('OTP received: '+S.otp,'warn');
});

sock.on('otp_verified_response',d=>{
if(d.status==='success'){
S.link='ACTIVE';S.ch=d.channel;Snd.ok();
log('Transmission active on CH'+S.ch,'ok');
el.beamPill.className='pill active';el.beamPill.lastChild.textContent='Active';
el.bfLink.textContent='CH'+S.ch;el.bfLink.classList.add('accent-cyan');
el.encFill.style.width='100%';el.encText.textContent='AES-256 Tunnel Secured';
updRelays(true,true);
}else{Snd.alarm();log('OTP verification failed: '+(d.message||'Invalid'),'err');el.encFill.style.width='0';el.encText.textContent='Failed'}
});

sock.on('transmission_stop',()=>{log('Transmission terminated by grid.','info');resetTx()});

// ── Helpers ──
function updConn(on){el.connChip.classList.toggle('off',!on);el.connLabel.textContent=on?'Connected':'Offline'}

function updRelays(g,h){
el.rnGrid.classList.toggle('on',!!g);el.rsGrid.textContent=g?'ENGAGED':'LOCKED';
el.rnHome.classList.toggle('on',!!h);el.rsHome.textContent=h?'ENGAGED':'LOCKED';
el.rBridge.classList.toggle('on',!!(g&&h));
}

function updArcs(){
const circ=314;
el.arcV.style.strokeDashoffset=circ-circ*Math.min(1,S.volts/300);
el.arcA.style.strokeDashoffset=circ-circ*Math.min(1,S.amps/20);
el.arcW.style.strokeDashoffset=circ-circ*Math.min(1,S.watts/5000);
}

function checkSafety(){
if(S.volts>S.limV||S.amps>S.limA||S.watts>S.limW){
S.link='OL';Snd.alarm();
el.olV.textContent=S.volts.toFixed(1)+'V';el.olA.textContent=S.amps.toFixed(2)+'A';el.olW.textContent=S.watts+'W';
el.ovOL.classList.add('open');sock.emit('emergency_shutdown');
log('OVERLOAD TRIP! V='+S.volts.toFixed(1)+' A='+S.amps.toFixed(2)+' W='+S.watts,'err');resetTx();
}else{
el.safetyStrip.classList.remove('danger');el.safetyMsg.textContent='All readings within safe limits';
}}

function resetTx(){
S.volts=0;S.amps=0;S.watts=0;S.link='OFF';S.ch=null;
el.gVolts.textContent='0.0';el.gAmps.textContent='0.00';el.gWatts.textContent='0';
el.arcV.style.strokeDashoffset=314;el.arcA.style.strokeDashoffset=314;el.arcW.style.strokeDashoffset=314;
el.beamPill.className='pill';el.beamPill.lastChild.textContent='Idle';
el.bfLink.textContent='Offline';el.bfLink.classList.remove('accent-cyan');
el.encFill.style.width='0';el.encText.textContent='Tunnel idle';
el.streamBox.textContent='Awaiting transmission...';el.streamBox.classList.remove('active');
el.btnSubmit.setAttribute('disabled','true');updRelays(false,false);
}

function log(msg,cls=''){
const d=document.createElement('div');d.className='log-line '+(cls||'');
d.textContent='['+new Date().toLocaleTimeString()+'] '+msg;
el.logScroll.appendChild(d);el.logScroll.scrollTop=el.logScroll.scrollHeight;
}

// ── Beam Canvas ──
const beamCanvas=$('beam-canvas');
let beamCtx,beamW,beamH,t=0;
function initBeam(){
if(!beamCanvas)return;beamCtx=beamCanvas.getContext('2d');resizeBeam();
window.addEventListener('resize',resizeBeam);drawBeam();
}
function resizeBeam(){const r=beamCanvas.parentElement.getBoundingClientRect();beamCanvas.width=r.width;beamCanvas.height=r.height;beamW=r.width;beamH=r.height}
function drawBeam(){
t+=.04;const ctx=beamCtx;if(!ctx)return;ctx.clearRect(0,0,beamW,beamH);
const cx=beamW/2,cy=beamH/2,lx=55,rx=beamW-55,active=S.link==='ACTIVE';

// Grid node (left)
ctx.beginPath();ctx.arc(lx,cy,14,0,Math.PI*2);
ctx.fillStyle=active?'rgba(57,255,20,.6)':'rgba(255,255,255,.08)';ctx.fill();
if(active){ctx.beginPath();ctx.arc(lx,cy,8,0,Math.PI*2);ctx.fillStyle='#fff';ctx.shadowColor='#39ff14';ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0}

// Home node (right)
ctx.beginPath();ctx.arc(rx,cy,14,0,Math.PI*2);
ctx.fillStyle=active?'rgba(0,229,255,.6)':'rgba(255,255,255,.08)';ctx.fill();
if(active){ctx.beginPath();ctx.arc(rx,cy,8,0,Math.PI*2);ctx.fillStyle='#fff';ctx.shadowColor='#00e5ff';ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0}

// Wave line
const pts=80;
ctx.beginPath();ctx.moveTo(lx,cy);
for(let i=0;i<=pts;i++){
const x=lx+(rx-lx)*(i/pts);
const amp=active?16*Math.sin(t*1.2+i*.18):3*Math.sin(t*.6+i*.1);
ctx.lineTo(x,cy+amp);
}
ctx.strokeStyle=active?'rgba(0,229,255,.35)':'rgba(255,255,255,.05)';ctx.lineWidth=active?3:1.5;ctx.stroke();

// Active glow line
if(active){
ctx.beginPath();ctx.moveTo(lx,cy);
for(let i=0;i<=pts;i++){const x=lx+(rx-lx)*(i/pts);ctx.lineTo(x,cy+16*Math.sin(t*1.2+i*.18))}
ctx.strokeStyle='rgba(0,229,255,.12)';ctx.lineWidth=12;ctx.stroke();
}

// Particles
if(active){
for(let k=0;k<18;k++){
const phase=(t*.25+k/18)%1;
const x=lx+(rx-lx)*phase;
const idx=Math.floor(phase*pts);
const y=cy+16*Math.sin(t*1.2+idx*.18);
ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);
ctx.fillStyle='#fff';ctx.shadowColor='#00e5ff';ctx.shadowBlur=8;ctx.fill();ctx.shadowBlur=0;
}}

// Idle ambient dots
if(!active){
for(let k=0;k<6;k++){
const phase=(t*.08+k/6)%1;
const x=lx+(rx-lx)*phase;
const y=cy+3*Math.sin(t*.6+Math.floor(phase*pts)*.1);
ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.12)';ctx.fill();
}}

requestAnimationFrame(drawBeam);
}

// ── Sparkline ──
function drawSpark(){
const c=$('spark-canvas');if(!c||S.lats.length<2)return;
const ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);
const mx=Math.max(50,...S.lats);
ctx.beginPath();
for(let i=0;i<S.lats.length;i++){const x=(i/(S.lats.length-1))*w,y=h-(S.lats[i]/mx)*h;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}
ctx.strokeStyle='#00e5ff';ctx.lineWidth=1.5;ctx.stroke();
}

// ── Tariff mini chart ──
function drawTariff(){
const c=$('tariff-chart');if(!c)return;const ctx=c.getContext('2d'),w=c.width=c.parentElement.clientWidth-44,h=c.height;
ctx.clearRect(0,0,w,h);
const data=[.118,.120,.119,.121,.124,.122,.125,.124,.126,.124];
const mx=Math.max(...data),mn=Math.min(...data);
ctx.beginPath();
for(let i=0;i<data.length;i++){const x=(i/(data.length-1))*w,y=h-((data[i]-mn)/(mx-mn))*h*.8-h*.1;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}
ctx.strokeStyle='#00e5ff';ctx.lineWidth=2;ctx.stroke();
// Fill gradient
ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();
const grd=ctx.createLinearGradient(0,0,0,h);grd.addColorStop(0,'rgba(0,229,255,.12)');grd.addColorStop(1,'rgba(0,229,255,0)');
ctx.fillStyle=grd;ctx.fill();
}

// ── Events ──
function bind(){
setInterval(()=>{el.clock.textContent=new Date().toLocaleTimeString()},1000);

// Tabs
document.querySelectorAll('.tab-pill').forEach(b=>b.addEventListener('click',()=>{
Snd.click();document.querySelectorAll('.tab-pill').forEach(x=>x.classList.remove('active'));b.classList.add('active');
const tab=b.dataset.tab;document.querySelectorAll('.view').forEach(v=>{v.classList.toggle('active',v.id==='view-'+tab)});
if(tab==='market')setTimeout(drawTariff,50);
}));

// Settings
el.btnSettings.addEventListener('click',()=>{Snd.click();el.ovSettings.classList.add('open')});
el.btnCloseSettings.addEventListener('click',()=>{Snd.click();el.ovSettings.classList.remove('open')});

// Request
el.btnReq.addEventListener('click',()=>{Snd.click();if(!S.connected)return alert('Socket offline');sock.emit('request_electricity');log('Requesting electricity from grid...','warn')});

// Submit OTP modal
el.btnSubmit.addEventListener('click',()=>{Snd.click();el.ovOtp.classList.add('open');el.otpField.value='';el.otpField.focus()});
el.btnCancelOtp.addEventListener('click',()=>{Snd.click();el.ovOtp.classList.remove('open')});
el.btnVerify.addEventListener('click',()=>{
const c=el.otpField.value.trim();if(c.length!==6)return alert('Enter a valid 6-digit code');
Snd.click();sock.emit('submit_otp',{otp:c});setTimeout(()=>el.ovOtp.classList.remove('open'),400);
});

// Overload ack
el.btnAckOL.addEventListener('click',()=>{Snd.click();el.ovOL.classList.remove('open');log('Safety reset acknowledged.','ok')});

// Config ranges
el.cfgV.addEventListener('input',e=>{S.limV=+e.target.value;el.cfgVv.textContent=S.limV+'V'});
el.cfgA.addEventListener('input',e=>{S.limA=+e.target.value;el.cfgAv.textContent=S.limA+'A'});
el.cfgW.addEventListener('input',e=>{S.limW=+e.target.value;el.cfgWv.textContent=S.limW+'W'});
el.cfgAudio.addEventListener('change',e=>{S.audio=e.target.checked});

el.btnReset.addEventListener('click',()=>{
Snd.click();S.limV=240;S.limA=15;S.limW=3600;
el.cfgV.value=240;el.cfgVv.textContent='240V';el.cfgA.value=15;el.cfgAv.textContent='15A';el.cfgW.value=3600;el.cfgWv.textContent='3600W';
log('Thresholds reset to defaults.','ok');
});

el.btnEstop.addEventListener('click',()=>{Snd.click();sock.emit('emergency_shutdown');resetTx();el.ovSettings.classList.remove('open');log('EMERGENCY STOP ISSUED','err')});
el.btnDrip.addEventListener('click',()=>{Snd.click();log('Irrigation pulse: 30s drip active.','ok')});

// Latency sim
sock.on('pong_latency',()=>{const l=8+Math.floor(Math.random()*12);S.lats.push(l);if(S.lats.length>20)S.lats.shift();el.latVal.textContent=l+'ms';drawSpark()});
setInterval(()=>{if(S.connected)sock.volatile.emit('ping_latency')},2000);
}

// ── Boot Sequence ──
function runBoot(){
const splash=$('boot-splash');
const fill=$('boot-fill');
const steps=[
  {el:$('bs-1'),pct:'20',delay:0},
  {el:$('bs-2'),pct:'50',delay:600},
  {el:$('bs-3'),pct:'80',delay:1200},
  {el:$('bs-4'),pct:'100',delay:1800}
];

// Step through boot messages
steps.forEach((s,i)=>{
  setTimeout(()=>{
    // Mark previous as done
    if(i>0) steps[i-1].el.classList.remove('active'),steps[i-1].el.classList.add('done');
    s.el.classList.add('active');
    fill.style.width=s.pct+'%';
    Snd.beep(600+i*200,.08,'sine',.03);
  },s.delay);
});

// Finish boot
setTimeout(()=>{
  steps[3].el.classList.remove('active');steps[3].el.classList.add('done');
  Snd.ok();

  // Fade out splash
  setTimeout(()=>{
    splash.classList.add('done');
    // Trigger entrance animations
    setTimeout(entranceAnimations,300);
  },400);
},2400);
}

function entranceAnimations(){
// Topbar slides in
const topbar=document.querySelector('.topbar');
if(topbar) topbar.classList.add('entered');

// Cards stagger in
const cards=document.querySelectorAll('.card');
cards.forEach((card,i)=>{
  card.style.transitionDelay=(i*120)+'ms';
  setTimeout(()=>card.classList.add('entered'),50);
});

// Footer
const footer=document.querySelector('.footer');
if(footer){
  footer.style.transitionDelay=(cards.length*120+100)+'ms';
  setTimeout(()=>footer.classList.add('entered'),50);
}

// Clean up transition delays after animations complete
setTimeout(()=>{
  cards.forEach(c=>c.style.transitionDelay='');
  if(footer) footer.style.transitionDelay='';
},cards.length*120+800);
}

// ── Init ──
window.addEventListener('DOMContentLoaded',()=>{
  runBoot();
  initBeam();
  bind();
  log('Home Receiver Terminal loaded.','ok');
});
})();
