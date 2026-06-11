import re
import sys

file_path = r"e:\Wireless Electricity Transmission\Home\index.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

def replace_view(content, start_marker, end_marker, new_html):
    pattern = re.compile(rf"({re.escape(start_marker)}.*?)(?={re.escape(end_marker)})", re.DOTALL)
    if pattern.search(content):
        return pattern.sub(f"{start_marker}\n{new_html}\n\n      ", content)
    else:
        # If end marker not found or start marker not found, let's just append or print error
        print(f"Could not find {start_marker} and {end_marker}")
        return content

def insert_view_after(content, after_marker, new_html):
    pattern = re.compile(rf"({re.escape(after_marker)}.*?\n      </div>\n)", re.DOTALL)
    match = pattern.search(content)
    if match:
        return content[:match.end()] + f"\n      {new_html}\n" + content[match.end():]
    else:
        print(f"Could not find {after_marker}")
        return content

# Page 1: Request Electricity
view_request = """      <div id="view-request" class="dashboard-scroll view" style="display: none;">
        <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 24px; color: #fff; margin: 0; font-family: var(--font-space); letter-spacing: 1px;">Request Electricity</h1>
            <p style="color: var(--text-muted); margin: 5px 0 0 0;">Submit a new power transmission request to the WETA grid</p>
          </div>
          <div class="status-badge" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 8px 16px; border-radius: 20px; color: #10b981; font-weight: bold;">
            Wallet: 2,450.75 Credits
          </div>
        </div>

        <div class="grid-container" style="display: grid; gap: 24px;">
           <div class="card">
             <div class="card-header">
                <h2>CONFIGURE TRANSMISSION</h2>
             </div>
             <div class="request-form" style="padding: 24px;">
                <div class="form-step" style="margin-bottom: 30px;">
                  <h3 style="color: #fff; margin-bottom: 15px; font-size: 16px;">1. Select Power Package</h3>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div class="pkg-card" style="border: 1px solid rgba(255,255,255,0.06); padding: 15px; border-radius: 8px; cursor: pointer;">
                      <strong style="color: #fff; display: block; margin-bottom: 5px;">Basic</strong>
                      <span style="color: var(--text-muted); display: block; font-size: 14px;">500W / 1 hour</span>
                      <span style="color: #00e5ff; display: block; margin-top: 10px; font-weight: bold;">6.24 Credits</span>
                    </div>
                    <div class="pkg-card active" style="border: 1px solid #00e5ff; background: rgba(0,229,255,0.05); padding: 15px; border-radius: 8px; cursor: pointer; position: relative;">
                      <div style="position: absolute; top: -10px; right: 10px; background: #00e5ff; color: #000; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold;">RECOMMENDED</div>
                      <strong style="color: #fff; display: block; margin-bottom: 5px;">Standard</strong>
                      <span style="color: var(--text-muted); display: block; font-size: 14px;">1000W / 2 hours</span>
                      <span style="color: #00e5ff; display: block; margin-top: 10px; font-weight: bold;">12.48 Credits</span>
                    </div>
                    <div class="pkg-card" style="border: 1px solid rgba(255,255,255,0.06); padding: 15px; border-radius: 8px; cursor: pointer;">
                      <strong style="color: #fff; display: block; margin-bottom: 5px;">Premium</strong>
                      <span style="color: var(--text-muted); display: block; font-size: 14px;">2000W / 4 hours</span>
                      <span style="color: #00e5ff; display: block; margin-top: 10px; font-weight: bold;">24.96 Credits</span>
                    </div>
                    <div class="pkg-card" style="border: 1px solid rgba(255,255,255,0.06); padding: 15px; border-radius: 8px; cursor: pointer;">
                      <strong style="color: #fff; display: block; margin-bottom: 5px;">Custom</strong>
                      <span style="color: var(--text-muted); display: block; font-size: 14px;">Input watts & duration</span>
                    </div>
                  </div>
                </div>

                <div class="form-step" style="margin-bottom: 30px;">
                  <h3 style="color: #fff; margin-bottom: 15px; font-size: 16px;">2. Transmission Priority</h3>
                  <div style="display: flex; gap: 15px;">
                    <button class="action-btn" style="flex: 1; border-color: #00e5ff; color: #00e5ff;">Normal (Queue)</button>
                    <button class="action-btn" style="flex: 1;">Priority (+20%)</button>
                    <button class="action-btn" style="flex: 1; color: #ef4444;">Emergency (+50%)</button>
                  </div>
                </div>

                <div class="form-step" style="margin-bottom: 30px;">
                  <h3 style="color: #fff; margin-bottom: 15px; font-size: 16px;">3. Schedule</h3>
                  <div style="display: flex; gap: 15px;">
                    <button class="action-btn" style="flex: 1; border-color: #00e5ff; color: #00e5ff;">Transmit Now</button>
                    <button class="action-btn" style="flex: 1;">Schedule for Later</button>
                  </div>
                </div>

                <div class="form-step">
                  <h3 style="color: #fff; margin-bottom: 15px; font-size: 16px;">4. Review & Submit</h3>
                  <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 20px; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                      <span style="color: var(--text-muted);">Package:</span>
                      <strong style="color: #fff;">Standard (1000W / 2 hrs)</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                      <span style="color: var(--text-muted);">Priority:</span>
                      <strong style="color: #fff;">Normal</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                      <span style="color: var(--text-muted);">Estimated Start:</span>
                      <strong style="color: #fff;">Immediate</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                      <span style="color: var(--text-muted);">Total Cost:</span>
                      <strong style="color: #00e5ff; font-size: 18px;">12.48 Credits</strong>
                    </div>
                    <button class="btn-glow-cyan" style="width: 100%; padding: 15px; font-size: 16px; font-weight: bold; border-radius: 8px; text-transform: uppercase; cursor: pointer;">Submit Request</button>
                    <div style="text-align: center; margin-top: 10px; font-size: 12px; color: #10b981;">Sufficient balance: 2,450.75 Credits available</div>
                  </div>
                </div>
             </div>
           </div>

           <div class="card">
             <div class="card-header">
                <h2>RECENT REQUESTS</h2>
             </div>
             <div style="padding: 0;">
                <table class="premium-table" style="width: 100%; text-align: left; border-collapse: collapse;">
                  <thead>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); color: var(--text-muted); font-size: 12px; text-transform: uppercase;">
                      <th style="padding: 15px 24px;">Request ID</th>
                      <th style="padding: 15px 24px;">Date & Time</th>
                      <th style="padding: 15px 24px;">Power</th>
                      <th style="padding: 15px 24px;">Duration</th>
                      <th style="padding: 15px 24px;">Cost</th>
                      <th style="padding: 15px 24px;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                      <td style="padding: 15px 24px; color: #fff;">#REQ-8891</td>
                      <td style="padding: 15px 24px; color: var(--text-muted);">10 Jun 2026, 16:30</td>
                      <td style="padding: 15px 24px; color: #fff;">1000 W</td>
                      <td style="padding: 15px 24px; color: #fff;">2 hrs</td>
                      <td style="padding: 15px 24px; color: #fff;">12.48 Crd</td>
                      <td style="padding: 15px 24px;"><span style="color: #00e5ff;">Active</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                      <td style="padding: 15px 24px; color: #fff;">#REQ-8890</td>
                      <td style="padding: 15px 24px; color: var(--text-muted);">09 Jun 2026, 18:00</td>
                      <td style="padding: 15px 24px; color: #fff;">500 W</td>
                      <td style="padding: 15px 24px; color: #fff;">1 hr</td>
                      <td style="padding: 15px 24px; color: #fff;">6.24 Crd</td>
                      <td style="padding: 15px 24px;"><span style="color: #10b981;">Completed</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                      <td style="padding: 15px 24px; color: #fff;">#REQ-8889</td>
                      <td style="padding: 15px 24px; color: var(--text-muted);">08 Jun 2026, 09:15</td>
                      <td style="padding: 15px 24px; color: #fff;">2000 W</td>
                      <td style="padding: 15px 24px; color: #fff;">4 hrs</td>
                      <td style="padding: 15px 24px; color: #fff;">24.96 Crd</td>
                      <td style="padding: 15px 24px;"><span style="color: #10b981;">Completed</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                      <td style="padding: 15px 24px; color: #fff;">#REQ-8888</td>
                      <td style="padding: 15px 24px; color: var(--text-muted);">07 Jun 2026, 20:45</td>
                      <td style="padding: 15px 24px; color: #fff;">1000 W</td>
                      <td style="padding: 15px 24px; color: #fff;">2 hrs</td>
                      <td style="padding: 15px 24px; color: #fff;">12.48 Crd</td>
                      <td style="padding: 15px 24px;"><span style="color: #10b981;">Completed</span></td>
                    </tr>
                    <tr>
                      <td style="padding: 15px 24px; color: #fff;">#REQ-8887</td>
                      <td style="padding: 15px 24px; color: var(--text-muted);">05 Jun 2026, 14:20</td>
                      <td style="padding: 15px 24px; color: #fff;">1500 W</td>
                      <td style="padding: 15px 24px; color: #fff;">3 hrs</td>
                      <td style="padding: 15px 24px; color: #fff;">18.72 Crd</td>
                      <td style="padding: 15px 24px;"><span style="color: #ef4444;">Cancelled</span></td>
                    </tr>
                  </tbody>
                </table>
             </div>
           </div>
        </div>
      </div>"""

