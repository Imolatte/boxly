import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { initTelegram } from './telegram/sdk';
import { initTelegramTheme } from './telegram/theme';
import { initializeGameStore } from './store/gameStore';

// Splash screen markup
const splashHtml = `
<div id="splash-screen" style="
  position: fixed; inset: 0; z-index: 9999;
  background: linear-gradient(160deg, #FAF7F2 0%, #F0EBE3 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
  transition: opacity 0.5s ease, transform 0.5s ease;
">
  <div style="
    width: 88px; height: 88px; border-radius: 26px;
    background: linear-gradient(150deg, #F2C8B2 0%, #E8B4A0 50%, #D89A84 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: inset 0 2px 0 rgba(255,255,255,0.4), 0 8px 32px rgba(232,180,160,0.5);
    animation: splash-pulse 2s ease-in-out infinite;
    font-size: 44px;
  ">🎁</div>
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <div style="font-size: 26px; font-weight: 800; color: #2A2620; letter-spacing: -0.5px; text-align: center;">Boxly</div>
    <div style="font-size: 13px; color: rgba(42,38,32,0.45); text-align: center; margin-top: 2px;">Собирай. Мёрджи. Коллекционируй.</div>
  </div>
  <div style="margin-top: 8px; display: flex; gap: 6px;">
    <span style="width: 6px; height: 6px; border-radius: 50%; background: #E8B4A0; animation: energy-pulse 1.2s ease-in-out infinite;"></span>
    <span style="width: 6px; height: 6px; border-radius: 50%; background: #E8B4A0; animation: energy-pulse 1.2s ease-in-out 0.2s infinite;"></span>
    <span style="width: 6px; height: 6px; border-radius: 50%; background: #E8B4A0; animation: energy-pulse 1.2s ease-in-out 0.4s infinite;"></span>
  </div>
</div>
`;

const splashEl = document.createElement('div');
splashEl.innerHTML = splashHtml;
document.body.appendChild(splashEl.firstElementChild!);

function hideSplash(): void {
  const splash = document.getElementById('splash-screen');
  if (!splash) return;
  splash.style.opacity = '0';
  splash.style.transform = 'scale(1.04)';
  setTimeout(() => splash.remove(), 520);
}

initTelegram();
initTelegramTheme();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);

initializeGameStore().then(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  // small delay so first paint isn't jarring
  setTimeout(hideSplash, 300);
});
