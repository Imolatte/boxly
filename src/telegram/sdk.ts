export function initTelegram(): void {
  const wa = window.Telegram?.WebApp;
  if (!wa) return;
  wa.ready();
  wa.expand();
  // WHY: Bot API 7.7+ — prevents Telegram from intercepting vertical swipes as "minimize"
  // gesture, which would steal touch events from dnd-kit drag on mobile.
  if (typeof wa.disableVerticalSwipes === 'function') wa.disableVerticalSwipes();
}

export function getTelegramUser(): {
  id: number;
  first_name: string;
  username?: string;
  photo_url?: string;
} | null {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!user) return null;
  return {
    id: user.id,
    first_name: user.first_name,
    username: user.username,
    photo_url: user.photo_url,
  };
}

export function isTelegramEnv(): boolean {
  return Boolean(window.Telegram?.WebApp?.initData);
}

export function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? '';
}