# Page 2: Transmission Status
view_transmission = """      <div id="view-transmission" class="dashboard-scroll view" style="display: none;">
        <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 24px; color: #fff; margin: 0; font-family: var(--font-space); letter-spacing: 1px;">Transmission Status</h1>
            <p style="color: var(--text-muted); margin: 5px 0 0 0;">Monitor your active transmission pipeline</p>
          </div>
          <div class="status-badge" style="background: rgba(0, 229, 255, 0.1); border: 1px solid rgba(0, 229, 255, 0.3); padding: 8px 16px; border-radius: 20px; color: #00e5ff; font-weight: bold; display: flex; align-items: center; gap: 8px;">
            <span class="dot" style="background: #00e5ff; width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 8px #00e5ff; animation: pulse 2s infinite;"></span> LIVE
          </div>
        </div>

        <div class="grid-container" style="display: grid; gap: 24px;">
           <!-- Active Transmission Card -->
           <div class="card transmission-status" style="border: 1px solid #00e5ff; box-shadow: 0 0 20px rgba(0, 229, 255, 0.1);">
              <div class="card-header">
                <h2>ACTIVE TRANSMISSION</h2>
              </div>
              <div class="transmission-workflow page-tx-workflow">
                <div class="step complete">
                  <div class="icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
                  <strong class="name">Request</strong>
                  <span class="status text-green">Submitted</span>
                </div>
                <div class="line active"></div>
                <div class="step complete">
                  <div class="icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
                  <strong class="name">OTP</strong>
                  <span class="status text-green">Verified</span>
                </div>
                <div class="line active"></div>
                <div class="step complete">
                  <div class="icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg></div>
                  <strong class="name">Channel</strong>
                  <span class="status text-green">Assigned</span>
                </div>
                <div class="line active"></div>
                <div class="step complete">
                  <div class="icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg></div>
                  <strong class="name">Relay</strong>
                  <span class="status text-green">Verified</span>
                </div>
                <div class="line active purple"></div>
                <div class="step active pulse">
                  <div class="icon-wrap glow-cyan" style="border-color: #00e5ff; color: #00e5ff;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>
                  <strong class="name">Transmission</strong>
                  <span class="status text-cyan">Active</span>
                </div>
                <div class="line dashed"></div>
                <div class="step pending">
                  <div class="icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
                  <strong class="name">Delivery</strong>
                  <span class="status text-amber">Pending</span>
                </div>
              </div>
              <div class="transmission-details" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; padding: 24px;">
                <div class="detail-box">
                  <span class="label" style="color: var(--text-muted); font-size: 11px;">ACTIVE CHANNEL</span>
                  <strong class="value" style="color: #fff; display: block; font-size: 18px;">Channel 1</strong>
                </div>
                <div class="detail-box">
                  <span class="label" style="color: var(--text-muted); font-size: 11px;">POWER REQUESTED</span>
                  <strong class="value" style="color: #fff; display: block; font-size: 18px;">1000 W</strong>
                </div>
                <div class="detail-box">
                  <span class="label" style="color: var(--text-muted); font-size: 11px;">DURATION</span>
                  <strong class="value" style="color: #fff; display: block; font-size: 18px;">02:00:00</strong>
                </div>
                <div class="detail-box">
                  <span class="label" style="color: var(--text-muted); font-size: 11px;">ELAPSED TIME</span>
                  <strong class="value text-cyan" id="live-elapsed-time" style="display: block; font-size: 18px;">00:01:59</strong>
                </div>
                <div class="detail-box">
                  <span class="label" style="color: var(--text-muted); font-size: 11px;">EFFICIENCY</span>
                  <strong class="value text-green" style="display: block; font-size: 18px;">96.8%</strong>
                </div>
                <div class="detail-box">
                  <span class="label" style="color: var(--text-muted); font-size: 11px;">GRID HEALTH</span>
                  <strong class="value text-green" style="display: block; font-size: 18px;">99.7%</strong>
                </div>
              </div>
           </div>

           <!-- Transmission Metrics Row -->
           <div class="metrics-row" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;">
              <div class="card" style="padding: 24px;">
                 <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Total Transmitted Today</span>
                 <strong style="display: block; font-size: 24px; color: #fff; margin-top: 8px;">2.48 <span style="font-size: 14px; color: #00e5ff;">kWh</span></strong>
              </div>
              <div class="card" style="padding: 24px;">
                 <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Success Rate</span>
                 <strong style="display: block; font-size: 24px; color: #fff; margin-top: 8px;">99.2%</strong>
              </div>
              <div class="card" style="padding: 24px;">
                 <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Avg. Delivery Time</span>
                 <strong style="display: block; font-size: 24px; color: #fff; margin-top: 8px;">1.3 <span style="font-size: 14px; color: #8b5cf6;">sec</span></strong>
              </div>
              <div class="card" style="padding: 24px;">
                 <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Sessions This Month</span>
                 <strong style="display: block; font-size: 24px; color: #fff; margin-top: 8px;">14</strong>
              </div>
           </div>

           <!-- Transmission History Table -->
           <div class="card history-card">
             <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
               <h2>TRANSMISSION HISTORY (THIS MONTH)</h2>
               <div style="display: flex; gap: 10px;">
                 <select style="background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 4px;">
                   <option>All</option>
                   <option>Active</option>
                   <option>Completed</option>
                   <option>Failed</option>
                 </select>
                 <button class="action-btn" style="padding: 5px 15px;">Export CSV</button>
               </div>
             </div>
             <div class="history-table-container" style="padding: 0;">
                <table class="premium-table" style="width: 100%; text-align: left; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); color: var(--text-muted); font-size: 12px; text-transform: uppercase;">
                            <th style="padding: 15px 24px;">Session ID</th>
                            <th style="padding: 15px 24px;">Start Time</th>
                            <th style="padding: 15px 24px;">End Time</th>
                            <th style="padding: 15px 24px;">Channel</th>
                            <th style="padding: 15px 24px;">Power</th>
                            <th style="padding: 15px 24px;">kWh</th>
                            <th style="padding: 15px 24px;">Cost</th>
                            <th style="padding: 15px 24px;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                            <td style="padding: 15px 24px; color: #fff;">TRX-4481</td>
                            <td style="padding: 15px 24px; color: var(--text-muted);">10 Jun, 16:30</td>
                            <td style="padding: 15px 24px; color: var(--text-muted);">--</td>
                            <td style="padding: 15px 24px; color: #fff;">CH 1</td>
                            <td style="padding: 15px 24px; color: #fff;">1000 W</td>
                            <td style="padding: 15px 24px; color: #fff;">--</td>
                            <td style="padding: 15px 24px; color: #fff;">12.48</td>
                            <td style="padding: 15px 24px;"><span style="color: #00e5ff;">Active</span></td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                            <td style="padding: 15px 24px; color: #fff;">TRX-4480</td>
                            <td style="padding: 15px 24px; color: var(--text-muted);">09 Jun, 18:00</td>
                            <td style="padding: 15px 24px; color: var(--text-muted);">09 Jun, 19:00</td>
                            <td style="padding: 15px 24px; color: #fff;">CH 3</td>
                            <td style="padding: 15px 24px; color: #fff;">500 W</td>
                            <td style="padding: 15px 24px; color: #fff;">0.50</td>
                            <td style="padding: 15px 24px; color: #fff;">6.24</td>
                            <td style="padding: 15px 24px;"><span style="color: #10b981;">Completed</span></td>
                        </tr>
                        <!-- Add a few more rows for realism -->
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                            <td style="padding: 15px 24px; color: #fff;">TRX-4479</td>
                            <td style="padding: 15px 24px; color: var(--text-muted);">08 Jun, 09:15</td>
                            <td style="padding: 15px 24px; color: var(--text-muted);">08 Jun, 13:15</td>
                            <td style="padding: 15px 24px; color: #fff;">CH 2</td>
                            <td style="padding: 15px 24px; color: #fff;">2000 W</td>
                            <td style="padding: 15px 24px; color: #fff;">8.00</td>
                            <td style="padding: 15px 24px; color: #fff;">24.96</td>
                            <td style="padding: 15px 24px;"><span style="color: #10b981;">Completed</span></td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                            <td style="padding: 15px 24px; color: #fff;">TRX-4478</td>
                            <td style="padding: 15px 24px; color: var(--text-muted);">07 Jun, 20:45</td>
                            <td style="padding: 15px 24px; color: var(--text-muted);">07 Jun, 22:45</td>
                            <td style="padding: 15px 24px; color: #fff;">CH 1</td>
                            <td style="padding: 15px 24px; color: #fff;">1000 W</td>
                            <td style="padding: 15px 24px; color: #fff;">2.00</td>
                            <td style="padding: 15px 24px; color: #fff;">12.48</td>
                            <td style="padding: 15px 24px;"><span style="color: #10b981;">Completed</span></td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                            <td style="padding: 15px 24px; color: #fff;">TRX-4477</td>
                            <td style="padding: 15px 24px; color: var(--text-muted);">05 Jun, 14:20</td>
                            <td style="padding: 15px 24px; color: var(--text-muted);">05 Jun, 14:25</td>
                            <td style="padding: 15px 24px; color: #fff;">CH 4</td>
                            <td style="padding: 15px 24px; color: #fff;">1500 W</td>
                            <td style="padding: 15px 24px; color: #fff;">0.00</td>
                            <td style="padding: 15px 24px; color: #fff;">0.00</td>
                            <td style="padding: 15px 24px;"><span style="color: #ef4444;">Failed</span></td>
                        </tr>
                    </tbody>
                </table>
             </div>
           </div>
        </div>
      </div>"""

