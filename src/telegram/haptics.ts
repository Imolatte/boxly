type ImpactStyle = 'light' | 'medium' | 'heavy';
type NotificationType = 'success' | 'warning' | 'error';

function getHaptic(): TelegramHapticFeedback | null {
  return window.Telegram?.WebApp?.HapticFeedback ?? null;
}

export function impact(style: ImpactStyle): void {
  getHaptic()?.impactOccurred(style);
}

export function notification(type: NotificationType): void {
  getHaptic()?.notificationOccurred(type);
}

export function selection(): void {
  getHaptic()?.selectionChanged();
}
