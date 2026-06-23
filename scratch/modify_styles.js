const fs = require('fs');
const path = require('path');

const cssPaths = [
  path.join(__dirname, '..', 'frontend', 'profile.css'),
  path.join(__dirname, '..', 'android-app', 'app', 'src', 'main', 'assets', 'frontend', 'profile.css')
];

const newStyles = `
/* ─── Simulation Page Layout & Components ─── */
.simulations-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 20px;
}

@media (max-width: 900px) {
  .simulations-layout {
    grid-template-columns: 1fr;
  }
}

.sim-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  backdrop-filter: var(--glass);
  transition: border-color var(--transition), box-shadow var(--transition);
}

.sim-card:hover {
  border-color: var(--border-hover);
  box-shadow: 0 8px 32px rgba(0, 229, 255, 0.05);
}

.sim-card-title {
  font-size: 15.5px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 16px 0;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sim-club-details {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sim-club-badge {
  width: 64px;
  height: 64px;
  background: rgba(68, 138, 255, 0.05);
  border: 1px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.sim-club-info h4 {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 4px 0;
}

.sim-club-info p {
  font-size: 12px;
  color: var(--text-2);
  margin: 0 0 8px 0;
}

.badge-style {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(68, 138, 255, 0.1));
  border: 1px solid var(--primary);
  color: var(--primary);
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  display: inline-block;
}

.fixtures-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fixture-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(68, 138, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  transition: all var(--transition);
}

.fixture-item:hover {
  background: rgba(0, 229, 255, 0.05);
  border-color: var(--primary);
  transform: translateX(4px);
}

.fixture-teams {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fixture-vs {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.fixture-vs span {
  color: var(--primary);
  margin: 0 4px;
}

.fixture-info {
  font-size: 11px;
  color: var(--text-3);
}

.btn-fixture-sim {
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid var(--border);
  color: var(--primary);
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition);
}

.btn-fixture-sim:hover {
  background: var(--primary);
  color: #040911;
  border-color: var(--primary);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
}

.arena-setup {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 30px 0;
  background: rgba(4, 9, 17, 0.4);
  border-radius: var(--radius-lg);
  padding: 20px;
  border: 1px solid var(--border);
}

.arena-team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 40%;
  text-align: center;
}

.arena-badge {
  font-size: 38px;
  background: rgba(68, 138, 255, 0.02);
  border: 1.5px solid var(--border);
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
}

.arena-team.home .arena-badge {
  background: rgba(0, 229, 255, 0.08);
  border-color: var(--primary);
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.15);
}

.arena-team.away .arena-badge.active-away {
  background: rgba(255, 61, 0, 0.08);
  border-color: var(--orange);
  box-shadow: 0 0 15px rgba(255, 61, 0, 0.15);
}

.arena-team-name {
  font-size: 14.5px;
  font-weight: 800;
  color: #fff;
}

.arena-rating {
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
  background: rgba(0, 229, 255, 0.08);
  padding: 2px 8px;
  border-radius: 10px;
}

.arena-vs {
  font-size: 18px;
  font-weight: 900;
  color: var(--text-3);
  font-style: italic;
}

.arena-select-wrap {
  width: 100%;
  max-width: 150px;
}

.arena-select {
  width: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: #fff;
  padding: 6px 10px;
  font-size: 12px;
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition);
}

.arena-select:focus {
  border-color: var(--primary);
}

.btn-sim-start {
  margin-top: 10px;
  width: 100%;
}

.btn-sim-start:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-sim-start:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sim-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(4, 9, 17, 0.96);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--radius-lg);
  backdrop-filter: blur(5px);
}

.sim-loading-content {
  text-align: center;
  max-width: 400px;
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sim-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-left-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.sim-progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 10px;
  overflow: hidden;
  margin: 15px 0;
}

.sim-progress-fill {
  width: 0%;
  height: 100%;
  background: linear-gradient(90deg, var(--blue), var(--primary));
  border-radius: 10px;
  transition: width 0.1s linear;
}

.sim-loading-detail {
  font-size: 11px;
  color: var(--text-3);
}

/* ─── Simulation Results Modal Styles ─── */
.modal-lg {
  max-width: 900px !important;
  width: 95% !important;
  padding: 30px !important;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.results-tag {
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid var(--border);
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.5px;
  display: inline-block;
}

.score-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin: 20px 0 35px 0;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 25px;
  border: 1px solid var(--border);
}

.score-team {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 35%;
  text-align: center;
}

.score-team-name {
  font-size: 20px;
  font-weight: 900;
  color: #fff;
}

.score-team-style {
  font-size: 10.5px;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
}

.score-numbers {
  display: flex;
  align-items: center;
  gap: 15px;
}

.score-num {
  font-size: 42px;
  font-weight: 900;
  color: #fff;
  background: rgba(68, 138, 255, 0.04);
  border: 1.5px solid var(--border);
  width: 72px;
  height: 72px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}

.score-dash {
  font-size: 28px;
  font-weight: 900;
  color: var(--text-3);
}

.prob-section {
  margin-bottom: 35px;
}

.prob-title {
  font-size: 12.5px;
  color: var(--text-2);
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 10px;
  text-align: center;
}

.prob-bar-container {
  display: flex;
  height: 24px;
  border-radius: 20px;
  overflow: hidden;
  font-size: 11px;
  font-weight: 800;
  border: 1px solid var(--border);
}

.prob-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.3s ease;
}

.prob-bar.win {
  background: var(--green);
  color: #040911;
}

.prob-bar.draw {
  background: rgba(255, 255, 255, 0.15);
  color: var(--text-1);
}

.prob-bar.lose {
  background: var(--red);
  color: var(--text-1);
}

.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

@media (max-width: 800px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
}

.grid-col-title {
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 16px 0;
  border-left: 3px solid var(--primary);
  padding-left: 8px;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(68, 138, 255, 0.02);
  border-radius: var(--radius-lg);
  padding: 16px;
  border: 1px solid var(--border);
}

.timeline-item {
  display: flex;
  gap: 12px;
  font-size: 12.5px;
  color: var(--text-2);
}

.timeline-minute {
  font-weight: 800;
  color: var(--primary);
  min-width: 32px;
}

.tactical-advice {
  background: rgba(0, 229, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.advice-item {
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: var(--text-2);
  line-height: 1.5;
}

.advice-bullet {
  color: var(--primary);
  font-weight: bold;
}

.results-squad-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
}

.sim-player-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sim-player-pos {
  font-size: 9px;
  font-weight: 800;
  color: var(--primary);
  background: rgba(0, 229, 255, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.sim-player-name {
  font-size: 11.5px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin-bottom: 2px;
}

.sim-player-rating {
  font-size: 10px;
  color: var(--green);
  font-weight: 600;
}

.tactical-radar-grid-mini {
  background-image: radial-gradient(circle, rgba(0, 229, 255, 0.08) 1px, transparent 1px);
  background-size: 12px 12px;
  position: absolute;
  inset: 0;
  z-index: -1;
}
`;

cssPaths.forEach(cssPath => {
  if (!fs.existsSync(cssPath)) {
    console.log(`CSS file not found: ${cssPath}`);
    return;
  }
  
  const content = fs.readFileSync(cssPath, 'utf8');
  
  // Find where .sim-card starts
  const targetIndex = content.indexOf('.sim-card {');
  if (targetIndex === -1) {
    console.error(`ERROR: Could not find .sim-card in ${cssPath}`);
    return;
  }
  
  // Cut the content before .sim-card and append newStyles
  const part1 = content.substring(0, targetIndex);
  const updatedContent = part1.trim() + '\n' + newStyles.trim() + '\n';
  
  fs.writeFileSync(cssPath, updatedContent, 'utf8');
  console.log(`Updated CSS in ${cssPath}`);
});

console.log('Done with CSS files.');