# Insert Live Monitoring view completely
view_monitoring = """      <!-- LIVE MONITORING VIEW -->
      <div id="view-monitoring" class="dashboard-scroll view" style="display: none;">
        <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 24px; color: #fff; margin: 0; font-family: var(--font-space); letter-spacing: 1px;">Live Monitoring</h1>
            <p style="color: var(--text-muted); margin: 5px 0 0 0;">Real-time telemetry from N16R8-ESP32</p>
          </div>
          <div class="status-badge" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 8px 16px; border-radius: 20px; color: #10b981; font-weight: bold; display: flex; align-items: center; gap: 8px;">
            <span class="dot" style="background: #10b981; width: 8px; height: 8px; border-radius: 50%;"></span> ONLINE
          </div>
        </div>

        <div class="grid-container" style="display: grid; gap: 24px;">
          <!-- Live Metrics Grid -->
          <div class="metrics-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
            <div class="metric-card" style="background: var(--card-bg); border: 1px solid var(--panel-border); border-radius: 12px; padding: 20px; position: relative; overflow: hidden;">
              <div class="mc-icon text-cyan" style="margin-bottom: 15px;"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>
              <div class="mc-info">
                <span class="label" style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Voltage</span>
                <strong class="value" id="lm-voltage" style="display: block; font-size: 28px; color: #fff;">229.4 <span style="font-size: 14px; color: #00e5ff;">V</span></strong>
              </div>
              <div class="mc-wave wave-cyan" style="position: absolute; bottom: 0; left: 0; right: 0; height: 30px; background: linear-gradient(180deg, transparent, rgba(0,229,255,0.1)); border-top: 1px solid rgba(0,229,255,0.2);"></div>
            </div>
            <div class="metric-card" style="background: var(--card-bg); border: 1px solid var(--panel-border); border-radius: 12px; padding: 20px; position: relative; overflow: hidden;">
              <div class="mc-icon text-blue" style="margin-bottom: 15px;"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#3b82f6" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><path d="M9 9h6v6H9z"></path></svg></div>
              <div class="mc-info">
                <span class="label" style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Current</span>
                <strong class="value" id="lm-current" style="display: block; font-size: 28px; color: #fff;">2.47 <span style="font-size: 14px; color: #3b82f6;">A</span></strong>
              </div>
              <div class="mc-wave wave-blue" style="position: absolute; bottom: 0; left: 0; right: 0; height: 30px; background: linear-gradient(180deg, transparent, rgba(59,130,246,0.1)); border-top: 1px solid rgba(59,130,246,0.2);"></div>
            </div>
            <div class="metric-card" style="background: var(--card-bg); border: 1px solid var(--panel-border); border-radius: 12px; padding: 20px; position: relative; overflow: hidden;">
              <div class="mc-icon text-purple" style="margin-bottom: 15px;"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg></div>
              <div class="mc-info">
                <span class="label" style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Frequency</span>
                <strong class="value" id="lm-frequency" style="display: block; font-size: 28px; color: #fff;">50.02 <span style="font-size: 14px; color: #8b5cf6;">Hz</span></strong>
              </div>
              <div class="mc-wave wave-purple" style="position: absolute; bottom: 0; left: 0; right: 0; height: 30px; background: linear-gradient(180deg, transparent, rgba(139,92,246,0.1)); border-top: 1px solid rgba(139,92,246,0.2);"></div>
            </div>
            <div class="metric-card" style="background: var(--card-bg); border: 1px solid var(--panel-border); border-radius: 12px; padding: 20px; position: relative; overflow: hidden;">
              <div class="mc-icon text-amber" style="margin-bottom: 15px;"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg></div>
              <div class="mc-info">
                <span class="label" style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Power Factor</span>
                <strong class="value" id="lm-pf" style="display: block; font-size: 28px; color: #fff;">0.98</strong>
              </div>
              <div class="mc-wave wave-amber" style="position: absolute; bottom: 0; left: 0; right: 0; height: 30px; background: linear-gradient(180deg, transparent, rgba(245,158,11,0.1)); border-top: 1px solid rgba(245,158,11,0.2);"></div>
            </div>
            <div class="metric-card" style="background: var(--card-bg); border: 1px solid var(--panel-border); border-radius: 12px; padding: 20px; position: relative; overflow: hidden;">
              <div class="mc-icon text-red" style="margin-bottom: 15px;"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg></div>
              <div class="mc-info">
                <span class="label" style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Temperature</span>
                <strong class="value" id="lm-temp" style="display: block; font-size: 28px; color: #fff;">32.4 <span style="font-size: 14px; color: #ef4444;">°C</span></strong>
              </div>
              <div class="mc-wave wave-red" style="position: absolute; bottom: 0; left: 0; right: 0; height: 30px; background: linear-gradient(180deg, transparent, rgba(239,68,68,0.1)); border-top: 1px solid rgba(239,68,68,0.2);"></div>
            </div>
            <div class="metric-card" style="background: var(--card-bg); border: 1px solid var(--panel-border); border-radius: 12px; padding: 20px; position: relative; overflow: hidden;">
              <div class="mc-icon text-green" style="margin-bottom: 15px;"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#10b981" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"></path></svg></div>
              <div class="mc-info">
                <span class="label" style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Signal Strength</span>
                <strong class="value" id="lm-signal" style="display: block; font-size: 28px; color: #fff;">-42 <span style="font-size: 14px; color: #10b981;">dBm</span></strong>
              </div>
              <div class="mc-wave wave-green" style="position: absolute; bottom: 0; left: 0; right: 0; height: 30px; background: linear-gradient(180deg, transparent, rgba(16,185,129,0.1)); border-top: 1px solid rgba(16,185,129,0.2);"></div>
            </div>
          </div>

          <!-- Live Power Graph & Device Info -->
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
            <div class="card" style="padding: 24px;">
               <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                 <h2 style="font-size: 14px; color: var(--text-muted); letter-spacing: 1px;">REAL-TIME POWER CONSUMPTION</h2>
                 <div style="display: flex; gap: 15px;">
                   <span style="font-size: 12px; color: #00e5ff;">Current: <strong id="lm-current-power">567W</strong></span>
                   <span style="font-size: 12px; color: #10b981;">Peak: <strong>892W</strong></span>
                   <span style="font-size: 12px; color: var(--text-muted);">Min: <strong>124W</strong></span>
                 </div>
               </div>
               <div style="height: 300px; width: 100%; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; position: relative;">
                  <canvas id="live-power-chart" style="width: 100%; height: 100%;"></canvas>
               </div>
            </div>

            <div class="card" style="padding: 24px;">
               <h2 style="font-size: 14px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 20px;">DEVICE INFO</h2>
               <div style="display: flex; flex-direction: column; gap: 15px;">
                 <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
                   <span style="color: var(--text-muted); font-size: 12px;">Device</span>
                   <strong style="color: #fff; font-size: 14px;">N16R8-ESP32</strong>
                 </div>
                 <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
                   <span style="color: var(--text-muted); font-size: 12px;">Firmware</span>
                   <strong style="color: #fff; font-size: 14px;">v2.4.1</strong>
                 </div>
                 <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
                   <span style="color: var(--text-muted); font-size: 12px;">Last Ping</span>
                   <strong style="color: #10b981; font-size: 14px;">&lt;1ms</strong>
                 </div>
                 <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
                   <span style="color: var(--text-muted); font-size: 12px;">Uptime</span>
                   <strong style="color: #fff; font-size: 14px;">02:45:12</strong>
                 </div>
                 <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
                   <span style="color: var(--text-muted); font-size: 12px;">Connection</span>
                   <strong style="color: #8b5cf6; font-size: 14px;">AES-256 Encrypted</strong>
                 </div>
                 <div style="display: flex; justify-content: space-between;">
                   <span style="color: var(--text-muted); font-size: 12px;">MAC Address</span>
                   <strong style="color: #fff; font-size: 14px;">N1:6R:8E:SP:32:00</strong>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>"""

