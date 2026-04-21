const THEME_KEY_MAP: Record<string, string> = {
  bg_color: '--tg-bg',
  text_color: '--tg-text',
  hint_color: '--tg-hint',
  link_color: '--tg-link',
  button_color: '--tg-button',
  button_text_color: '--tg-button-text',
  secondary_bg_color: '--tg-secondary-bg',
};

export function applyTelegramTheme(): void {
  const params = window.Telegram?.WebApp?.themeParams;
  if (!params) return;

  const root = document.documentElement;
  for (const [key, cssVar] of Object.entries(THEME_KEY_MAP)) {
    const value = params[key as keyof typeof params];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  }
}

export function initTelegramTheme(): void {
  applyTelegramTheme();
  window.Telegram?.WebApp?.onEvent('themeChanged', applyTelegramTheme);
}
