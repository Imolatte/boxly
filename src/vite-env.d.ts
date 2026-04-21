/// <reference types="vite/client" />

interface TelegramHapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy'): void;
  notificationOccurred(type: 'success' | 'warning' | 'error'): void;
  selectionChanged(): void;
}

interface TelegramCloudStorage {
  setItem(key: string, value: string, callback?: (error: string | null, stored: boolean) => void): void;
  getItem(key: string, callback: (error: string | null, value: string) => void): void;
  removeItem(key: string, callback?: (error: string | null, removed: boolean) => void): void;
}

interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

interface TelegramInitDataUnsafe {
  user?: TelegramUser;
}

interface TelegramBackButton {
  isVisible: boolean;
  show(): void;
  hide(): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
}

interface TelegramWebApp {
  HapticFeedback: TelegramHapticFeedback;
  CloudStorage: TelegramCloudStorage;
  themeParams: TelegramThemeParams;
  initData: string;
  initDataUnsafe: TelegramInitDataUnsafe;
  BackButton: TelegramBackButton;
  ready(): void;
  expand(): void;
  onEvent(eventType: string, callback: () => void): void;
}

interface TelegramObject {
  WebApp: TelegramWebApp;
}

interface Window {
  Telegram?: TelegramObject;
}