# Page 5: Energy Usage
view_usage = """      <div id="view-usage" class="dashboard-scroll view" style="display: none;">
        <div class="page-header" style="margin-bottom: 24px;">
          <h1 style="font-size: 24px; color: #fff; margin: 0; font-family: var(--font-space); letter-spacing: 1px;">Energy Usage</h1>
          <p style="color: var(--text-muted); margin: 5px 0 0 0;">Consumption analytics for HOME-117</p>
        </div>

        <div class="grid-container" style="display: grid; gap: 24px;">
           <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;">
              <div class="card" style="padding: 20px;">
                 <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Today</span>
                 <strong style="display: block; font-size: 24px; color: #fff; margin-top: 8px;">2.48 <span style="font-size: 14px; color: #00e5ff;">kWh</span></strong>
                 <div style="color: #10b981; font-size: 14px; margin-top: 5px;">₹ 12.48</div>
              </div>
              <div class="card" style="padding: 20px;">
                 <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">This Week</span>
                 <strong style="display: block; font-size: 24px; color: #fff; margin-top: 8px;">17.3 <span style="font-size: 14px; color: #00e5ff;">kWh</span></strong>
                 <div style="color: #10b981; font-size: 14px; margin-top: 5px;">₹ 87.20</div>
              </div>
              <div class="card" style="padding: 20px;">
                 <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">This Month</span>
                 <strong style="display: block; font-size: 24px; color: #fff; margin-top: 8px;">68.4 <span style="font-size: 14px; color: #00e5ff;">kWh</span></strong>
                 <div style="color: #10b981; font-size: 14px; margin-top: 5px;">₹ 344.52</div>
              </div>
              <div class="card" style="padding: 20px;">
                 <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Avg Daily</span>
                 <strong style="display: block; font-size: 24px; color: #fff; margin-top: 8px;">2.21 <span style="font-size: 14px; color: #00e5ff;">kWh</span></strong>
                 <div style="color: #10b981; font-size: 14px; margin-top: 5px;">₹ 11.14</div>
              </div>
           </div>

           <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
              <div class="card" style="padding: 24px;">
                 <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                   <h2 style="font-size: 14px; color: var(--text-muted); letter-spacing: 1px;">USAGE GRAPH (LAST 7 DAYS)</h2>
                   <div style="display: flex; gap: 10px;">
                     <button class="action-btn" style="padding: 5px 10px; font-size: 12px; border-color: #00e5ff; color: #00e5ff;">Daily</button>
                     <button class="action-btn" style="padding: 5px 10px; font-size: 12px;">Weekly</button>
                     <button class="action-btn" style="padding: 5px 10px; font-size: 12px;">Monthly</button>
                   </div>
                 </div>
                 <div style="height: 250px; display: flex; align-items: flex-end; justify-content: space-between; padding-top: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="display: flex; flex-direction: column; align-items: center; width: 10%;"><div style="height: 50%; width: 20px; background: #00e5ff; border-radius: 4px 4px 0 0;"></div><span style="margin-top: 10px; font-size: 12px; color: var(--text-muted);">Mon</span></div>
                    <div style="display: flex; flex-direction: column; align-items: center; width: 10%;"><div style="height: 70%; width: 20px; background: #00e5ff; border-radius: 4px 4px 0 0;"></div><span style="margin-top: 10px; font-size: 12px; color: var(--text-muted);">Tue</span></div>
                    <div style="display: flex; flex-direction: column; align-items: center; width: 10%;"><div style="height: 60%; width: 20px; background: #00e5ff; border-radius: 4px 4px 0 0;"></div><span style="margin-top: 10px; font-size: 12px; color: var(--text-muted);">Wed</span></div>
                    <div style="display: flex; flex-direction: column; align-items: center; width: 10%;"><div style="height: 85%; width: 20px; background: #00e5ff; border-radius: 4px 4px 0 0;"></div><span style="margin-top: 10px; font-size: 12px; color: var(--text-muted);">Thu</span></div>
                    <div style="display: flex; flex-direction: column; align-items: center; width: 10%;"><div style="height: 55%; width: 20px; background: #00e5ff; border-radius: 4px 4px 0 0;"></div><span style="margin-top: 10px; font-size: 12px; color: var(--text-muted);">Fri</span></div>
                    <div style="display: flex; flex-direction: column; align-items: center; width: 10%;"><div style="height: 75%; width: 20px; background: #00e5ff; border-radius: 4px 4px 0 0;"></div><span style="margin-top: 10px; font-size: 12px; color: var(--text-muted);">Sat</span></div>
                    <div style="display: flex; flex-direction: column; align-items: center; width: 10%;"><div style="height: 80%; width: 20px; background: #8b5cf6; border-radius: 4px 4px 0 0;"></div><span style="margin-top: 10px; font-size: 12px; color: var(--text-muted);">Sun</span></div>
                 </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 24px;">
                <div class="card" style="padding: 24px;">
                   <h2 style="font-size: 14px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 20px;">TIME-OF-DAY BREAKDOWN</h2>
                   <div style="display: flex; flex-direction: column; gap: 15px;">
                     <div style="display: flex; justify-content: space-between; align-items: center;">
                       <span style="color: #fff; font-size: 14px; display: flex; align-items: center; gap: 10px;"><div style="width: 12px; height: 12px; border-radius: 50%; background: #f59e0b;"></div> Morning (6am-12pm)</span>
                       <strong style="color: #fff;">0.62 kWh</strong>
                     </div>
                     <div style="display: flex; justify-content: space-between; align-items: center;">
                       <span style="color: #fff; font-size: 14px; display: flex; align-items: center; gap: 10px;"><div style="width: 12px; height: 12px; border-radius: 50%; background: #00e5ff;"></div> Afternoon (12pm-6pm)</span>
                       <strong style="color: #fff;">0.74 kWh</strong>
                     </div>
                     <div style="display: flex; justify-content: space-between; align-items: center;">
                       <span style="color: #fff; font-size: 14px; display: flex; align-items: center; gap: 10px;"><div style="width: 12px; height: 12px; border-radius: 50%; background: #8b5cf6;"></div> Evening (6pm-12am)</span>
                       <strong style="color: #fff;">0.91 kWh</strong>
                     </div>
                     <div style="display: flex; justify-content: space-between; align-items: center;">
                       <span style="color: #fff; font-size: 14px; display: flex; align-items: center; gap: 10px;"><div style="width: 12px; height: 12px; border-radius: 50%; background: #3b82f6;"></div> Night (12am-6am)</span>
                       <strong style="color: #fff;">0.21 kWh</strong>
                     </div>
                   </div>
                </div>
                <div class="card" style="padding: 24px;">
                   <h2 style="font-size: 14px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 20px;">EFFICIENCY TRENDS</h2>
                   <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                     <span style="color: var(--text-muted); font-size: 12px;">Average: <strong style="color: #fff;">96.2%</strong></span>
                     <span style="color: var(--text-muted); font-size: 12px;">Current: <strong style="color: #10b981;">96.8%</strong></span>
                     <span style="color: var(--text-muted); font-size: 12px;">Best: <strong style="color: #00e5ff;">99.1%</strong></span>
                   </div>
                </div>
              </div>
           </div>

           <div class="card" style="padding: 24px;">
              <h2 style="font-size: 14px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 20px;">USAGE TIPS</h2>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                <div style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); padding: 15px; border-radius: 8px;">
                  <strong style="color: #f59e0b; display: block; margin-bottom: 8px;">Peak Usage Detected</strong>
                  <p style="color: #fff; font-size: 13px; line-height: 1.5; margin: 0;">Peak usage detected 6-9pm. Schedule large loads before 5pm to save credits.</p>
                </div>
                <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 8px;">
                  <strong style="color: #10b981; display: block; margin-bottom: 8px;">Optimal Performance</strong>
                  <p style="color: #fff; font-size: 13px; line-height: 1.5; margin: 0;">Your efficiency is above 96%. Your relay hardware is performing optimally.</p>
                </div>
                <div style="background: rgba(0, 229, 255, 0.05); border: 1px solid rgba(0, 229, 255, 0.2); padding: 15px; border-radius: 8px;">
                  <strong style="color: #00e5ff; display: block; margin-bottom: 8px;">Budget Alert</strong>
                  <p style="color: #fff; font-size: 13px; line-height: 1.5; margin: 0;">At this rate, this month's cost will be ₹344. Within normal range.</p>
                </div>
              </div>
           </div>
        </div>
      </div>"""

# Page 6: Safety & Security
view_safety = """      <div id="view-safety" class="dashboard-scroll view" style="display: none;">
        <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 24px; color: #fff; margin: 0; font-family: var(--font-space); letter-spacing: 1px;">Safety & Security</h1>
            <p style="color: var(--text-muted); margin: 5px 0 0 0;">Transmission integrity and home protection status</p>
          </div>
          <div class="status-badge" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 8px 16px; border-radius: 20px; color: #10b981; font-weight: bold; display: flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> SECURE
          </div>
        </div>

        <div class="grid-container" style="display: grid; gap: 24px;">
           <!-- Security Status Overview -->
           <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;">
              <div class="card" style="padding: 20px;">
                 <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Safety Status</span>
                 <strong style="display: block; font-size: 20px; color: #10b981; margin-top: 8px;">SAFE</strong>
              </div>
              <div class="card" style="padding: 20px;">
                 <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Relay Status</span>
                 <strong style="display: block; font-size: 20px; color: #10b981; margin-top: 8px; display: flex; align-items: center; gap: 8px;"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> CLOSED</strong>
              </div>
              <div class="card" style="padding: 20px;">
                 <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Encryption</span>
                 <strong style="display: block; font-size: 20px; color: #8b5cf6; margin-top: 8px;">AES-256 Active</strong>
              </div>
              <div class="card" style="padding: 20px;">
                 <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Intrusion Detection</span>
                 <strong style="display: block; font-size: 20px; color: #10b981; margin-top: 8px;">No Threats</strong>
              </div>
           </div>

           <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
             <!-- Transmission Security Card -->
             <div class="card" style="padding: 24px;">
               <h2 style="font-size: 14px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 20px;">TRANSMISSION SECURITY</h2>
               <div style="display: flex; flex-direction: column; gap: 15px;">
                 <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
                   <span style="color: var(--text-muted); font-size: 14px;">AES-256 Encryption Status</span>
                   <strong style="color: #8b5cf6; font-size: 14px;">Active</strong>
                 </div>
                 <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
                   <span style="color: var(--text-muted); font-size: 14px;">Key Rotation</span>
                   <strong style="color: #fff; font-size: 14px;">Every 15 mins (last: 00:03:24 ago)</strong>
                 </div>
                 <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
                   <span style="color: var(--text-muted); font-size: 14px;">Tunnel ID</span>
                   <strong style="color: #fff; font-size: 14px;">TUN-8849-XQ</strong>
                 </div>
                 <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
                   <span style="color: var(--text-muted); font-size: 14px;">Certificate</span>
                   <strong style="color: #10b981; font-size: 14px;">Valid (expires in 347 days)</strong>
                 </div>
                 <div style="display: flex; justify-content: space-between;">
                   <span style="color: var(--text-muted); font-size: 14px;">End-to-End Integrity</span>
                   <strong style="color: #10b981; font-size: 14px;">Verified ✓</strong>
                 </div>
               </div>
             </div>

             <!-- Emergency Controls Card -->
             <div class="card" style="padding: 24px; border: 1px solid rgba(239, 68, 68, 0.3);">
               <h2 style="font-size: 14px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 20px;">EMERGENCY CONTROLS</h2>
               <button class="btn-emergency" style="width: 100%; padding: 20px; font-size: 18px; justify-content: center; margin-bottom: 10px;">
                 <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                 EMERGENCY DISCONNECT
               </button>
               <p style="color: #ef4444; font-size: 12px; text-align: center; margin-bottom: 20px; line-height: 1.4;">Immediately cuts power relay. Use only in critical situations.</p>
               
               <button class="action-btn" style="width: 100%; justify-content: center; border-color: #f59e0b; color: #f59e0b;">
                 Safe Shutdown
               </button>
             </div>
           </div>

           <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
             <!-- Safety Alerts Log -->
             <div class="card" style="padding: 0;">
               <div class="card-header">
                 <h2>SAFETY ALERTS LOG</h2>
               </div>
               <table class="premium-table" style="width: 100%; text-align: left; border-collapse: collapse;">
                 <thead>
                   <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); color: var(--text-muted); font-size: 12px; text-transform: uppercase;">
                     <th style="padding: 15px 24px;">Timestamp</th>
                     <th style="padding: 15px 24px;">Event Type</th>
                     <th style="padding: 15px 24px;">Severity</th>
                     <th style="padding: 15px 24px;">Action Taken</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                     <td style="padding: 15px 24px; color: var(--text-muted);">10 Jun, 16:30:12</td>
                     <td style="padding: 15px 24px; color: #fff;">Relay check passed</td>
                     <td style="padding: 15px 24px;"><span style="color: #00e5ff;">INFO</span></td>
                     <td style="padding: 15px 24px; color: #fff;">Logged</td>
                   </tr>
                   <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                     <td style="padding: 15px 24px; color: var(--text-muted);">10 Jun, 16:15:00</td>
                     <td style="padding: 15px 24px; color: #fff;">Encryption key rotated</td>
                     <td style="padding: 15px 24px;"><span style="color: #00e5ff;">INFO</span></td>
                     <td style="padding: 15px 24px; color: #fff;">Tunnel updated</td>
                   </tr>
                   <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                     <td style="padding: 15px 24px; color: var(--text-muted);">10 Jun, 14:02:45</td>
                     <td style="padding: 15px 24px; color: #fff;">Signal strength nominal</td>
                     <td style="padding: 15px 24px;"><span style="color: #00e5ff;">INFO</span></td>
                     <td style="padding: 15px 24px; color: #fff;">None</td>
                   </tr>
                   <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                     <td style="padding: 15px 24px; color: var(--text-muted);">09 Jun, 18:00:22</td>
                     <td style="padding: 15px 24px; color: #fff;">Relay check passed</td>
                     <td style="padding: 15px 24px;"><span style="color: #00e5ff;">INFO</span></td>
                     <td style="padding: 15px 24px; color: #fff;">Logged</td>
                   </tr>
                   <tr>
                     <td style="padding: 15px 24px; color: var(--text-muted);">08 Jun, 09:15:05</td>
                     <td style="padding: 15px 24px; color: #fff;">Voltage spike detected</td>
                     <td style="padding: 15px 24px;"><span style="color: #f59e0b;">LOW</span></td>
                     <td style="padding: 15px 24px; color: #fff;">Auto-corrected</td>
                   </tr>
                 </tbody>
               </table>
             </div>

             <!-- Access Log -->
             <div class="card" style="padding: 24px;">
               <h2 style="font-size: 14px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 20px;">ACCESS LOG</h2>
               <div style="display: flex; flex-direction: column; gap: 15px;">
                 <div style="border-left: 2px solid #10b981; padding-left: 10px;">
                   <div style="color: #fff; font-size: 14px; margin-bottom: 3px;">Chrome / Windows</div>
                   <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted);">
                     <span>192.168.81.55</span>
                     <span>10 Jun, 16:05</span>
                   </div>
                 </div>
                 <div style="border-left: 2px solid #10b981; padding-left: 10px;">
                   <div style="color: #fff; font-size: 14px; margin-bottom: 3px;">Safari / iOS</div>
                   <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted);">
                     <span>192.168.81.102</span>
                     <span>09 Jun, 17:45</span>
                   </div>
                 </div>
                 <div style="border-left: 2px solid #10b981; padding-left: 10px;">
                   <div style="color: #fff; font-size: 14px; margin-bottom: 3px;">Chrome / Windows</div>
                   <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted);">
                     <span>192.168.81.55</span>
                     <span>08 Jun, 09:10</span>
                   </div>
                 </div>
                 <div style="border-left: 2px solid #ef4444; padding-left: 10px;">
                   <div style="color: #fff; font-size: 14px; margin-bottom: 3px;">Unknown Device</div>
                   <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted);">
                     <span>45.22.109.11</span>
                     <span>07 Jun, 23:15</span>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </div>"""

# Page 7: Activity Timeline
view_timeline = """      <div id="view-timeline" class="dashboard-scroll view" style="display: none;">
        <div class="page-header" style="margin-bottom: 24px;">
          <h1 style="font-size: 24px; color: #fff; margin: 0; font-family: var(--font-space); letter-spacing: 1px;">Activity Timeline</h1>
          <p style="color: var(--text-muted); margin: 5px 0 0 0;">Full event history for HOME-117</p>
        </div>

        <div class="grid-container" style="display: grid; gap: 24px; max-width: 800px; margin: 0 auto;">
           <div style="display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
             <button class="action-btn" style="border-color: #00e5ff; color: #00e5ff;">All</button>
             <button class="action-btn">Transmissions</button>
             <button class="action-btn">Security</button>
             <button class="action-btn">System</button>
             <button class="action-btn">Wallet</button>
             <button class="action-btn">Alerts</button>
           </div>

           <div class="card" style="padding: 30px;">
              <div style="position: relative; padding-left: 30px;">
                 <!-- Line -->
                 <div style="position: absolute; left: 11px; top: 10px; bottom: 0; width: 2px; background: rgba(255,255,255,0.1);"></div>

                 <!-- Item 1 -->
                 <div style="position: relative; margin-bottom: 30px;">
                   <div style="position: absolute; left: -24px; top: 5px; width: 10px; height: 10px; border-radius: 50%; background: #00e5ff; box-shadow: 0 0 10px #00e5ff;"></div>
                   <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 5px;">Today, 16:30:15</div>
                   <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 5px;">⚡ Transmission Started</div>
                   <div style="color: #aaa; font-size: 14px;">Channel 1 assigned, 1000W requested</div>
                 </div>

                 <!-- Item 2 -->
                 <div style="position: relative; margin-bottom: 30px;">
                   <div style="position: absolute; left: -24px; top: 5px; width: 10px; height: 10px; border-radius: 50%; background: #8b5cf6;"></div>
                   <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 5px;">Today, 16:30:12</div>
                   <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 5px;">🔐 OTP Verified</div>
                   <div style="color: #aaa; font-size: 14px;">Authentication successful for session #TRX-4481</div>
                 </div>
                 
                 <!-- Item 3 -->
                 <div style="position: relative; margin-bottom: 30px;">
                   <div style="position: absolute; left: -24px; top: 5px; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b;"></div>
                   <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 5px;">Today, 16:30:05</div>
                   <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 5px;">💳 Credits Deducted</div>
                   <div style="color: #aaa; font-size: 14px;">12.48 credits reserved for session #TRX-4481</div>
                 </div>

                 <!-- Item 4 -->
                 <div style="position: relative; margin-bottom: 30px;">
                   <div style="position: absolute; left: -24px; top: 5px; width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></div>
                   <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 5px;">Today, 16:15:00</div>
                   <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 5px;">🔑 Encryption Key Rotated</div>
                   <div style="color: #aaa; font-size: 14px;">Scheduled AES-256 rotation completed</div>
                 </div>

                 <!-- Item 5 -->
                 <div style="position: relative; margin-bottom: 30px;">
                   <div style="position: absolute; left: -24px; top: 5px; width: 10px; height: 10px; border-radius: 50%; background: #00e5ff;"></div>
                   <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 5px;">Today, 16:05:22</div>
                   <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 5px;">👤 User Login</div>
                   <div style="color: #aaa; font-size: 14px;">Aditya Raj logged in from Chrome/Windows</div>
                 </div>

                 <!-- Item 6 -->
                 <div style="position: relative; margin-bottom: 30px;">
                   <div style="position: absolute; left: -24px; top: 5px; width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></div>
                   <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 5px;">Yesterday, 19:00:00</div>
                   <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 5px;">✅ Transmission Completed</div>
                   <div style="color: #aaa; font-size: 14px;">0.50 kWh delivered, 98.1% efficiency (Session #TRX-4480)</div>
                 </div>

                 <!-- Item 7 -->
                 <div style="position: relative; margin-bottom: 30px;">
                   <div style="position: absolute; left: -24px; top: 5px; width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></div>
                   <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 5px;">Yesterday, 18:00:00</div>
                   <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 5px;">🔄 Relay Connected</div>
                   <div style="color: #aaa; font-size: 14px;">N16R8-ESP32 relay established successfully</div>
                 </div>

                 <!-- Item 8 -->
                 <div style="position: relative; margin-bottom: 30px;">
                   <div style="position: absolute; left: -24px; top: 5px; width: 10px; height: 10px; border-radius: 50%; background: #3b82f6;"></div>
                   <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 5px;">Yesterday, 12:00:00</div>
                   <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 5px;">⚙️ System Health Check</div>
                   <div style="color: #aaa; font-size: 14px;">All systems nominal (100%)</div>
                 </div>
              </div>
           </div>
        </div>
      </div>"""

# Page 8: Device & Relay
view_device = """      <div id="view-device" class="dashboard-scroll view" style="display: none;">
        <div class="page-header" style="margin-bottom: 24px;">
          <h1 style="font-size: 24px; color: #fff; margin: 0; font-family: var(--font-space); letter-spacing: 1px;">Device & Relay</h1>
          <p style="color: var(--text-muted); margin: 5px 0 0 0;">Hardware management for N16R8-ESP32</p>
        </div>

        <div class="grid-container" style="display: grid; gap: 24px;">
           <!-- Device Status Card -->
           <div class="card" style="padding: 30px; display: flex; align-items: center; gap: 30px; border: 1px solid rgba(0, 229, 255, 0.2); background: linear-gradient(135deg, rgba(17, 24, 39, 1) 0%, rgba(0, 40, 50, 0.4) 100%);">
              <div style="width: 100px; height: 100px; border-radius: 12px; background: #000; border: 2px solid #00e5ff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);">
                 <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#00e5ff" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
              </div>
              <div style="flex: 1;">
                 <h2 style="font-size: 24px; color: #fff; margin: 0 0 10px 0;">N16R8-ESP32</h2>
                 <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                    <div style="color: var(--text-muted);">Status: <strong style="color: #10b981;">ONLINE</strong></div>
                    <div style="color: var(--text-muted);">Location: <strong style="color: #fff;">HOME-117</strong></div>
                    <div style="color: var(--text-muted);">Type: <strong style="color: #fff;">ESP32 Wireless Relay</strong></div>
                    <div style="color: var(--text-muted);">Firmware: <strong style="color: #fff;">v2.4.1</strong></div>
                    <div style="color: var(--text-muted);">Connection: <strong style="color: #fff;">Wi-Fi 2.4GHz</strong></div>
                    <div style="color: var(--text-muted);">IP Address: <strong style="color: #fff;">192.168.81.205</strong></div>
                    <div style="color: var(--text-muted);">Signal: <strong style="color: #10b981;">-42 dBm</strong></div>
                    <div style="color: var(--text-muted);">Uptime: <strong style="color: #fff;">02:45:12</strong></div>
                 </div>
              </div>
           </div>

           <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
             <!-- Relay Controls -->
             <div class="card" style="padding: 24px;">
               <h2 style="font-size: 14px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 20px;">RELAY CONTROLS</h2>
               <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 15px; margin-bottom: 15px;">
                 <div>
                   <strong style="color: #fff; font-size: 16px; display: block;">Relay 1 (Main Power)</strong>
                   <span style="color: #10b981; font-size: 12px;">Status: CLOSED</span>
                 </div>
                 <button class="action-btn" style="border-color: #ef4444; color: #ef4444;">Open Relay</button>
               </div>
               <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 15px; margin-bottom: 15px;">
                 <div>
                   <strong style="color: #fff; font-size: 16px; display: block;">Relay 2 (Auxiliary)</strong>
                   <span style="color: #ef4444; font-size: 12px;">Status: OPEN</span>
                 </div>
                 <button class="action-btn" style="border-color: #10b981; color: #10b981;">Close Relay</button>
               </div>
               <p style="color: #f59e0b; font-size: 12px; margin-bottom: 20px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px; vertical-align:-2px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Manual override will interrupt active transmissions.</p>
               
               <div style="display: flex; gap: 15px;">
                 <button class="action-btn" style="flex: 1; border-color: #f59e0b; color: #f59e0b;">Restart Device</button>
                 <button class="action-btn" style="flex: 1; border-color: #ef4444; color: #ef4444;">Factory Reset</button>
               </div>
             </div>

             <!-- Hardware Diagnostics -->
             <div class="card" style="padding: 24px;">
               <h2 style="font-size: 14px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 20px;">HARDWARE DIAGNOSTICS</h2>
               <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                 <div>
                   <span style="color: var(--text-muted); font-size: 12px;">CPU Load</span>
                   <strong style="color: #fff; display: block; font-size: 18px;">12%</strong>
                 </div>
                 <div>
                   <span style="color: var(--text-muted); font-size: 12px;">RAM Usage</span>
                   <strong style="color: #fff; display: block; font-size: 18px;">34%</strong>
                 </div>
                 <div>
                   <span style="color: var(--text-muted); font-size: 12px;">Flash Storage</span>
                   <strong style="color: #fff; display: block; font-size: 18px;">18% <span style="font-size: 12px; font-weight: normal;">used</span></strong>
                 </div>
                 <div>
                   <span style="color: var(--text-muted); font-size: 12px;">Temperature</span>
                   <strong style="color: #10b981; display: block; font-size: 18px;">32.4°C</strong>
                 </div>
                 <div>
                   <span style="color: var(--text-muted); font-size: 12px;">Voltage Input</span>
                   <strong style="color: #00e5ff; display: block; font-size: 18px;">3.3V</strong>
                 </div>
                 <div>
                   <span style="color: var(--text-muted); font-size: 12px;">GPIO Status</span>
                   <strong style="color: #10b981; display: block; font-size: 18px;">Nominal</strong>
                 </div>
               </div>
             </div>
           </div>

           <!-- Relay History -->
           <div class="card" style="padding: 0;">
             <div class="card-header">
               <h2>RELAY HISTORY</h2>
             </div>
             <table class="premium-table" style="width: 100%; text-align: left; border-collapse: collapse;">
               <thead>
                 <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); color: var(--text-muted); font-size: 12px; text-transform: uppercase;">
                   <th style="padding: 15px 24px;">Timestamp</th>
                   <th style="padding: 15px 24px;">Event</th>
                   <th style="padding: 15px 24px;">Triggered By</th>
                   <th style="padding: 15px 24px;">Duration</th>
                 </tr>
               </thead>
               <tbody>
                 <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                   <td style="padding: 15px 24px; color: var(--text-muted);">10 Jun, 16:30:15</td>
                   <td style="padding: 15px 24px; color: #10b981;">Relay 1 CLOSED</td>
                   <td style="padding: 15px 24px; color: #fff;">System (Auto)</td>
                   <td style="padding: 15px 24px; color: #fff;">Active</td>
                 </tr>
                 <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                   <td style="padding: 15px 24px; color: var(--text-muted);">09 Jun, 19:00:00</td>
                   <td style="padding: 15px 24px; color: #ef4444;">Relay 1 OPENED</td>
                   <td style="padding: 15px 24px; color: #fff;">System (Auto)</td>
                   <td style="padding: 15px 24px; color: #fff;">21h 30m</td>
                 </tr>
                 <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                   <td style="padding: 15px 24px; color: var(--text-muted);">09 Jun, 18:00:00</td>
                   <td style="padding: 15px 24px; color: #10b981;">Relay 1 CLOSED</td>
                   <td style="padding: 15px 24px; color: #fff;">System (Auto)</td>
                   <td style="padding: 15px 24px; color: #fff;">1h 00m</td>
                 </tr>
                 <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                   <td style="padding: 15px 24px; color: var(--text-muted);">08 Jun, 13:15:00</td>
                   <td style="padding: 15px 24px; color: #ef4444;">Relay 1 OPENED</td>
                   <td style="padding: 15px 24px; color: #fff;">System (Auto)</td>
                   <td style="padding: 15px 24px; color: #fff;">28h 45m</td>
                 </tr>
                 <tr>
                   <td style="padding: 15px 24px; color: var(--text-muted);">08 Jun, 09:15:00</td>
                   <td style="padding: 15px 24px; color: #10b981;">Relay 1 CLOSED</td>
                   <td style="padding: 15px 24px; color: #fff;">System (Auto)</td>
                   <td style="padding: 15px 24px; color: #fff;">4h 00m</td>
                 </tr>
               </tbody>
             </table>
           </div>
        </div>
      </div>"""

# Page 9: Energy Wallet
view_wallet = """      <div id="view-wallet" class="dashboard-scroll view" style="display: none;">
        <div class="page-header" style="margin-bottom: 24px;">
          <h1 style="font-size: 24px; color: #fff; margin: 0; font-family: var(--font-space); letter-spacing: 1px;">Energy Wallet</h1>
          <p style="color: var(--text-muted); margin: 5px 0 0 0;">Manage your transmission credits</p>
        </div>

        <div class="grid-container" style="display: grid; gap: 24px;">
           <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
             <!-- Balance Card -->
             <div class="card" style="padding: 30px; background: linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border: 1px solid rgba(0, 229, 255, 0.2); position: relative; overflow: hidden;">
               <div style="position: absolute; right: -20px; top: -20px; opacity: 0.1;">
                 <svg viewBox="0 0 24 24" width="200" height="200" fill="currentColor"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
               </div>
               <span style="color: var(--text-muted); font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Current Balance</span>
               <strong style="color: #fff; display: block; font-size: 48px; margin: 10px 0; font-family: var(--font-space);">2,450.75 <span style="font-size: 20px; color: #00e5ff;">Credits</span></strong>
               <div style="color: #10b981; font-size: 16px; margin-bottom: 30px;">≈ ₹ 2,450.75 INR equivalent</div>
               
               <div style="display: flex; gap: 15px; align-items: center;">
                 <button class="btn-glow-cyan" style="padding: 12px 24px; font-weight: bold; border-radius: 8px;">Add Credits</button>
                 <div style="display: flex; align-items: center; gap: 10px; margin-left: 20px;">
                   <span style="color: var(--text-muted); font-size: 14px;">Auto-recharge</span>
                   <div style="width: 40px; height: 20px; background: rgba(255,255,255,0.1); border-radius: 10px; position: relative; cursor: pointer;">
                     <div style="width: 16px; height: 16px; background: #fff; border-radius: 50%; position: absolute; top: 2px; left: 2px;"></div>
                   </div>
                 </div>
               </div>
             </div>

             <!-- Spend Summary -->
             <div style="display: flex; flex-direction: column; gap: 15px;">
               <div class="card" style="padding: 20px; flex: 1;">
                 <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Today's Spend</span>
                 <strong style="color: #fff; display: block; font-size: 20px; margin-top: 5px;">12.48 Credits</strong>
               </div>
               <div class="card" style="padding: 20px; flex: 1;">
                 <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">This Week</span>
                 <strong style="color: #fff; display: block; font-size: 20px; margin-top: 5px;">87.20 Credits</strong>
               </div>
               <div class="card" style="padding: 20px; flex: 1;">
                 <span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">This Month</span>
                 <strong style="color: #fff; display: block; font-size: 20px; margin-top: 5px;">344.52 Credits</strong>
               </div>
             </div>
           </div>

           <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 24px;">
             <!-- Add Credits Form -->
             <div class="card" style="padding: 24px;">
               <h2 style="font-size: 14px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 20px;">QUICK TOP-UP</h2>
               <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                 <button class="action-btn" style="justify-content: center; border-color: #00e5ff; color: #00e5ff;">+100</button>
                 <button class="action-btn" style="justify-content: center;">+500</button>
                 <button class="action-btn" style="justify-content: center;">+1000</button>
                 <button class="action-btn" style="justify-content: center;">+2000</button>
               </div>
               <input type="text" placeholder="Custom Amount" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 12px; color: #fff; border-radius: 4px; margin-bottom: 20px;">
               
               <h3 style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase;">Payment Method</h3>
               <select style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 12px; color: #fff; border-radius: 4px; margin-bottom: 20px;">
                 <option>UPI</option>
                 <option>Net Banking</option>
                 <option>Debit Card</option>
                 <option>Credit Card</option>
               </select>

               <button class="btn-glow-cyan" style="width: 100%; padding: 12px; border-radius: 4px; font-weight: bold;">Proceed to Payment</button>
             </div>

             <!-- Transaction History -->
             <div class="card" style="padding: 0;">
               <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                 <h2>TRANSACTION HISTORY</h2>
                 <div style="display: flex; gap: 10px;">
                   <button class="action-btn" style="padding: 5px 15px; font-size: 12px;">Export PDF</button>
                   <button class="action-btn" style="padding: 5px 15px; font-size: 12px;">Download CSV</button>
                 </div>
               </div>
               <div style="max-height: 400px; overflow-y: auto;">
                 <table class="premium-table" style="width: 100%; text-align: left; border-collapse: collapse;">
                   <thead style="position: sticky; top: 0; background: var(--card-bg);">
                     <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); color: var(--text-muted); font-size: 12px; text-transform: uppercase;">
                       <th style="padding: 15px 24px;">Date</th>
                       <th style="padding: 15px 24px;">Description</th>
                       <th style="padding: 15px 24px;">Type</th>
                       <th style="padding: 15px 24px;">Amount</th>
                       <th style="padding: 15px 24px;">Balance</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                       <td style="padding: 15px 24px; color: var(--text-muted);">10 Jun, 16:30</td>
                       <td style="padding: 15px 24px; color: #fff;">Transmission #TRX-4481</td>
                       <td style="padding: 15px 24px; color: #fff;">Debit</td>
                       <td style="padding: 15px 24px; color: #ef4444;">-12.48</td>
                       <td style="padding: 15px 24px; color: #fff;">2,450.75</td>
                     </tr>
                     <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                       <td style="padding: 15px 24px; color: var(--text-muted);">10 Jun, 10:00</td>
                       <td style="padding: 15px 24px; color: #fff;">Credits Added via UPI</td>
                       <td style="padding: 15px 24px; color: #fff;">Credit</td>
                       <td style="padding: 15px 24px; color: #10b981;">+500.00</td>
                       <td style="padding: 15px 24px; color: #fff;">2,463.23</td>
                     </tr>
                     <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                       <td style="padding: 15px 24px; color: var(--text-muted);">09 Jun, 18:00</td>
                       <td style="padding: 15px 24px; color: #fff;">Transmission #TRX-4480</td>
                       <td style="padding: 15px 24px; color: #fff;">Debit</td>
                       <td style="padding: 15px 24px; color: #ef4444;">-6.24</td>
                       <td style="padding: 15px 24px; color: #fff;">1,963.23</td>
                     </tr>
                     <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                       <td style="padding: 15px 24px; color: var(--text-muted);">08 Jun, 09:15</td>
                       <td style="padding: 15px 24px; color: #fff;">Transmission #TRX-4479</td>
                       <td style="padding: 15px 24px; color: #fff;">Debit</td>
                       <td style="padding: 15px 24px; color: #ef4444;">-24.96</td>
                       <td style="padding: 15px 24px; color: #fff;">1,969.47</td>
                     </tr>
                     <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                       <td style="padding: 15px 24px; color: var(--text-muted);">07 Jun, 20:45</td>
                       <td style="padding: 15px 24px; color: #fff;">Transmission #TRX-4478</td>
                       <td style="padding: 15px 24px; color: #fff;">Debit</td>
                       <td style="padding: 15px 24px; color: #ef4444;">-12.48</td>
                       <td style="padding: 15px 24px; color: #fff;">1,994.43</td>
                     </tr>
                     <tr>
                       <td style="padding: 15px 24px; color: var(--text-muted);">01 Jun, 12:00</td>
                       <td style="padding: 15px 24px; color: #fff;">Monthly Auto-Recharge</td>
                       <td style="padding: 15px 24px; color: #fff;">Credit</td>
                       <td style="padding: 15px 24px; color: #10b981;">+1000.00</td>
                       <td style="padding: 15px 24px; color: #fff;">2,006.91</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
             </div>
           </div>
        </div>
      </div>"""

# Page 10: Settings
view_settings = """      <div id="view-settings" class="dashboard-scroll view" style="display: none;">
        <div class="page-header" style="margin-bottom: 24px;">
          <h1 style="font-size: 24px; color: #fff; margin: 0; font-family: var(--font-space); letter-spacing: 1px;">Settings</h1>
          <p style="color: var(--text-muted); margin: 5px 0 0 0;">Account & system preferences</p>
        </div>

        <div class="grid-container" style="display: grid; gap: 24px;">
           <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
             <!-- Profile Section -->
             <div class="card" style="padding: 24px;">
               <h2 style="font-size: 14px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 20px;">PROFILE</h2>
               <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px;">
                 <div style="width: 80px; height: 80px; border-radius: 50%; background: #8b5cf6; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #fff; font-weight: bold;">AR</div>
                 <div>
                   <div style="background: rgba(139, 92, 246, 0.2); color: #8b5cf6; padding: 2px 8px; border-radius: 12px; font-size: 10px; display: inline-block; margin-bottom: 5px; font-weight: bold; border: 1px solid #8b5cf6;">PREMIUM CONSUMER</div>
                   <input type="text" value="Aditya Raj" style="display: block; width: 100%; background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.2); color: #fff; font-size: 18px; padding: 5px 0; margin-bottom: 10px;">
                 </div>
               </div>
               <div style="margin-bottom: 15px;">
                 <label style="color: var(--text-muted); font-size: 12px;">Email</label>
                 <input type="email" value="aditya@weta.io" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 10px; color: #fff; border-radius: 4px; margin-top: 5px;">
               </div>
               <div style="margin-bottom: 20px;">
                 <label style="color: var(--text-muted); font-size: 12px;">Phone</label>
                 <input type="text" value="+91-9876547890" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 10px; color: #fff; border-radius: 4px; margin-top: 5px;">
               </div>
               <button class="action-btn" style="border-color: #00e5ff; color: #00e5ff;">Save Profile</button>
             </div>

             <!-- Notification Preferences -->
             <div class="card" style="padding: 24px;">
               <h2 style="font-size: 14px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 20px;">NOTIFICATIONS</h2>
               <div style="display: flex; flex-direction: column; gap: 15px;">
                 <div style="display: flex; justify-content: space-between; align-items: center;">
                   <span style="color: #fff; font-size: 14px;">Transmission Start/End</span>
                   <div style="width: 40px; height: 20px; background: #00e5ff; border-radius: 10px; position: relative; cursor: pointer;">
                     <div style="width: 16px; height: 16px; background: #fff; border-radius: 50%; position: absolute; top: 2px; right: 2px;"></div>
                   </div>
                 </div>
                 <div style="display: flex; justify-content: space-between; align-items: center;">
                   <span style="color: #fff; font-size: 14px;">Low Balance Alert (< 100 Cr)</span>
                   <div style="width: 40px; height: 20px; background: #00e5ff; border-radius: 10px; position: relative; cursor: pointer;">
                     <div style="width: 16px; height: 16px; background: #fff; border-radius: 50%; position: absolute; top: 2px; right: 2px;"></div>
                   </div>
                 </div>
                 <div style="display: flex; justify-content: space-between; align-items: center;">
                   <span style="color: #fff; font-size: 14px;">Security Alerts</span>
                   <div style="width: 40px; height: 20px; background: #00e5ff; border-radius: 10px; position: relative; cursor: pointer;">
                     <div style="width: 16px; height: 16px; background: #fff; border-radius: 50%; position: absolute; top: 2px; right: 2px;"></div>
                   </div>
                 </div>
                 <div style="display: flex; justify-content: space-between; align-items: center;">
                   <span style="color: #fff; font-size: 14px;">System Health Alerts</span>
                   <div style="width: 40px; height: 20px; background: #00e5ff; border-radius: 10px; position: relative; cursor: pointer;">
                     <div style="width: 16px; height: 16px; background: #fff; border-radius: 50%; position: absolute; top: 2px; right: 2px;"></div>
                   </div>
                 </div>
                 <div style="display: flex; justify-content: space-between; align-items: center;">
                   <span style="color: #fff; font-size: 14px;">Weekly Usage Report</span>
                   <div style="width: 40px; height: 20px; background: rgba(255,255,255,0.1); border-radius: 10px; position: relative; cursor: pointer;">
                     <div style="width: 16px; height: 16px; background: #fff; border-radius: 50%; position: absolute; top: 2px; left: 2px;"></div>
                   </div>
                 </div>
                 <div style="display: flex; justify-content: space-between; align-items: center;">
                   <span style="color: #fff; font-size: 14px;">SMS Notifications</span>
                   <div style="width: 40px; height: 20px; background: rgba(255,255,255,0.1); border-radius: 10px; position: relative; cursor: pointer;">
                     <div style="width: 16px; height: 16px; background: #fff; border-radius: 50%; position: absolute; top: 2px; left: 2px;"></div>
                   </div>
                 </div>
               </div>
             </div>

             <!-- Security Settings -->
             <div class="card" style="padding: 24px;">
               <h2 style="font-size: 14px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 20px;">SECURITY</h2>
               <button class="action-btn" style="width: 100%; margin-bottom: 15px; justify-content: flex-start;">Change Password</button>
               <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                 <span style="color: #fff; font-size: 14px;">Two-Factor Authentication</span>
                 <button class="action-btn" style="border-color: #00e5ff; color: #00e5ff; padding: 5px 10px; font-size: 12px;">Enable</button>
               </div>
               <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                 <span style="color: #fff; font-size: 14px;">Active Sessions: 1</span>
                 <button class="action-btn" style="padding: 5px 10px; font-size: 12px;">View All</button>
               </div>
               <div style="display: flex; justify-content: space-between; align-items: center;">
                 <span style="color: #fff; font-size: 14px;">API Access: Disabled</span>
                 <button class="action-btn" style="padding: 5px 10px; font-size: 12px;">Enable</button>
               </div>
             </div>

             <!-- Device Configuration -->
             <div class="card" style="padding: 24px;">
               <h2 style="font-size: 14px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 20px;">DEVICE CONFIGURATION</h2>
               <div style="margin-bottom: 15px;">
                 <label style="color: var(--text-muted); font-size: 12px;">Node Name</label>
                 <input type="text" value="HOME-117" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 10px; color: #fff; border-radius: 4px; margin-top: 5px;">
               </div>
               <div style="margin-bottom: 15px;">
                 <label style="color: var(--text-muted); font-size: 12px;">Node ID (Read-only)</label>
                 <input type="text" value="N16R8-ESP32" disabled style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); padding: 10px; color: #666; border-radius: 4px; margin-top: 5px;">
               </div>
               <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                 <span style="color: #fff; font-size: 14px;">Auto-reconnect</span>
                 <div style="width: 40px; height: 20px; background: #00e5ff; border-radius: 10px; position: relative; cursor: pointer;">
                   <div style="width: 16px; height: 16px; background: #fff; border-radius: 50%; position: absolute; top: 2px; right: 2px;"></div>
                 </div>
               </div>
               <div style="margin-bottom: 15px;">
                 <label style="color: var(--text-muted); font-size: 12px; display: flex; justify-content: space-between;">Max Power Limit <span style="color: #00e5ff;">5000W</span></label>
                 <input type="range" min="1000" max="10000" step="500" value="5000" style="width: 100%; margin-top: 10px;">
               </div>
             </div>
             
             <!-- Danger Zone -->
             <div class="card" style="padding: 24px; border: 1px solid rgba(239, 68, 68, 0.3);">
               <h2 style="font-size: 14px; color: #ef4444; letter-spacing: 1px; margin-bottom: 20px;">DANGER ZONE</h2>
               <button class="action-btn" style="width: 100%; justify-content: flex-start; border-color: rgba(239, 68, 68, 0.5); color: #ef4444; margin-bottom: 10px;">Clear All Activity Logs</button>
               <button class="action-btn" style="width: 100%; justify-content: flex-start; border-color: rgba(239, 68, 68, 0.5); color: #ef4444; margin-bottom: 10px;">Reset Wallet History</button>
               <button class="action-btn" style="width: 100%; justify-content: flex-start; background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444;">Deactivate Account</button>
             </div>
           </div>
        </div>
      </div>"""

# Replace existing blocks
content = replace_view(content, "      <!-- REQUEST ELECTRICITY VIEW -->", "      <!-- TRANSMISSION STATUS VIEW -->", view_request)
content = replace_view(content, "      <!-- TRANSMISSION STATUS VIEW -->", "      <!-- SAFETY & SECURITY VIEW -->", view_transmission)

# Insert Live monitoring before Safety & Security
if "<!-- LIVE MONITORING VIEW -->" not in content:
    content = content.replace("      <!-- SAFETY & SECURITY VIEW -->", f"{view_monitoring}\n\n      <!-- SAFETY & SECURITY VIEW -->")

content = replace_view(content, "      <!-- SAFETY & SECURITY VIEW -->", "      <!-- DEVICE & RELAY VIEW -->", view_safety)
content = replace_view(content, "      <!-- DEVICE & RELAY VIEW -->", "      <!-- WALLET VIEW -->", view_device)
content = replace_view(content, "      <!-- WALLET VIEW -->", "      <!-- TIMELINE VIEW -->", view_wallet)
content = replace_view(content, "      <!-- TIMELINE VIEW -->", "      <!-- USAGE VIEW -->", view_timeline)
content = replace_view(content, "      <!-- USAGE VIEW -->", "      <!-- SETTINGS VIEW -->", view_usage)
content = replace_view(content, "      <!-- SETTINGS VIEW -->", "      <!-- BOTTOM SYSTEM FOOTER -->", view_settings)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Update complete")
